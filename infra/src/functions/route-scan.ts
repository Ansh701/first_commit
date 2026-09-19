import type { EventBridgeEvent } from "aws-lambda";
import { createHash } from "node:crypto";
import { Logger } from "@aws-lambda-powertools/logger";
import { MetricUnit, Metrics } from "@aws-lambda-powertools/metrics";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { z } from "zod";

const logger = new Logger({ serviceName: "insips-scan-router" });
const metrics = new Metrics({
  namespace: "INSIPS/Passport",
  serviceName: "scan-router",
});
const sfn = new SFNClient({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const detailSchema = z.object({
  scanStatus: z.string(),
  s3ObjectDetails: z.object({
    bucketName: z.string(),
    objectKey: z.string(),
    eTag: z.string().optional(),
  }),
  scanResultDetails: z.object({
    scanResultStatus: z.enum([
      "NO_THREATS_FOUND",
      "THREATS_FOUND",
      "UNSUPPORTED",
      "ACCESS_DENIED",
      "FAILED",
    ]),
  }),
});

type ScanEvent = EventBridgeEvent<
  "GuardDuty Malware Protection Object Scan Result",
  z.infer<typeof detailSchema>
>;

export function parseEvidenceObjectKey(objectKey: string) {
  const match = /^quarantine\/([a-zA-Z0-9_-]{1,80})\/([a-f0-9]{32})\.pdf$/.exec(
    objectKey,
  );
  if (!match) throw new Error("INVALID_EVIDENCE_OBJECT_KEY");
  return { organizationId: match[1], evidenceId: match[2] };
}

export function scanResultToState(
  result: z.infer<typeof detailSchema>["scanResultDetails"]["scanResultStatus"],
) {
  return result === "NO_THREATS_FOUND"
    ? "CLEAN"
    : result === "THREATS_FOUND"
      ? "INFECTED"
      : "SCAN_FAILED";
}

export async function handler(event: ScanEvent): Promise<void> {
  const parsed = detailSchema.safeParse(event.detail);
  if (!parsed.success) {
    metrics.addMetric("InvalidScanEvents", MetricUnit.Count, 1);
    logger.error("Rejected malformed GuardDuty event", {
      issues: parsed.error.issues.map((issue) => issue.code),
    });
    throw new Error("INVALID_SCAN_EVENT");
  }

  const { s3ObjectDetails, scanResultDetails } = parsed.data;
  const result = scanResultDetails.scanResultStatus;
  const { organizationId, evidenceId } = parseEvidenceObjectKey(
    s3ObjectDetails.objectKey,
  );
  const objectDigest = createHash("sha256")
    .update(`${s3ObjectDetails.bucketName}/${s3ObjectDetails.objectKey}`)
    .digest("hex");
  logger.appendKeys({ objectDigest, scanResult: result, eventId: event.id });

  const safeState = scanResultToState(result);
  await ddb.send(
    new UpdateCommand({
      TableName: process.env.APP_TABLE_NAME,
      Key: { pk: `ORG#${organizationId}`, sk: `EVIDENCE#${evidenceId}` },
      UpdateExpression:
        "SET #state = :state, scanResult = :result, scanEventId = :eventId, objectDigest = :objectDigest, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#state": "state" },
      ExpressionAttributeValues: {
        ":state": safeState,
        ":result": result,
        ":eventId": event.id,
        ":objectDigest": objectDigest,
        ":updatedAt": event.time,
      },
      ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
    }),
  );

  if (result !== "NO_THREATS_FOUND") {
    metrics.addMetric(
      result === "THREATS_FOUND" ? "InfectedUploads" : "ScanFailures",
      MetricUnit.Count,
      1,
    );
    logger.warn("Document remains blocked after scan");
    metrics.publishStoredMetrics();
    return;
  }

  try {
    await sfn.send(
      new StartExecutionCommand({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        name: `evidence-${objectDigest.slice(0, 48)}`,
        input: JSON.stringify({
          scanResultStatus: result,
          bucket: s3ObjectDetails.bucketName,
          key: s3ObjectDetails.objectKey,
          objectDigest,
          organizationId,
          evidenceId,
        }),
      }),
    );
  } catch (error) {
    if (!(error instanceof Error) || error.name !== "ExecutionAlreadyExists")
      throw error;
    logger.info("Duplicate clean scan event ignored");
    return;
  }
  metrics.addMetric("CleanDocumentsRouted", MetricUnit.Count, 1);
  logger.info("Clean document routed to evidence workflow");
  metrics.publishStoredMetrics();
}

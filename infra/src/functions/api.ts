import type {
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createHash } from "node:crypto";
import { z } from "zod";

const logger = new Logger({ serviceName: "insips-api" });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});
const appTableName = process.env.APP_TABLE_NAME ?? "";
const evidenceBucketName = process.env.EVIDENCE_BUCKET_NAME ?? "";
const uploadIntentSchema = z.object({
  displayName: z.string().min(1).max(160),
  declaredContentType: z.literal("application/pdf"),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024),
});
const organizationIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);

function safeDisplayName(name: string): string | null {
  const basename = name.split(/[\\/]/).pop()?.trim() ?? "";
  const withoutControls = Array.from(basename)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
  const safe = withoutControls
    .replace(/[^a-zA-Z0-9._() -]/g, "_")
    .slice(0, 120);
  return safe && safe.toLowerCase().endsWith(".pdf") ? safe : null;
}

function response(
  statusCode: number,
  body: Record<string, unknown>,
): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

export async function handler(
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
): Promise<APIGatewayProxyStructuredResultV2> {
  const requestId = event.requestContext.requestId;
  if (!appTableName || !evidenceBucketName)
    throw new Error("REQUIRED_ENVIRONMENT_MISSING");
  logger.appendKeys({ requestId, routeKey: event.routeKey });

  if (event.rawPath === "/health") {
    return response(200, { status: "ok", service: "insips-api" });
  }

  const subject = event.requestContext.authorizer?.jwt?.claims?.sub;
  if (!subject) {
    logger.warn("Request reached handler without an authenticated subject");
    return response(401, {
      code: "AUTH_REQUIRED",
      message: "Your session is missing or expired.",
    });
  }

  if (
    event.requestContext.http.method === "POST" &&
    event.rawPath === "/evidence/upload-intent"
  ) {
    const idempotencyKey = event.headers["idempotency-key"];
    if (
      !idempotencyKey ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 128
    ) {
      return response(400, {
        code: "IDEMPOTENCY_KEY_REQUIRED",
        message: "Start the upload again from the evidence page.",
      });
    }

    let body: unknown;
    try {
      body = JSON.parse(event.body ?? "{}");
    } catch {
      return response(400, {
        code: "INVALID_REQUEST",
        message: "The upload request was not valid JSON.",
      });
    }
    const parsed = uploadIntentSchema.safeParse(body);
    const displayName = parsed.success
      ? safeDisplayName(parsed.data.displayName)
      : null;
    if (!parsed.success || !displayName) {
      return response(400, {
        code: "INVALID_PDF",
        message: "Choose a PDF no larger than 10 MB.",
      });
    }

    const membership = await ddb.send(
      new GetCommand({
        TableName: appTableName,
        Key: { pk: `USER#${subject}`, sk: "ACTIVE_MEMBERSHIP" },
        ConsistentRead: true,
      }),
    );
    const organizationId = organizationIdSchema.safeParse(
      membership.Item?.organizationId,
    );
    const role = membership.Item?.role;
    if (!organizationId.success || role !== "ORG_ADMIN") {
      logger.warn("Upload intent denied by membership policy");
      return response(403, {
        code: "UPLOAD_FORBIDDEN",
        message: "You do not have permission to add evidence.",
      });
    }

    const evidenceId = createHash("sha256")
      .update(`${subject}:${idempotencyKey}`)
      .digest("hex")
      .slice(0, 32);
    const objectKey = `quarantine/${organizationId.data}/${evidenceId}.pdf`;
    const now = new Date().toISOString();
    try {
      await ddb.send(
        new PutCommand({
          TableName: appTableName,
          Item: {
            pk: `ORG#${organizationId.data}`,
            sk: `EVIDENCE#${evidenceId}`,
            evidenceId,
            organizationId: organizationId.data,
            displayName,
            declaredContentType: parsed.data.declaredContentType,
            expectedSize: parsed.data.size,
            state: "CREATED",
            createdBy: subject,
            createdAt: now,
            gsi1pk: `ORG#${organizationId.data}#EVIDENCE`,
            gsi1sk: `${now}#${evidenceId}`,
            version: 1,
          },
          ConditionExpression:
            "attribute_not_exists(pk) AND attribute_not_exists(sk)",
        }),
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.name !== "ConditionalCheckFailedException"
      )
        throw error;
    }

    const upload = await createPresignedPost(s3, {
      Bucket: evidenceBucketName,
      Key: objectKey,
      Expires: 300,
      Fields: {
        "Content-Type": "application/pdf",
        "x-amz-meta-evidence-id": evidenceId,
      },
      Conditions: [
        ["content-length-range", 1, 10 * 1024 * 1024],
        ["eq", "$Content-Type", "application/pdf"],
        ["eq", "$x-amz-meta-evidence-id", evidenceId],
      ],
    });
    logger.info("Created constrained upload intent", {
      evidenceId,
      organizationId: organizationId.data,
    });
    return response(201, {
      evidenceId,
      displayName,
      upload,
      expiresInSeconds: 300,
    });
  }

  logger.info(
    "Authenticated API route is not yet connected to a domain handler",
  );
  return response(501, {
    code: "ROUTE_NOT_IMPLEMENTED",
    message: "This deployment route is not available yet.",
    requestId,
  });
}

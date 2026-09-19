import { Logger } from "@aws-lambda-powertools/logger";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  StartDocumentTextDetectionCommand,
  TextractClient,
} from "@aws-sdk/client-textract";
import { z } from "zod";

const logger = new Logger({ serviceName: "insips-start-extraction" });
const textract = new TextractClient({});
const s3 = new S3Client({});
const inputSchema = z.object({
  scanResultStatus: z.literal("NO_THREATS_FOUND"),
  bucket: z.string().min(3),
  key: z.string().min(1),
  objectDigest: z.string().length(64),
});

export async function handler(event: unknown) {
  const input = inputSchema.parse(event);
  logger.appendKeys({ objectDigest: input.objectDigest });
  if (!input.key.toLowerCase().endsWith(".pdf"))
    throw new Error("UNSUPPORTED_EXTENSION");
  const prefix = await s3.send(
    new GetObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
      Range: "bytes=0-4",
    }),
  );
  const signature = prefix.Body ? await prefix.Body.transformToString() : "";
  if (signature !== "%PDF-") throw new Error("INVALID_PDF_SIGNATURE");
  const result = await textract.send(
    new StartDocumentTextDetectionCommand({
      DocumentLocation: { S3Object: { Bucket: input.bucket, Name: input.key } },
      ClientRequestToken: input.objectDigest.slice(0, 64),
      JobTag: `insips-${input.objectDigest.slice(0, 24)}`,
    }),
  );
  if (!result.JobId) throw new Error("TEXTRACT_JOB_ID_MISSING");
  logger.info("Textract job started", { jobId: result.JobId });
  return { ...input, jobId: result.JobId };
}

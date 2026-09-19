import { Logger } from "@aws-lambda-powertools/logger";
import {
  GetDocumentTextDetectionCommand,
  TextractClient,
} from "@aws-sdk/client-textract";
import { z } from "zod";

const logger = new Logger({ serviceName: "insips-get-extraction" });
const textract = new TextractClient({});
const inputSchema = z.object({
  scanResultStatus: z.literal("NO_THREATS_FOUND"),
  bucket: z.string(),
  key: z.string(),
  objectDigest: z.string().length(64),
  jobId: z.string(),
});

export async function handler(event: unknown) {
  const input = inputSchema.parse(event);
  logger.appendKeys({ objectDigest: input.objectDigest, jobId: input.jobId });
  let token: string | undefined;
  const lines: string[] = [];
  let status: string | undefined;

  for (let page = 0; page < 5; page += 1) {
    const result = await textract.send(
      new GetDocumentTextDetectionCommand({
        JobId: input.jobId,
        NextToken: token,
        MaxResults: 1000,
      }),
    );
    status = result.JobStatus;
    if (status === "IN_PROGRESS")
      return { ...input, extractionStatus: "IN_PROGRESS" };
    if (status !== "SUCCEEDED")
      throw new Error(`TEXTRACT_${status ?? "UNKNOWN"}`);
    for (const block of result.Blocks ?? []) {
      if (
        block.BlockType === "LINE" &&
        block.Text &&
        lines.join("\n").length < 25_000
      )
        lines.push(block.Text);
    }
    token = result.NextToken;
    if (!token) break;
  }

  const extractedText = lines.join("\n").slice(0, 25_000);
  if (!extractedText) throw new Error("TEXTRACT_EMPTY_RESULT");
  logger.info("Textract result collected", {
    characters: extractedText.length,
  });
  return { ...input, extractionStatus: "SUCCEEDED", extractedText };
}

import type {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
} from "aws-lambda";
import {
  BeginTransactionCommand,
  CommitTransactionCommand,
  ExecuteStatementCommand,
  RDSDataClient,
  RollbackTransactionCommand,
} from "@aws-sdk/client-rds-data";
import { readFileSync } from "node:fs";
import path from "node:path";

const rds = new RDSDataClient({});
const resourceArn = process.env.DATABASE_CLUSTER_ARN ?? "";
const secretArn = process.env.DATABASE_SECRET_ARN ?? "";
const database = process.env.DATABASE_NAME ?? "insips";
const migrations = [
  "001_product_core",
  "002_content_foundation",
  "003_content_seed",
  "004_site_content_seed",
] as const;

export async function handler(
  event: CloudFormationCustomResourceEvent,
): Promise<Partial<CloudFormationCustomResourceResponse>> {
  if (event.RequestType === "Delete") {
    return { PhysicalResourceId: "insips-product-schema" };
  }
  if (!resourceArn || !secretArn)
    throw new Error("DATABASE_ENVIRONMENT_MISSING");

  await rds.send(
    new ExecuteStatementCommand({
      resourceArn,
      secretArn,
      database,
      sql: `CREATE TABLE IF NOT EXISTS schema_migrations (
              id text PRIMARY KEY,
              applied_at timestamptz NOT NULL DEFAULT now()
            )`,
    }),
  );
  for (const migrationId of migrations) {
    const existing = await rds.send(
      new ExecuteStatementCommand({
        resourceArn,
        secretArn,
        database,
        sql: "SELECT id FROM schema_migrations WHERE id = :id",
        parameters: [{ name: "id", value: { stringValue: migrationId } }],
      }),
    );
    if (existing.records?.length) continue;

    const sqlPath = path.join(
      process.env.LAMBDA_TASK_ROOT ?? "/var/task",
      `${migrationId}.sql`,
    );
    const statements = readFileSync(sqlPath, "utf8")
      .replace(/^BEGIN;|COMMIT;$/gm, "")
      .split(";")
      .map((statement) => statement.trim())
      .filter(Boolean);
    const started = await rds.send(
      new BeginTransactionCommand({ resourceArn, secretArn, database }),
    );
    const transactionId = started.transactionId;
    if (!transactionId) throw new Error("MIGRATION_TRANSACTION_NOT_STARTED");

    try {
      for (const sql of statements) {
        await rds.send(
          new ExecuteStatementCommand({
            resourceArn,
            secretArn,
            database,
            transactionId,
            sql,
          }),
        );
      }
      await rds.send(
        new ExecuteStatementCommand({
          resourceArn,
          secretArn,
          database,
          transactionId,
          sql: "INSERT INTO schema_migrations (id) VALUES (:id)",
          parameters: [{ name: "id", value: { stringValue: migrationId } }],
        }),
      );
      await rds.send(
        new CommitTransactionCommand({ resourceArn, secretArn, transactionId }),
      );
    } catch (error) {
      await rds.send(
        new RollbackTransactionCommand({ resourceArn, secretArn, transactionId }),
      );
      throw error;
    }
  }
  return { PhysicalResourceId: "insips-product-schema" };
}

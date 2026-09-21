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

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let statementStart = 0;
  let quote: "'" | '"' | null = null;
  let dollarQuote: string | null = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const character = sql[index];
    const nextCharacter = sql[index + 1];

    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && nextCharacter === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (dollarQuote) {
      if (sql.startsWith(dollarQuote, index)) {
        index += dollarQuote.length - 1;
        dollarQuote = null;
      }
      continue;
    }
    if (!quote && character === "-" && nextCharacter === "-") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (!quote && character === "/" && nextCharacter === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (quote) {
      if (character === quote && nextCharacter === quote) {
        index += 1;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === "'" || character === '"') {
      quote = character;
      continue;
    }
    if (character === "$") {
      const tag = sql.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0];
      if (tag) {
        dollarQuote = tag;
        index += tag.length - 1;
        continue;
      }
    }
    if (character === ";") {
      const statement = sql.slice(statementStart, index).trim();
      if (statement) statements.push(statement);
      statementStart = index + 1;
    }
  }

  const finalStatement = sql.slice(statementStart).trim();
  if (finalStatement) statements.push(finalStatement);
  return statements;
}

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
    const migrationSql = readFileSync(sqlPath, "utf8").replace(
      /^BEGIN;|COMMIT;$/gm,
      "",
    );
    const statements = splitSqlStatements(migrationSql);
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

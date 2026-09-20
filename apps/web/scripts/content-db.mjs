import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const command = process.argv[2] ?? "seed";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for local content database commands.");
}
if (command === "reset" && (process.env.NODE_ENV === "production" || process.env.INSIPS_ALLOW_DB_RESET !== "true")) {
  throw new Error("Refusing database reset. Set INSIPS_ALLOW_DB_RESET=true in a non-production environment.");
}
if (!new Set(["seed", "reset"]).has(command)) {
  throw new Error(`Unknown content database command: ${command}`);
}

const sql = postgres(databaseUrl, { max: 1, prepare: false });
const root = path.resolve(new URL("../..", import.meta.url).pathname, "..");
const migrationDirectory = path.resolve(root, "infra/sql");
const migrations = ["001_product_core", "002_content_foundation", "003_content_seed", "004_site_content_seed"];

const executeFile = async (migration) => {
  const source = await readFile(path.join(migrationDirectory, `${migration}.sql`), "utf8");
  const statements = source
    .replace(/^BEGIN;|COMMIT;$/gm, "")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.unsafe(statement);
};

try {
  if (command === "reset") {
    await sql.unsafe("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  }
  for (const migration of migrations) await executeFile(migration);
  console.log(`INSIPS local database ${command} complete.`);
} finally {
  await sql.end({ timeout: 5 });
}

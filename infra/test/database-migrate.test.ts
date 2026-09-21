import { describe, expect, it } from "vitest";
import { splitSqlStatements } from "../src/functions/database-migrate.js";

describe("database migration SQL splitting", () => {
  it("keeps dollar-quoted procedural blocks together", () => {
    const sql = `
      CREATE TABLE example (id integer);
      DO $$ BEGIN
        PERFORM 1;
      EXCEPTION WHEN others THEN
        NULL;
      END $$;
      INSERT INTO example (id) VALUES (1);
    `;

    expect(splitSqlStatements(sql)).toEqual([
      "CREATE TABLE example (id integer)",
      `DO $$ BEGIN
        PERFORM 1;
      EXCEPTION WHEN others THEN
        NULL;
      END $$`,
      "INSERT INTO example (id) VALUES (1)",
    ]);
  });

  it("keeps semicolons inside quoted values in one statement", () => {
    expect(
      splitSqlStatements("INSERT INTO example (value) VALUES ('keep; this'); SELECT 1;"),
    ).toEqual([
      "INSERT INTO example (value) VALUES ('keep; this')",
      "SELECT 1",
    ]);
  });
});

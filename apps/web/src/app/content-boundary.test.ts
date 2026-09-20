import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return routeFiles(entryPath);
    return entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")
      ? [entryPath]
      : [];
  });
}

describe("production route content boundary", () => {
  it("does not let route files import hardcoded demo arrays", () => {
    const appRoot = path.resolve(import.meta.dirname);
    const offenders = routeFiles(appRoot).filter((filePath) =>
      /@\/lib\/(demo-data|platform-demo-data)/.test(readFileSync(filePath, "utf8")),
    );
    expect(offenders.map((filePath) => path.relative(appRoot, filePath))).toEqual([]);
  });
});

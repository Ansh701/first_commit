import { describe, expect, it } from "vitest";
import { seedCauses, seedOrganizations, seedPosts } from "./content-seed";

describe("local content seed", () => {
  it("contains public-safe organization, cause, and feed records", () => {
    expect(seedOrganizations.length).toBeGreaterThanOrEqual(3);
    expect(seedCauses.length).toBeGreaterThanOrEqual(3);
    expect(seedPosts.length).toBeGreaterThanOrEqual(3);
    expect(JSON.stringify(seedOrganizations)).not.toMatch(/privateObject|extractedText|reviewerNote|signedUrl/i);
  });
});

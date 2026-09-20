import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  getPublicOrganization,
  getPublicOrganizations,
  getPublishedCauses,
  getPublishedFeed,
} from "./content-repository";

describe("content repository", () => {
  it("serves the same safe projection shape in local mode", async () => {
    const organizations = await getPublicOrganizations({ query: "Udaan" });
    expect(organizations).toHaveLength(1);
    expect(organizations[0]).toMatchObject({ slug: "udaan-learning-foundation" });
    expect(organizations[0]).not.toHaveProperty("privateObjectKey");
  });

  it("returns organization profile detail without restricted fields", async () => {
    const organization = await getPublicOrganization("udaan-learning-foundation");
    expect(organization?.trustIndicators[0]).toMatchObject({ status: "APPROVED" });
    expect(JSON.stringify(organization)).not.toMatch(/privateObject|extractedText|reviewerNote|signedUrl/i);
  });

  it("supports bounded cause and feed reads", async () => {
    const causes = await getPublishedCauses({ limit: 2 });
    const feed = await getPublishedFeed({ limit: 2 });
    expect(causes).toHaveLength(2);
    expect(feed.items).toHaveLength(2);
    expect(feed.items[0].href).toMatch(/^\//);
  });
});

import { describe, expect, it } from "vitest";
import {
  publicMediaSchema,
  publicOrganizationProfileSchema,
  publicOrganizationSummarySchema,
} from "./content";

describe("public content contracts", () => {
  it("accepts permissioned public media with stable dimensions", () => {
    expect(
      publicMediaSchema.parse({
        id: "media-1",
        type: "IMAGE",
        title: "A public image",
        alt: "A descriptive public image",
        canonicalUrl: "/media/image.png",
        sourceUrl: "/media/image.png",
        provider: "Local seed",
        permission: "LOCAL_FIXTURE",
        publishingState: "PUBLISHED",
        width: 1200,
        height: 800,
      }).width,
    ).toBe(1200);
  });

  it("does not allow restricted object fields into public projections", () => {
    const result = publicOrganizationSummarySchema.safeParse({
      slug: "safe-org",
      displayName: "Safe organization",
      summary: "A sufficiently long public summary that describes the organization without restricted details.",
      location: "Pune, Maharashtra",
      focusAreas: ["Education"],
      logoMark: "SO",
      disclosure: "Independent public directory record.",
      approvedIndicatorCount: 1,
      privateObjectKey: "quarantine/private.pdf",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).not.toHaveProperty("privateObjectKey");
  });

  it("requires approved indicators to carry scope and review date", () => {
    expect(
      publicOrganizationProfileSchema.safeParse({
        slug: "safe-org",
        displayName: "Safe organization",
        summary: "A sufficiently long public summary that describes the organization without restricted details.",
        location: "Pune, Maharashtra",
        focusAreas: ["Education"],
        logoMark: "SO",
        disclosure: "Independent public directory record.",
        approvedIndicatorCount: 1,
        officialSocials: [],
        media: [],
        posts: [],
        causes: [],
        trustIndicators: [{
          id: "indicator-1",
          label: "Registration",
          value: "Current",
          meaning: "A reviewer matched the value to submitted evidence.",
          scope: "Registration",
          reviewedAt: "19 September 2026",
          status: "APPROVED",
        }],
      }).success,
    ).toBe(true);
  });
});

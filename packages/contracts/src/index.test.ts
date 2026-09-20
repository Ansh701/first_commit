import { describe, expect, it } from "vitest";
import {
  authorize,
  canTransitionClaim,
  canTransitionDocument,
  compassResultSchema,
  toPublicProjection,
  type Actor,
  type ReviewedClaim,
} from "./index";

const future = Date.now() + 60_000;

describe("authorization policy", () => {
  const orgA: Actor = {
    userId: "user-a",
    role: "ORGANIZATION_ADMIN",
    memberships: [
      {
        tenantId: "org-a",
        tenantType: "ORGANIZATION",
        permission: "ADMIN",
        status: "ACTIVE",
      },
    ],
    sessionExpiresAt: future,
  };

  it("prevents cross-tenant reads and writes", () => {
    expect(authorize(orgA, "profile:read", { organizationId: "org-a" })).toBe(
      true,
    );
    expect(authorize(orgA, "profile:read", { organizationId: "org-b" })).toBe(
      false,
    );
    expect(
      authorize(orgA, "evidence:upload", { organizationId: "org-b" }),
    ).toBe(false);
  });

  it("prevents organizations from approving their own claims", () => {
    expect(authorize(orgA, "review:decide", { organizationId: "org-a" })).toBe(
      false,
    );
  });

  it("requires reviewer assignment where one exists", () => {
    const reviewer: Actor = {
      userId: "reviewer-a",
      role: "REVIEWER",
      memberships: [],
      sessionExpiresAt: future,
    };
    expect(
      authorize(reviewer, "review:decide", {
        assignedReviewerId: "reviewer-a",
      }),
    ).toBe(true);
    expect(
      authorize(reviewer, "review:decide", {
        assignedReviewerId: "reviewer-b",
      }),
    ).toBe(false);
  });

  it("fails closed for expired sessions", () => {
    expect(
      authorize({ ...orgA, sessionExpiresAt: 0 }, "profile:read", {
        organizationId: "org-a",
      }),
    ).toBe(false);
  });

  it("keeps donor history owner-scoped", () => {
    const donor: Actor = {
      userId: "donor-a",
      role: "INDIVIDUAL_DONOR",
      memberships: [],
      sessionExpiresAt: future,
    };
    expect(
      authorize(donor, "donation:read:self", { ownerUserId: "donor-a" }),
    ).toBe(true);
    expect(
      authorize(donor, "donation:read:self", { ownerUserId: "donor-b" }),
    ).toBe(false);
  });

  it("rejects suspended tenant memberships", () => {
    expect(
      authorize(
        {
          ...orgA,
          memberships: [
            {
              ...orgA.memberships[0],
              status: "SUSPENDED",
            },
          ],
        },
        "evidence:upload",
        { organizationId: "org-a" },
      ),
    ).toBe(false);
  });
});

describe("workflow transitions", () => {
  it("blocks extraction until a clean scan", () => {
    expect(canTransitionDocument("SCANNING", "EXTRACTING")).toBe(false);
    expect(canTransitionDocument("SCANNING", "CLEAN")).toBe(true);
    expect(canTransitionDocument("CLEAN", "EXTRACTING")).toBe(true);
  });

  it("requires review before approval", () => {
    expect(canTransitionClaim("DRAFT", "APPROVED")).toBe(false);
    expect(canTransitionClaim("IN_REVIEW", "APPROVED")).toBe(true);
  });
});

describe("public projection", () => {
  const base: ReviewedClaim = {
    id: "claim-1",
    type: "CSR_1",
    label: "CSR-1 registration",
    value: "CSR00012345",
    confidence: "HIGH",
    confidenceNote: "Clear label-value match.",
    source: { page: 1, snippet: "Synthetic source text" },
    state: "APPROVED",
    version: 2,
    approvedVersion: 2,
    reviewedAt: "2026-09-19",
  };

  it("publishes only current approved claims", () => {
    expect(toPublicProjection([base])).toHaveLength(1);
    expect(toPublicProjection([{ ...base, state: "SUBMITTED" }])).toHaveLength(
      0,
    );
    expect(toPublicProjection([{ ...base, version: 3 }])).toHaveLength(0);
  });

  it("does not expose restricted source text or reviewer notes", () => {
    const [published] = toPublicProjection([
      { ...base, reviewReason: "private reviewer note" },
    ]);
    expect(published).not.toHaveProperty("reviewReason");
    expect(published).not.toHaveProperty("source");
    expect(JSON.stringify(published)).not.toContain("Synthetic source text");
  });
});

describe("Compass schema", () => {
  it("rejects malformed or invented output", () => {
    const result = compassResultSchema.safeParse({
      schemaVersion: "wrong",
      modelProvider: "Unknown model",
      candidates: [{ state: "APPROVED" }],
    });
    expect(result.success).toBe(false);
  });
});

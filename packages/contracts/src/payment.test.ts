import { describe, expect, it } from "vitest";
import { validateDonationOrderInput } from "./payment";

const target = {
  causeId: "cause-learning-kits",
  organizationId: "org-udaan-learning",
  currency: "INR" as const,
  acceptingDonations: true,
};

describe("donation order contract", () => {
  it("validates the server-owned target and fee in integer paise", () => {
    expect(
      validateDonationOrderInput(
        {
          causeId: target.causeId,
          organizationId: target.organizationId,
          amountPaise: 100_000,
          currency: "INR",
          donorCoversPlatformFee: true,
        },
        target,
      ),
    ).toMatchObject({
      amountPaise: 100_000,
      platformFeePaise: 250,
      totalChargedPaise: 100_250,
      currency: "INR",
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  parseEvidenceObjectKey,
  scanResultToState,
} from "../src/functions/route-scan.js";

describe("GuardDuty scan routing", () => {
  it("maps only clean results to CLEAN", () => {
    expect(scanResultToState("NO_THREATS_FOUND")).toBe("CLEAN");
    expect(scanResultToState("THREATS_FOUND")).toBe("INFECTED");
    expect(scanResultToState("UNSUPPORTED")).toBe("SCAN_FAILED");
    expect(scanResultToState("ACCESS_DENIED")).toBe("SCAN_FAILED");
    expect(scanResultToState("FAILED")).toBe("SCAN_FAILED");
  });

  it("accepts only controlled quarantine object keys", () => {
    expect(
      parseEvidenceObjectKey(
        "quarantine/org-demo/0123456789abcdef0123456789abcdef.pdf",
      ),
    ).toEqual({
      organizationId: "org-demo",
      evidenceId: "0123456789abcdef0123456789abcdef",
    });
    expect(() =>
      parseEvidenceObjectKey("quarantine/org-demo/../../private.pdf"),
    ).toThrow("INVALID_EVIDENCE_OBJECT_KEY");
  });
});

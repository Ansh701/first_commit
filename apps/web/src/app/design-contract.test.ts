import { describe, expect, it } from "vitest";
import { designTokens, publicFontFamily } from "@/lib/design-contract";

describe("INSIPS design contract", () => {
  it("defines the semantic token roles for both themes", () => {
    for (const theme of [designTokens.light, designTokens.dark]) {
      expect(theme).toEqual(
        expect.objectContaining({
          canvas: expect.any(String),
          surface: expect.any(String),
          text: expect.any(String),
          muted: expect.any(String),
          primary: expect.any(String),
          onPrimary: expect.any(String),
          accent: expect.any(String),
          border: expect.any(String),
        }),
      );
    }
  });

  it("uses Public Sans rather than the discarded Manrope contract", () => {
    expect(publicFontFamily).toBe("Public Sans");
    expect(publicFontFamily).not.toBe("Manrope");
  });
});

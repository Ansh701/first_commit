import { describe, expect, it } from "vitest";
import {
  MAX_PDF_BYTES,
  sanitizeDisplayName,
  validatePdfUpload,
} from "./upload-validation";

const pdfBytes = new TextEncoder().encode("%PDF-1.7");

describe("PDF upload validation", () => {
  it("requires extension, MIME type, signature, and size to agree", () => {
    expect(
      validatePdfUpload({
        displayName: "evidence.pdf",
        declaredContentType: "application/pdf",
        size: 1024,
        firstBytes: pdfBytes,
      }),
    ).toEqual({ ok: true, safeDisplayName: "evidence.pdf" });
    expect(
      validatePdfUpload({
        displayName: "evidence.exe",
        declaredContentType: "application/pdf",
        size: 1024,
        firstBytes: pdfBytes,
      }).ok,
    ).toBe(false);
    expect(
      validatePdfUpload({
        displayName: "evidence.pdf",
        declaredContentType: "text/plain",
        size: 1024,
        firstBytes: pdfBytes,
      }).ok,
    ).toBe(false);
    expect(
      validatePdfUpload({
        displayName: "evidence.pdf",
        declaredContentType: "application/pdf",
        size: 1024,
        firstBytes: new TextEncoder().encode("MZ..."),
      }).ok,
    ).toBe(false);
  });

  it("enforces the 10 MB maximum", () => {
    expect(
      validatePdfUpload({
        displayName: "evidence.pdf",
        declaredContentType: "application/pdf",
        size: MAX_PDF_BYTES + 1,
        firstBytes: pdfBytes,
      }),
    ).toMatchObject({ ok: false, code: "FILE_TOO_LARGE" });
  });

  it("sanitizes the display name without using it as an object key", () => {
    expect(sanitizeDisplayName("../../sensitive <copy>.pdf")).toBe(
      "sensitive _copy_.pdf",
    );
  });
});

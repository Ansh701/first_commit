export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export type UploadCandidate = {
  displayName: string;
  declaredContentType: string;
  size: number;
  firstBytes: Uint8Array;
};

export type UploadValidation =
  | { ok: true; safeDisplayName: string }
  | {
      ok: false;
      code:
        | "FILE_TOO_LARGE"
        | "UNSUPPORTED_TYPE"
        | "INVALID_PDF_SIGNATURE"
        | "INVALID_NAME";
      message: string;
    };

export function sanitizeDisplayName(name: string): string | null {
  const basename = name.split(/[\\/]/).pop()?.trim() ?? "";
  const withoutControls = Array.from(basename)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
  const safe = withoutControls
    .replace(/[^a-zA-Z0-9._() -]/g, "_")
    .slice(0, 120);
  return safe && safe !== "." && safe !== ".." ? safe : null;
}

export function validatePdfUpload(
  candidate: UploadCandidate,
): UploadValidation {
  const safeDisplayName = sanitizeDisplayName(candidate.displayName);
  if (!safeDisplayName)
    return {
      ok: false,
      code: "INVALID_NAME",
      message: "Choose a file with a valid name.",
    };
  if (candidate.size <= 0 || candidate.size > MAX_PDF_BYTES)
    return {
      ok: false,
      code: "FILE_TOO_LARGE",
      message: "PDF files must be no larger than 10 MB.",
    };
  if (
    !safeDisplayName.toLowerCase().endsWith(".pdf") ||
    candidate.declaredContentType !== "application/pdf"
  )
    return {
      ok: false,
      code: "UNSUPPORTED_TYPE",
      message: "Only PDF documents are supported.",
    };
  const signature = String.fromCharCode(...candidate.firstBytes.slice(0, 5));
  if (signature !== "%PDF-")
    return {
      ok: false,
      code: "INVALID_PDF_SIGNATURE",
      message: "The file does not have a valid PDF signature.",
    };
  return { ok: true, safeDisplayName };
}

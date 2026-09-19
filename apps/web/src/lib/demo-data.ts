import type {
  CandidateClaim,
  PublicOrganization,
  ReviewedClaim,
} from "@insips/contracts";
import { toPublicProjection } from "@insips/contracts";

export const DEMO_ORGANIZATION_ID = "org-udaan-learning";

export const candidateClaims: CandidateClaim[] = [
  {
    id: "claim-csr1",
    type: "CSR_1",
    label: "CSR-1 registration",
    value: "CSR00018427",
    confidence: "HIGH",
    confidenceNote:
      "The label and registration number appear together in the certificate header.",
    source: {
      page: 1,
      snippet: "Registration No. CSR00018427 · Form CSR-1",
    },
    state: "DRAFT",
    version: 1,
  },
  {
    id: "claim-legal-name",
    type: "REGISTRATION",
    label: "Registered legal name",
    value: "Udaan Learning Foundation",
    confidence: "HIGH",
    confidenceNote:
      "The legal name is repeated in the registration section and signature block.",
    source: {
      page: 1,
      snippet: "Udaan Learning Foundation, registered under Section 8",
    },
    state: "DRAFT",
    version: 1,
  },
  {
    id: "claim-80g",
    type: "TAX_80G",
    label: "80G status",
    value: "Referenced, certificate not included",
    confidence: "MEDIUM",
    confidenceNote:
      "The document references 80G, but the supporting certificate is not present.",
    source: {
      page: 2,
      snippet: "The organization has applied for renewal under section 80G…",
    },
    state: "DRAFT",
    version: 1,
  },
];

export const alreadyApprovedClaims: ReviewedClaim[] = [
  {
    id: "claim-registration",
    type: "REGISTRATION",
    label: "Organization registration",
    value: "Section 8 company",
    confidence: "HIGH",
    confidenceNote: "Matched to reviewed registration evidence.",
    source: { page: 1, snippet: "Synthetic private source content" },
    state: "APPROVED",
    version: 1,
    approvedVersion: 1,
    reviewedAt: "12 September 2026",
  },
];

export const publicOrganizations: PublicOrganization[] = [
  {
    slug: "udaan-learning-foundation",
    displayName: "Udaan Learning Foundation",
    summary:
      "Community-led learning centers helping first-generation students build foundational literacy and stay in school.",
    location: "Pune, Maharashtra",
    focusAreas: ["Education", "Youth", "Community learning"],
    trustClaims: toPublicProjection(alreadyApprovedClaims),
  },
  {
    slug: "jal-saathi-collective",
    displayName: "Jal Saathi Collective",
    summary:
      "A synthetic demonstration organization coordinating safe-water access with village partners in Rajasthan.",
    location: "Udaipur, Rajasthan",
    focusAreas: ["Water", "Rural development"],
    trustClaims: [
      {
        id: "jal-12a",
        type: "TAX_12A",
        label: "12A status",
        value: "Active at last review",
        reviewedAt: "08 September 2026",
        sourceSummary: "Reviewed statutory evidence, page 1",
        meaning:
          "A reviewer matched the stated 12A status to the submitted evidence.",
      },
    ],
  },
  {
    slug: "sahaara-health-network",
    displayName: "Sahaara Health Network",
    summary:
      "A synthetic public-health network supporting preventive care and referrals across peri-urban communities.",
    location: "Bengaluru, Karnataka",
    focusAreas: ["Health", "Women", "Preventive care"],
    trustClaims: [],
  },
];

export const pipelineStages = [
  {
    label: "Uploaded privately",
    detail: "Private S3 quarantine",
    state: "complete",
  },
  {
    label: "Malware scan",
    detail: "Synthetic clean fixture",
    state: "complete",
  },
  {
    label: "Text extracted",
    detail: "Textract fixture · 2 pages",
    state: "complete",
  },
  {
    label: "Compass analysis",
    detail: "3 candidate fields",
    state: "complete",
  },
  {
    label: "Human confirmation",
    detail: "Your action is required",
    state: "current",
  },
] as const;

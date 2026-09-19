# Submission draft

## Project

INSIPS Passport - evidence into explainable trust

## Problem

Small social-impact organizations often keep identity and compliance evidence across PDFs, email, and spreadsheets. Donors and CSR teams struggle to distinguish a self-reported claim from one that has supporting evidence and independent review.

## Solution

INSIPS Passport creates one complete evidence-to-publication loop. An organization uploads a private PDF, GuardDuty gates processing, Textract extracts page-aware text, and INSIPS Compass uses Bedrock to prepare bounded candidate fields and missing-evidence items. The organization must confirm every suggestion. A platform reviewer decides each claim. Public and CSR users see only current approved claims with a meaning, date, and safe source summary.

AI assists; it never verifies, approves, rejects, publishes, gives legal/compliance advice, or decides funding eligibility.

## Feature highlights

- Guided organization readiness, profile save/resume, and evidence states.
- PDF-only private upload intent with bounded size/type conditions and signature validation before extraction.
- GuardDuty-gated Step Functions workflow through Textract and Bedrock.
- Source-grounded Compass candidates with Accept, Edit, or Dismiss human control.
- Claim-level independent review and an approved-current-only public projection.
- Responsive public discovery, explainable organization profiles, and a CSR shortlist.
- Light/dark themes, mobile navigation, deterministic fixtures, accessibility checks, and a repeatable three-minute demo.

## AWS services

- Amplify Hosting for the responsive Next.js application.
- Cognito Managed Login with Authorization Code + PKCE.
- API Gateway HTTP API and Node.js 22 Lambda business handlers.
- DynamoDB on-demand for tenant data, state, audit metadata, and approved public projection.
- Private S3 quarantine for PDFs.
- GuardDuty Malware Protection for S3 and EventBridge scan-result events.
- Step Functions Standard for scan-gated extraction, polling, retry, timeout, and failure branches.
- Textract asynchronous text extraction.
- Bedrock Converse API for schema-bounded Compass candidates.
- CloudWatch logs, metrics, traces, and alarms.
- AWS Budgets with owner-supplied amount/email.

## What we learned

Trust is safer when represented as distinct, explainable claims rather than a generic badge. AI is most useful here when it reduces evidence-preparation work but remains bounded by malware gating, schemas, source references, explicit human confirmation, and independent review. Event delivery is at least once, so workflow starts and decisions require idempotency and conditional writes.

## Links

- Repository: `TBD - owner must authorize/create the public GitHub remote`
- Production: `TBD - deploy after region, AWS profile, budget, and paid-service approval`
- Demo video: `TBD - owner records and uploads under three minutes`

## Hackathon disclosure

OpenAI Codex assisted with implementation, tests, documentation, and review. The INSIPS concept and brand predate the hackathon; this application implementation and repository are new for the event. The supplied prior logo is excluded pending reuse permission.

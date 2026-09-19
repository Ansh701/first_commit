# Implementation plan and must-ship checklist

## Phase plan

1. Foundation — workspace, design system, routes, contracts, local fixtures, CI, and documentation.
2. Product spine — organization profile, evidence states, Compass confirmation, reviewer decision, approved public projection, and CSR shortlist.
3. AWS core — Cognito, API/Lambda, DynamoDB, private S3, authorization, logs, and outputs through CDK.
4. Secure pipeline — malware gate, Step Functions, Textract, Bedrock, traceability, retries, and failure states.
5. Release — accessibility/responsive verification, deployed smoke tests, demo reset, screenshots, and submission package.

## Must-ship checklist

- [x] Hackathon-safe empty starting point inspected; no prior application files found.
- [x] Product boundary, security invariants, route map, and theme established.
- [x] Local organization → evidence → review → public workflow exercised end to end.
- [x] Negative authorization and approved-only publication tests pass.
- [x] Private upload infrastructure and clean-before-processing workflow synthesize.
- [ ] Cognito/API/DynamoDB/S3 deployment verified in the chosen AWS region.
- [ ] Textract and Bedrock live path verified with a synthetic PDF.
- [x] Responsive desktop/mobile, light/dark, reduced-motion, and automated accessibility checks pass; final manual keyboard/200% zoom review remains part of release QA.
- [x] Lint, typecheck, tests, production build, and CDK synth pass.
- [ ] Public repository, production URL, and demo video are verified.

AWS deployment, paid-service activation, and publishing remain manual gates until region, AWS profile, spending ceiling, and budget email are supplied.

# Security model

## Threat model

The highest-risk assets are legal/compliance PDFs, extracted text, organization membership, reviewer notes, claim state, and publication decisions. Likely threats include cross-tenant access, object-key guessing, malicious or oversized uploads, malware, prompt injection inside a PDF, replayed submissions, self-approval, stale approvals, log leakage, excessive AI calls, and forged browser roles.

The production design denies by default and separates identity, membership, capability, resource relationship, and resource state. The local browser fixture is presentation-only and is visibly labelled; it is not a security boundary.

## Data classification

| Class        | Examples                                                                                      | Required controls                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Public       | approved organization summary, current approved claims, safe source summaries, review date    | approved projection only, cache and response review, no private joins                                              |
| Internal     | non-sensitive job status, timestamps, correlation IDs                                         | authenticated access, least privilege, seven-day logs                                                              |
| Confidential | private contact, reviewer notes, candidate fields before publication                          | capability and tenant checks, encrypted persistence, redacted logs                                                 |
| Restricted   | uploaded documents, full extracted text, government identifiers, secrets, tokens, signed URLs | private S3, short-lived authorized access, malware gate, minimum prompt text, never logs/URLs/analytics/public API |

## Identity, sessions, and authorization

- Cognito Managed Login uses Authorization Code + PKCE. Public self-registration is off to prevent unsafe tenant assignment.
- The intended Next.js boundary stores session material in `HttpOnly`, `Secure`, appropriately scoped `SameSite` cookies. OAuth state and nonce must be verified.
- API Gateway verifies Cognito JWTs. Lambda loads membership and capability server-side. Client role, organization ID, route visibility, and hidden buttons are never authorization.
- The policy layer is deny-by-default. Tests cover Organization A versus Organization B, organization self-approval, reviewer assignment, and expired sessions.
- State-changing cookie requests require strict origin checks and CSRF tokens before the live BFF is enabled.

## Upload controls

- PDF only, maximum 10 MB. Production must validate extension, declared MIME type, and `%PDF-` signature.
- Server-owned random keys under `quarantine/`; the display name is separately sanitized.
- Short-lived upload operation with size/content-type conditions; no public ACLs; Bucket Owner Enforced; Block Public Access; TLS; encryption; versioning.
- Quarantine objects expire after 14 days; incomplete multipart uploads after one day.
- Reviewer downloads require authorization and short-lived response headers. Inline active document content is not rendered.

## Malware and workflow integrity

- GuardDuty publishes durable, at-least-once scan result events. The router records an idempotent object digest and only starts Step Functions for `NO_THREATS_FOUND`.
- `THREATS_FOUND` maps to `INFECTED`; unsupported, access-denied, and failed scans map to a blocked failure state. UI state cannot bypass the rule.
- Textract begins only from the workflow that receives a clean event. Retries preserve the preceding successful state.

## INSIPS Compass safety

- Extracted document text is delimited and explicitly treated as untrusted content, never instructions.
- The Bedrock call has no tools or external actions, bounded input/output, temperature zero, and a versioned strict schema.
- Malformed JSON, unsupported claim type, missing source, or invalid state fails closed and increments a CloudWatch metric.
- Compass cannot approve, reject, publish, certify, assess fraud, determine funding eligibility, or hide uncertainty.
- Store model/provider, prompt/schema version, timestamp, job ID, and input/output hashes. Never log the full document or full model output.

## Publication integrity

- Claim transition: `DRAFT -> CONFIRMED_BY_ORG -> SUBMITTED -> IN_REVIEW -> APPROVED | REJECTED | CHANGES_REQUESTED`.
- Only `APPROVED` claims whose approved version equals the current version enter the public table.
- Editing an approved value creates a new version and removes the current public representation until re-review.
- Public/CSR data never contains object keys, extracted text, reviewer notes, rejected drafts, private contacts, or signed URLs.

## Logging and incident signals

Logs use request IDs, object digests, job IDs, and safe error codes; tokens, cookies, document text, identifiers, presigned URLs, and secrets are redacted. Retention is seven days. Alarms cover infected uploads, scan failures, Compass parse failures, and Lambda/Step Functions failures. GuardDuty and EventBridge use at-least-once delivery, so handlers must remain idempotent.

## Residual risks and pending controls

- Live BFF session exchange, CSRF enforcement, durable review writes, and end-to-end cloud authorization are pending until AWS configuration exists. The constrained presigned POST production handler is implemented but remains undeployed.
- Bedrock model availability and output-format capabilities must be verified in the selected region; no model ID is hardcoded.
- GuardDuty service-role permissions must be re-reviewed against the current AWS template before deployment.
- `bedrock:InvokeModel` is temporarily resource-wide because the model ID is a deployment parameter. Narrow it to the verified model/inference-profile ARN before production use.
- S3 uses AWS-managed encryption for the time-boxed MVP. A customer-managed KMS key would add key-policy and cost complexity; reassess before handling real documents.
- No real KYC/compliance data may be used until a privacy, retention, legal, and incident-response review is complete.

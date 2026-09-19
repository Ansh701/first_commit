# DynamoDB access patterns

This is the key-design record for INSIPS. Access patterns come first; physical keys follow them. The operational table stores private workflow records. A separate table stores the intentionally narrow public projection so that public reads cannot accidentally expose source documents, extracted text, reviewer notes, membership, or private contact data.

## Required access patterns

| #   | Actor / process     | Access pattern                                                                     | Consistency                                | Expected scale                        |
| --- | ------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------- |
| 1   | API authorization   | Resolve a user's active organization membership and role                           | Strong                                     | One item per request                  |
| 2   | Organization        | Read its profile and readiness state                                               | Strong for writes, eventual for dashboards | One profile plus small summaries      |
| 3   | Organization        | List evidence newest first and read one evidence workflow                          | Eventual list, strong detail               | Tens to low hundreds per organization |
| 4   | Scan router         | Resolve an S3 object to one evidence record and advance its state once             | Strong / conditional write                 | One item per scan event               |
| 5   | Extraction workflow | Read and update one evidence version and store bounded extraction metadata         | Strong / conditional write                 | One workflow at a time                |
| 6   | Organization        | List candidate claims for an evidence item and confirm selected versions           | Strong / transactional boundary            | At most 12 candidates per analysis    |
| 7   | Reviewer            | List submissions assigned to the reviewer by state and age                         | Eventual                                   | Tens to hundreds per reviewer         |
| 8   | Reviewer            | Read one submission with claims and append immutable decisions                     | Strong for decision write                  | Small bounded submission              |
| 9   | Publisher           | Materialize only current approved claim versions for one organization              | Strong source read                         | Small claim set                       |
| 10  | Public / CSR user   | Read a public organization by slug and list public organizations by focus/location | Eventual                                   | Public read-heavy traffic             |
| 11  | CSR user            | Read and update a private shortlist                                                | Strong for mutation                        | Tens per user                         |
| 12  | Operations          | Expire idempotency, temporary access, and abandoned workflow records               | N/A                                        | TTL-managed                           |

## Operational table key design

Primary key: `pk` + `sk`. General records are tenant-grouped; authorization membership lookups are deliberately user-grouped.

| Entity               | `pk`            | `sk`                                                       | Secondary index                                                                |
| -------------------- | --------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Active membership    | `USER#<userId>` | `ACTIVE_MEMBERSHIP`                                        | —                                                                              |
| Organization profile | `ORG#<orgId>`   | `PROFILE`                                                  | —                                                                              |
| Evidence             | `ORG#<orgId>`   | `EVIDENCE#<evidenceId>`                                    | `gsi1pk=ORG#<orgId>#EVIDENCE`, `gsi1sk=<createdAt>#<evidenceId>`               |
| Evidence event       | `ORG#<orgId>`   | `EVIDENCE#<evidenceId>#EVENT#<timestamp>#<eventId>`        | —                                                                              |
| Candidate claim      | `ORG#<orgId>`   | `CLAIM#<claimId>#V#<version>`                              | —                                                                              |
| Submission           | `ORG#<orgId>`   | `SUBMISSION#<submissionId>`                                | `gsi1pk=REVIEWER#<reviewerId>#<status>`, `gsi1sk=<submittedAt>#<submissionId>` |
| Review decision      | `ORG#<orgId>`   | `SUBMISSION#<submissionId>#DECISION#<claimId>#<timestamp>` | —                                                                              |
| Shortlist item       | `USER#<userId>` | `SHORTLIST#<orgSlug>`                                      | —                                                                              |
| Idempotency record   | `USER#<userId>` | `IDEMPOTENCY#<keyHash>`                                    | TTL in `expiresAt`                                                             |

The quarantine object key contains the validated organization ID and server-owned evidence ID. The scan router parses that controlled key to update the same tenant-scoped evidence item, while the GSI supports newest-first lists without changing the primary identity.

## Public projection table

Primary key: `pk` + `sk`.

| Entity              | `pk`                | `sk`                          | Contents                                                                 |
| ------------------- | ------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Public organization | `PUBLIC_ORG#<slug>` | `PROFILE`                     | Display name, summary, public location and focus areas only              |
| Public claim        | `PUBLIC_ORG#<slug>` | `CLAIM#<claimType>#<claimId>` | Approved value, meaning, source summary, reviewed date, approved version |

Public items are replaced or removed when the source version changes. No public item contains S3 keys, source snippets, extracted text, confidence notes, private contact fields, user IDs, or reviewer notes.

## Concurrency and retention rules

- State changes use conditional expressions on the expected state and version.
- Review decisions are append-only; the derived submission status is updated separately and can be rebuilt.
- Publication checks `state=APPROVED` and `approvedVersion=version` before writing the projection.
- Idempotency and temporary-access records use TTL. Evidence and review audit records do not silently expire.
- Point-in-time recovery is enabled on both tables. Production retention and deletion policy must be confirmed before changing CDK removal policies from the hackathon defaults.

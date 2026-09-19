# Operations and troubleshooting

The local fixture never claims that AWS ran. For a deployed environment, start with the correlation ID shown in the user-safe error response and the evidence ID shown in the organization workspace. Do not paste document text, signed URLs, tokens, or private identifiers into log searches or tickets.

## CloudWatch triage

1. Check the `INSIPS` alarms for `InfectedUploads`, `ScanFailures`, and `CompassParseFailure`.
2. Use the API request ID to inspect the API Lambda log group. A `401` means no verified subject; a `403` means the loaded membership/capability did not permit the action.
3. For an upload stuck before extraction, inspect the GuardDuty scan-result event and scan-router logs using the safe object digest. Only `NO_THREATS_FOUND` may start the state machine.
4. For a running extraction, open the Step Functions execution named with the evidence digest. Check the current state and the matching Textract job ID; do not copy extracted text into logs.
5. For Compass failures, check the model ID, region availability, `CompassParseFailure`, and the input/output hashes. Malformed output is intentionally rejected and must not be promoted manually.
6. Retry only the failed safe stage. Never change DynamoDB directly to skip the malware gate, organization confirmation, or review decision.

## Common states

| Symptom                            | Likely boundary                 | Safe response                                                                                          |
| ---------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Upload intent denied               | membership or role              | Verify the user has an active `ORG_ADMIN` membership in the server-side record.                        |
| Scan result has no evidence record | object key or stale upload      | Confirm the key matches `quarantine/<orgId>/<32-hex-id>.pdf`; leave the object blocked.                |
| Scan is unsupported/failed         | GuardDuty or file               | Keep quarantined, show the blocked state, and retry only after correcting the cause.                   |
| Textract timeout/failure           | document readability or service | Preserve the clean scan record and retry extraction within the bounded workflow.                       |
| Compass schema failure             | model output or model mismatch  | Preserve extracted data privately, keep claims unconfirmed, verify configuration, then retry analysis. |
| Public claim disappeared           | underlying version changed      | This is expected until a reviewer approves the new version.                                            |

Log retention is seven days in the hackathon stack. If an incident involves restricted evidence, stop processing, preserve only safe identifiers, revoke temporary access, and escalate to the account owner before deleting anything.

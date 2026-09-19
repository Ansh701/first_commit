# AWS cost model and shutdown

No AWS resources have been created yet. Region, account, spending ceiling, budget email, and approval for paid services are unresolved manual gates.

## Low-volume hackathon assumptions

Illustrative monthly usage: 100 synthetic two-page PDFs at 1 MB each, 100 Compass calls of roughly 6,000 input and 1,000 output tokens, 2,000 API requests, light DynamoDB traffic, and seven-day logs. Exact rates vary by region and Bedrock model, so calculate again after choosing both.

| Service                             | Cost driver                                                          | Control                                                                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Amplify Hosting                     | build minutes, stored artifacts, requests/data transfer, SSR compute | deploy one branch, avoid unnecessary builds, remove app after judging                                                                                                  |
| Cognito                             | monthly active users and optional features                           | invite only; tiny demo user set                                                                                                                                        |
| API Gateway HTTP API                | requests and data transfer                                           | 10 req/s default route limit, 20 burst                                                                                                                                 |
| Lambda                              | requests, duration, memory                                           | ARM64, 512 MB, bounded timeouts, no always-on service                                                                                                                  |
| DynamoDB                            | on-demand reads/writes and storage                                   | small records, TTL for counters/sessions, no provisioned capacity                                                                                                      |
| S3                                  | stored bytes, requests, object tags, transfer                        | 10 MB limit, 14-day quarantine lifecycle, one-day multipart cleanup                                                                                                    |
| GuardDuty Malware Protection for S3 | objects evaluated, GB scanned, tagging/S3 requests                   | disabled by default until approval; small PDFs only. AWS currently describes a monthly free-tier allowance of 1,000 requests and 1 GB, subject to account/region terms |
| EventBridge                         | published/matched events                                             | one scan-result rule, no high-volume custom bus                                                                                                                        |
| Step Functions Standard             | state transitions                                                    | short bounded workflow, five-second Textract polling, 15-minute total timeout                                                                                          |
| Textract                            | pages processed                                                      | Detect Document Text only; the public pricing example is USD 0.0015/page for the first million in US West (Oregon); verify selected region                             |
| Bedrock                             | input/output tokens by model and service tier                        | one bounded call per clean document, 25k-character input cap, 1,800-token output cap, no model until verified                                                          |
| CloudWatch                          | log ingestion/storage, metrics, alarms, traces                       | seven-day logs, three product alarms plus API/workflow failure alarms, redacted small events                                                                           |
| AWS Budgets                         | budget actions/notifications under AWS pricing terms                 | conditional CDK resource; requires explicit amount and email                                                                                                           |

Official pricing changes over time. Verify the selected region using the AWS Pricing Calculator plus the current GuardDuty, Textract, Bedrock, Amplify, Lambda, DynamoDB, S3, API Gateway, Step Functions, Cognito, EventBridge, and CloudWatch pricing pages before deployment.

## Spend stop controls

1. Stop demo uploads and disconnect the Amplify production branch.
2. Disable the GuardDuty Malware Protection plan for the evidence bucket.
3. Confirm no Step Functions executions remain running.
4. Review the target account and region.
5. With explicit owner confirmation, run `pnpm --filter @insips/infra destroy -- --profile PROFILE`.
6. Because the evidence bucket deliberately sets `autoDeleteObjects: false`, inspect and empty only synthetic objects before deleting it. This is a separate destructive decision.
7. Delete the Amplify app and check Cost Explorer/Budgets for remaining spend.

Do not run teardown against an unresolved profile, wildcard account, or unknown region.

# Three-minute judge demo

## Reset

1. Use a fresh browser profile or remove local storage key `insips-passport-demo-v1`.
2. Open the landing page in light mode at desktop width.
3. Keep reviewer and public profile routes ready in separate tabs only as a backup; the primary recording should navigate naturally.
4. Confirm the synthetic PDF is visibly watermarked and no real data appears.

## Script

### 0:00-0:25 - Problem and promise

Show the landing hero: “Turn proof into explainable trust.” Say that small organizations have evidence scattered across PDFs, while donors and CSR teams cannot tell self-reported claims from reviewed evidence. INSIPS does not create a magic trust score.

### 0:25-0:50 - Organization next action

Open the organization workspace. Point to the 4-step Passport checklist and the clear next action. Open `Synthetic_CSR-1_Certificate.pdf` from Evidence. Call out that local mode is visibly a synthetic fixture.

### 0:50-1:20 - Meaningful AWS pipeline

Show the processing timeline: private S3 quarantine, GuardDuty malware result, EventBridge/Step Functions, Textract page-aware extraction, Bedrock candidate preparation. State that the workflow only permits extraction after `NO_THREATS_FOUND`; unknown, failed, unsupported, and infected files remain blocked.

### 1:20-1:50 - Human-supervised Compass

Accept the CSR-1 registration and legal-name candidates. Dismiss the ambiguous 80G reference because the supporting certificate is missing. Emphasize: confidence is source-match confidence, not legitimacy, and AI cannot approve or publish.

### 1:50-2:20 - Independent review

Submit the confirmed claims, switch to the reviewer queue, open the submission, compare the claim with the highlighted synthetic source, and approve one claim. Request changes on the other to show claim-level decisions.

### 2:20-2:45 - Approved-only public result

Open the public organization profile. Show the distinct indicators, their meaning, review date, and safe source summary. Note that the restricted PDF, full text, and reviewer notes are absent.

### 2:45-3:00 - Impact and close

Open the CSR discovery view, save the organization, and close with: “INSIPS helps organizations turn evidence into explainable, human-reviewed trust signals—and helps funders understand why a claim is trusted.”

## Judge-visible AWS touchpoints

- Cognito Managed Login and role groups.
- API Gateway JWT authorizer and Lambda server authorization.
- Private S3 evidence bucket with Block Public Access.
- GuardDuty Malware Protection scan result in EventBridge.
- Step Functions execution graph showing clean-before-extract.
- Textract asynchronous job and page-aware output.
- Bedrock Converse invocation with selected model ID and Compass trace metadata.
- DynamoDB private records and separate approved public projection.
- CloudWatch structured redacted logs, metrics, trace, and failure alarms.

## Backup path

If AWS is unavailable, use the local fixture and explicitly say so. Show the CDK synthesis/test result and architecture diagram, but never imply the fixture is live. If recording time is short, cut CSR shortlist before cutting scan gating, confirmation, review, or public projection.

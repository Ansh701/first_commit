# INSIPS manual production setup

Local mode uses deterministic seed content and does not require live credentials. Production integrations remain disabled until the exact configuration below is supplied through the documented secret store. Never paste secrets into source code, this repository, or chat.

## Local development

1. Install Node.js compatible with the repository's pnpm lockfile and enable pnpm.
2. Run `pnpm install`.
3. Run `pnpm dev` for the seeded local product.
4. Optional PostgreSQL mode: provide a local `DATABASE_URL`, then run `pnpm db:seed`. This applies the repeatable product, content, and editorial migrations in order.
5. To reset a local database only, set `INSIPS_ALLOW_DB_RESET=true` and run `pnpm db:reset`. The command refuses production environments and requires an explicit reset flag.
6. Keep local fixture mode enabled when PostgreSQL or external credentials are unavailable. The UI labels only development-only processing disclosures, never customer-facing pages.

## AWS

- AWS CLI v2 and an AWS SSO profile.
- Approved region and monthly budget with a budget-alert email.
- Cognito user-pool domain, callback URLs, logout URLs, and verified email configuration.
- Public media delivery domain and CloudFront configuration.
- Explicit approval before deploying paid services.

## Social authentication

### Google

Provide an OAuth client ID and secret, authorized origins, and the Cognito callback URI. Configure the provider only after redirect and consent behavior is tested locally.

### Facebook

Provide a Meta developer app ID and secret, privacy-policy URL, data-deletion URL, and Cognito callback URI.

### Apple

Provide Apple Developer membership, Services ID, Team ID, Key ID, private key, domain verification, and return URL. Store the private key in AWS Secrets Manager.

## Razorpay

- Local test mode uses the placeholders in the repository-root `.env.example`.
  Copy them to an ignored `.env.local` only when testing locally; never commit or
  paste real values into source files.
- Set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and
  `RAZORPAY_WEBHOOK_SECRET` for server-side work. Set
  `NEXT_PUBLIC_RAZORPAY_KEY_ID` only for the browser checkout configuration.
- In AWS, populate the stack's `RazorpayTestCredentials` Secrets Manager secret
  out of band with JSON containing `keyId`, `keySecret`, and `webhookSecret`.
  The CDK stack intentionally does not generate or invent payment credentials.
- Configure the Razorpay test webhook URL as the deployed API's
  `POST /webhooks/razorpay` route, enable the payment and refund events used by
  the application, and preserve the raw request body for signature validation.
- Configure the webhook secret independently from the API key secret. Razorpay
  payment callbacks use an HMAC over `order_id|payment_id`; webhooks use an HMAC
  over the exact raw request body and the `X-Razorpay-Signature` header.
- Live activation, KYC, refunds, and transfer review before production payments.

The application represents the INSIPS fee as exactly 25 basis points (0.25%), separate from Razorpay processing fees. A captured payment is not considered public progress until a verified idempotent webhook is processed.

## Social and public media

Provide official Instagram post URLs, official YouTube video/channel URLs, and Meta API access only if automatic synchronization is required. Supply organization permission or license evidence for every downloaded asset. Prefer official embeds when tracking and permission requirements allow them.

## Product and legal content

Supply the support email, security-reporting email, public business address when applicable, legal entity name, final privacy policy, terms, refund policy approval, and logo ownership confirmation. Legal pages remain clearly marked as pending review until those inputs are approved.

## Still unverified

Live Cognito federation, production PostgreSQL/RDS Data API authorization, S3 public-media delivery, Razorpay checkout/Route transfers, real AWS malware scanning, Textract, Bedrock model availability, and GuardDuty permissions require credentials and account-level verification. Local seeded flows are intentionally not a claim that those cloud integrations are live.

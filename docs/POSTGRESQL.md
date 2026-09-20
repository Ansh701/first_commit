# PostgreSQL product data

`infra/sql/001_product_core.sql` is the authoritative first migration for tenant membership, onboarding, organization verification, causes, donations, payment events, accounting entries, item needs, item pledges, volunteering, relationships, and notifications.

## Authorization boundary

Cognito groups contain only the seven coarse roles. The API uses the verified JWT subject to load the current `app_users` row and active `tenant_memberships` rows. Tenant identifiers and permissions sent by a browser are ignored. Suspended or archived users, memberships, and tenants fail closed.

## Money and idempotency

All money is stored as integer paise. Every donation stores the fee rate used; the default is exactly 25 basis points. `payment_events.provider_event_id` is unique. The webhook handler inserts that event and changes donation, cause-progress, refund, transfer, and accounting records in one transaction. An exact retry produces no second progress change.

## Private files

PostgreSQL stores private document metadata and an internal object key. Object keys are never returned by public APIs. A platform admin may request a five-minute signed preview only for a clean, non-archived document. Review notes remain private.

## Deployment

The CDK stack creates encrypted Aurora PostgreSQL Serverless v2 with Data API enabled and applies the migration through an idempotent custom resource. Deployment is still gated by the project’s AWS cost and region approvals.

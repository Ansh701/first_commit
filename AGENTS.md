# INSIPS project rules

## Product boundary

INSIPS is a production-shaped social-impact platform connecting organizations, donors, corporate and CSR teams, volunteers, independent reviewers, and platform administrators.

The product includes public organization discovery, media and updates, causes and donations, item donations, volunteer opportunities, events, corporate shortlists and matching, evidence preparation, AI-assisted candidate extraction, human confirmation, independent review, approved public trust indicators, organization widgets, donation links and QR codes, administration, moderation, audit logs, and reporting.

Local mode must remain fully demonstrable with deterministic seeded content. Live credentials are documented separately and never faked.

## Security invariants

- Deny by default. Derive identity, role, tenant, and organization membership on the server; never trust client-supplied tenant or role values.
- Every tenant-owned private table includes tenant scope, timestamps, status, and archival state with suitable indexes.
- A document must be clean before extraction. Validate file type and size, quarantine uploads, and treat scan failures as blocked states.
- AI output is untrusted, schema-validated, and never approves, rejects, publishes, certifies, assesses fraud, or determines funding eligibility.
- Human confirmation and independent review are required before publication.
- Public responses contain only current approved projections and permissioned public-media metadata. Never expose object keys, full extracted text, reviewer notes, private contacts, tokens, or signed URLs.
- Donation progress changes only after verified, idempotent provider events. Store money as integer paise and represent the 25-basis-point INSIPS fee separately from provider fees.
- Use synthetic local data unless a source, permission, license, and attribution are documented. Never commit secrets or `.env` files.

## Project conventions

- TypeScript strict mode, pnpm workspaces, Next.js 15 App Router, React Server Components by default, Tailwind CSS 4 tokens, Motion through `motion/react`, Radix-compatible accessible primitives, React Hook Form, and Zod.
- `apps/web` owns the user experience and consumes server repositories; production routes must not import fixture arrays directly.
- `packages/contracts` owns schemas, safe public projections, policy, fee calculations, and state transitions.
- `infra` owns AWS CDK, explicit SQL migrations, Lambda boundaries, Cognito, S3, RDS Data API, Textract, Bedrock, Step Functions, and Razorpay webhook infrastructure.
- Keep private evidence storage separate from public organization media storage.
- Public storytelling may use expressive motion; admin, reviewer, donor, and organization workspaces use motion only for feedback, transitions, and direct manipulation.
- Every important route and component needs intentional loading, success, empty, error, permission, offline, and session-expired behavior where applicable.

## Commands

- `pnpm dev` — local product
- `pnpm format:check` — formatting check
- `pnpm lint` — lint all workspaces
- `pnpm typecheck` — strict type checks
- `pnpm test` — unit and infrastructure tests
- `pnpm build` — production build and CDK synth

## Definition of done

- Public content flows through PostgreSQL-backed repositories or the explicit local seed adapter, never direct UI fixture imports.
- Homepage, feed, organization profiles, causes, auth, onboarding, donations, volunteer/item flows, corporate/CSR, reviewer, and admin routes are responsive and state-complete.
- Light/dark themes, reduced motion, keyboard navigation, 200% zoom, target viewport layouts, and Axe checks pass.
- Evidence-to-public projection, tenant isolation, payment idempotency, webhook verification, and no-sensitive-data public projections are tested.
- Run formatting, lint, typecheck, tests, build, Playwright, accessibility, route coverage, secret-pattern, and whitespace checks before handoff.

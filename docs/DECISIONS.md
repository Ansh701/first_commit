# Product and architecture decisions

## ADR-001 — Evidence-to-trust core with approved adjacent flows

The evidence-to-trust loop remains the authorization and publication core. The product also includes the owner-approved organization onboarding, document verification, money and item donations, volunteers, events, corporate shortlists, and account-management flows. These additions reuse the same deny-by-default tenant model and never weaken the approved-only public projection.

## ADR-002 — Next.js 15 for Amplify Hosting

The brief requested Next.js 16, but current AWS Amplify Hosting documentation supports managed Next.js SSR through version 15. We use the latest pinned Next.js 15 release with React 19. This preserves App Router, React Server Components, Route Handlers, and the intended hosting architecture while removing a documented deployment incompatibility.

## ADR-003 — Local adapter before cloud credentials

The judge-facing flow uses clearly labelled synthetic local fixtures until AWS credentials and cost approval are available. Domain policy, workflow states, and AWS interfaces remain production-shaped; the UI never labels fixture results as a live AWS result.

## ADR-004 — Use the owner-supplied INSIPS logo

The owner explicitly requested the supplied pre-existing logo in this redesign. It is copied unchanged, presented inside a deliberate white tile for contrast, and credited with its provenance. Broader ownership and redistribution terms remain with the project owner.

## ADR-005 — Normal sans-serif typography

The commercial reference faces Ozik and Aeonik were not supplied, and the owner requested normal text typography everywhere. The product therefore uses Manrope through `next/font` for display, body, UI, and supporting text. This avoids pretending unlicensed fonts are present and keeps responsive sizing independent from a display-font dependency.

## ADR-006 — No aggregate trust score

Public trust is represented as distinct, explainable claims with review state, scope, evidence summary, and date. Publication, statutory status, physical verification, and payment readiness are never collapsed into one badge.

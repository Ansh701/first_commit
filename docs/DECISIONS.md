# Product and architecture decisions

## ADR-001 — Narrow to INSIPS

The hackathon build ships one complete evidence-to-trust loop. Donations and the broader organization operating system remain outside the MVP because they dilute the security-critical workflow and three-minute story.

## ADR-002 — Next.js 15 for Amplify Hosting

The brief requested Next.js 16, but current AWS Amplify Hosting documentation supports managed Next.js SSR through version 15. We use the latest pinned Next.js 15 release with React 19. This preserves App Router, React Server Components, Route Handlers, and the intended hosting architecture while removing a documented deployment incompatibility.

## ADR-003 — Local adapter before cloud credentials

The judge-facing flow uses clearly labelled synthetic local fixtures until AWS credentials and cost approval are available. Domain policy, workflow states, and AWS interfaces remain production-shaped; the UI never labels fixture results as a live AWS result.

## ADR-004 — Use the owner-supplied INSIPS logo

The owner explicitly requested the supplied pre-existing logo in this redesign. It is copied unchanged, presented inside a deliberate white tile for contrast, and credited with its provenance. Broader ownership and redistribution terms remain with the project owner.

## ADR-006 — Open-source type fallback

The commercial reference faces Ozik and Aeonik were not supplied. The product therefore uses Archivo Black for display, Manrope for body/UI, and Instrument Serif for restrained editorial accents through `next/font`. This avoids pretending unlicensed fonts are present while preserving the intended editorial contrast.

## ADR-005 — No aggregate trust score

Public trust is represented as distinct, explainable claims with review state, scope, evidence summary, and date. Publication, statutory status, physical verification, and payment readiness are never collapsed into one badge.

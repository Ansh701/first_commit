# INSIPS project rules

## Product boundary

- Build one evidence-to-trust workflow: organization profile, private PDF evidence, AI-assisted candidates, human confirmation, independent review, approved-only public projection, and a secondary CSR shortlist.
- Do not add payments, broad NGO operations, social features, custom identity, or automated AI approval.

## Security invariants

- Deny by default. Derive identity, role, and organization membership on the server; never trust client-supplied tenant or role values.
- A document must be clean before extraction. AI output is untrusted, schema-validated, and never publishes or approves a claim.
- Public responses contain only current approved projections. Never expose object keys, full extracted text, reviewer notes, private contacts, tokens, or signed URLs.
- Use synthetic data and never commit secrets or `.env` files.

## Project conventions

- TypeScript strict mode, pnpm workspaces, Next.js App Router, Tailwind design tokens, and accessible primitives.
- `apps/web` owns the user experience, `packages/contracts` owns schemas and policy/state rules, and `infra` owns AWS CDK.
- Server Components are the default. Client Components are reserved for interaction and demo-state adapters.

## Commands

- `pnpm dev` — local product
- `pnpm lint` — lint all workspaces
- `pnpm typecheck` — strict type checks
- `pnpm test` — unit and infrastructure tests
- `pnpm build` — production build and CDK synth

## Definition of done

- Run lint, typecheck, tests, and production build.
- Exercise the organization → evidence → confirmation → review → public flow in light and dark themes at desktop and mobile sizes.
- Inspect changes for secrets, private data, generated clutter, authorization regressions, and unrelated edits.

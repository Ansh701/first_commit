# Priority deployment progress

Preserve-first checkpoint for the paused route-by-route redesign queue.

## Checkpoint

- Checkpoint time: 2026-09-20 23:47:43 IST (+05:30)
- Starting commit: `ce9cd569332f520997b3906f8e8a93ea3264261e`
- Recent commits: `ce9cd56 Redesign INSIPS product experience`; `5139958 Build INSIPS Passport hackathon MVP`
- No commit was created for this checkpoint. The worktree already contains mixed, valuable user changes across the product, so creating a broad checkpoint commit would make ownership and rollback boundaries unsafe.
- No reset, restore, checkout, clean, formatting pass, or `redesign.css` import was performed.
- `apps/web/src/app/layout.tsx` currently imports `globals.css`, `design-tokens.css`, and `insips.css`; it does not import `redesign.css`.

## Existing dirty-worktree inventory

The pre-edit `git status --porcelain=v1` snapshot contained 202 entries: 79 tracked modifications and 123 untracked entries. This inventory is intentionally preserved as one mixed worktree; it is not safe to discard or stage wholesale.

Tracked modifications included:

- Project and documentation files: `AGENTS.md`, `CREDITS.md`, `README.md`, `docs/COSTS.md`, `docs/DECISIONS.md`, `docs/SECURITY.md`.
- Web configuration and tooling: `apps/web/package.json`, `apps/web/tsconfig.json`, `apps/web/e2e/golden-flow.spec.ts`, `apps/web/scripts/capture-screenshots.mjs`.
- Web routes and shells: public routes including `/`, `/contact`, `/help`, `/faq`, `/compass`, `/how-trust-works`, `/organizations/[slug]`, `/for-csr-teams`, `/for-organizations`, and supporting routes; authentication pages; `apps/web/src/app/layout.tsx`; `apps/web/src/app/globals.css`; `apps/web/src/app/redesign.css`; and shared components including the public header, footer, auth shell/form, workspace shell, content page, landing experience, organization card, theme toggle, and product shells.
- Brand and captured visual artifacts: `apps/web/public/brand/insips-logo.png` and existing redesign screenshots under `docs/screenshots/redesign/`.
- Infrastructure and contracts: `infra/lib/insips-stack.ts`, `infra/package.json`, `infra/src/functions/api.ts`, `infra/test/insips-stack.test.ts`, `infra/tsconfig.json`, `packages/contracts/src/index.ts`, `packages/contracts/src/index.test.ts`, `packages/contracts/tsconfig.json`, `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`.

Untracked entries included, among others:

- Existing product routes and APIs under `apps/web/src/app/`, including account, admin, analytics, app workspace, causes, corporate, donor, events, feed, items, notifications, security, volunteer, and authentication callback areas.
- Completed route-local work under `apps/web/src/app/contact/`, `apps/web/src/app/help/`, and authentication route directories, including tests and scoped styles.
- Paused onboarding work under `apps/web/src/app/app/onboarding/`; this route was not declared complete because its final functional verification was interrupted.
- Existing server adapters and product data under `apps/web/src/lib/`, `apps/web/src/components/`, `infra/src/functions/`, and `infra/sql/`.
- Existing local assets under `assets/` and public product images.
- Existing documentation and QA evidence under `docs/`, including `docs/ASSET-MANIFEST.md`, `docs/MANUAL-SETUP.md`, `docs/ROUTE-QA.md`, `docs/route-redesign-progress.md`, `docs/screenshots/route-qa/`, and `docs/screenshots/verification/`.
- Existing generated/support directories such as `.opencode/`, `.tastemaker/`, `graphify-out/`, and `docs/superpowers/`.

Before any later phase edits, run `git status --short` again and preserve all entries above unless a phase explicitly changes one of them.

## Route queue status

Completed and protected before this priority pass:

- `/contact` — completed and documented in `docs/route-redesign-progress.md`; local SES mode honestly reports queued delivery.
- `/` — footer-only correction completed; footer theme control removed while the public header control remains.
- `/help` — route-local help center completed with search, filters, guides, no-results recovery, and escalation.
- `/auth/sign-in`
- `/auth/sign-up`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/auth/session-expired`
- `/auth/callback`

Paused and not yet complete:

- `/app/onboarding` — route-local implementation exists and baseline/final visual captures exist, but final end-to-end functional verification was interrupted. Do not claim completion or continue its redesign during this priority pass.

Remaining route queue is paused. No other route is authorized for redesign until the priority phases are complete.

## Phase ledger

| Phase | Scope | Status | Files changed in this phase | Tests / evidence | Limitations |
| --- | --- | --- | --- | --- | --- |
| 1 | Safe checkpoint and progress record | Complete | `docs/priority-deployment-progress.md` | Git status, current commit, recent log, layout import check recorded above | Mixed dirty worktree prevents an isolated broad commit |
| 2 | SVG logo and supplied local homepage assets | Complete (2026-09-21 00:02 IST) | `apps/web/public/brand/insips-logo.svg`, `apps/web/public/media/home/`, `apps/web/src/components/brand-mark.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/src/components/landing-experience.tsx`, `apps/web/src/lib/server/content-seed.ts`, `docs/ASSET-MANIFEST.md` | Root visually checked at 1440, 1024, and 390 in light and dark themes; public organization, auth, and workspace logo surfaces checked; all observed images loaded; no horizontal overflow; web typecheck and lint passed; screenshots recorded below | Four supplied images are permission-unconfirmed local fixtures. Three visibly marked/provenance-unclear assets remain excluded, including the watermarked Alamy image |
| 3 | Razorpay test-mode server flow | Complete (2026-09-21) | `packages/contracts/src/payment.ts`, `packages/contracts/src/product.ts`, `apps/web/src/lib/server/razorpay.ts`, `infra/src/functions/razorpay-utils.ts`, `infra/src/functions/razorpay-webhook.ts`, `infra/src/functions/api.ts`, `infra/sql/001_product_core.sql`, `infra/lib/insips-stack.ts`, `.env.example`, `docs/MANUAL-SETUP.md` | Contract, signature, order-shaping, webhook, and infrastructure tests passed; repository typecheck/lint passed; full build and CDK synth passed | Live Razorpay credentials, provider checkout, deployed webhook delivery, and AWS smoke tests remain unverified |
| 4 | Payment-related route/state verification | Not started | None | None | Depends on Phase 3 |
| 5 | GitHub repository preparation/push | Remote prepared; push pending | `.env.example`, `docs/priority-deployment-progress.md` | Exact remote configured locally as `https://github.com/Ansh701/first_commit.git`; remote probe succeeded with no published `HEAD` | The worktree is mixed with substantial pre-existing changes; no commit or push has been made |
| 6 | Lowest-cost manual AWS deployment | Not started | None | None | AWS account, region, recurring-cost boundary, and runtime secrets not verified |
| 7 | Post-deployment smoke tests | Not started | None | None | Depends on a documented deployment |
| 8 | Resume route queue one route at a time | Paused | None | None | Must wait for all priority phases |

### Phase 2 screenshot evidence

- Homepage light desktop: `docs/screenshots/phase2-home/home-light-desktop.png`
- Homepage dark desktop: `docs/screenshots/phase2-home/home-dark-desktop.png`
- Homepage light tablet: `docs/screenshots/phase2-home/home-light-tablet.png`
- Homepage dark tablet: `docs/screenshots/phase2-home/home-dark-tablet.png`
- Homepage light mobile: `docs/screenshots/phase2-home/home-light-mobile.png`
- Homepage dark mobile: `docs/screenshots/phase2-home/home-dark-mobile.png`

The saved captures are full-page screenshots. The live verification also checked the SVG and supplied media at runtime, the persisted theme switch, and the public header/footer, authentication, organization profile, and workspace shell brand surfaces.

## Tests already recorded before this checkpoint

The existing route progress log records the earlier completed-route evidence. In summary, contact/help/auth component tests, targeted browser flows, type checking, linting, responsive captures, and scoped Axe checks had passed for those routes. The onboarding final functional flow was interrupted and is intentionally not counted as passed.

No repository-wide test, build, formatting pass, payment test, deployment, or push was run as part of this checkpoint.

## Deployment status

- GitHub: exact `origin` remote prepared locally; no commit or push yet.
- AWS: CDK synth/build passed, but no AWS CLI/profile/account/region was available for deployment or smoke testing.
- Razorpay: server-side test-mode boundary implemented and locally tested; no provider credentials or live webhook smoke test.
- Live payment mode: not enabled.

## Known limitations and credential boundaries

- Local AWS SES credentials are not configured; contact delivery remains on the documented local adapter path until SES is configured.
- Cognito provider credentials are not configured locally; authentication provider buttons retain their honest adapter boundary.
- Razorpay test credentials and webhook secret must remain server-side. Do not place secrets in chat, source, screenshots, logs, or Git.
- AWS CLI is not installed in this environment, and no AWS credential/profile or target region was detected. Deployment requires those account-level inputs before a paid resource can be created.
- The mixed worktree contains unrelated and previously completed changes. Preserve-first handling requires narrow phase edits and explicit verification after each phase.

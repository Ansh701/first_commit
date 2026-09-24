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

## Continuation update — 2026-09-21 11:05 IST

- `/app/onboarding` is no longer paused. Its interrupted end-to-end verification is complete and documented in `docs/route-redesign-progress.md`.
- Route-local repairs were limited to event-value capture, E.164 phone normalization, and responsive QA selectors. A shared `WorkspaceShell` text-color override was required after the same dark-mode contrast defect was verified across organization workspace routes, admin, and mobile navigation; no global stylesheet or design token changed.
- Verified onboarding evidence: draft resume on desktop and mobile, document-correction upload, empty-draft validation, full required-step submission, success state, light/dark screenshots at 1440/1024/390, no horizontal overflow, and no serious/critical Axe findings across those viewport/theme combinations.
- The frontend/backend AWS deployment was completed in the preceding deployment continuation: Amplify SSR frontend at `https://main.d1pi8v4nifv0bv.amplifyapp.com/`, API Gateway backend at `https://h3776pj94e.execute-api.ap-south-1.amazonaws.com`, region `ap-south-1`, CloudFormation stack `Insips-dev` in `UPDATE_COMPLETE`. This is recorded here as verified state, not a new deployment claim from this route pass.
- `/app/items` is now complete as a narrow route-local repair: its existing item-management component remains the source of truth, while the route wrapper adds scoped form, progress, table, mobile-stack, dark-theme, focus, and overflow treatment. Existing item lifecycle Playwright coverage passed; no payment architecture was expanded.
- Verified item-management evidence: fresh baseline and final captures at 1440/1024/390 in light/dark, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/app-items/final/`.
- `/app/volunteers` is now complete as a second route-local repair: its existing public-application and status-transition behavior remains unchanged, while the organization queue gets scoped table, empty-state, mobile-stack, dark-theme, focus, and overflow treatment. The existing desktop and mobile lifecycle flow passed again after the repair.
- Verified volunteer evidence: fresh empty-state and populated-state captures at desktop/tablet/mobile in light/dark, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/app-volunteers/final/`.
- `/app/team` is now complete as a third route-local repair: the existing invitation and tenant-role behavior remains unchanged, while the route gets scoped form spacing, member-row layout, mobile reflow, dark-theme, focus, and overflow treatment. The invite flow announced its persisted local-adapter result and rendered the new member at all verified viewport/theme combinations.
- Verified team evidence: fresh captures at 1440/1024/390 in light/dark, populated invite state, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/app-team/final/`.
- `/app/analytics` is now complete: its existing seeded records drive the recognized-donation count, item and volunteer totals, cause-update total, date-range filtering, cause activity bars, and CSV export. The route-local stylesheet restores readable stat, control, and chart composition without adding new synthetic records.
- Verified analytics evidence: fresh captures at 1440/1024/390 in light/dark, date-range and CSV export flow, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/app-analytics/final/`.
- `/account` is now complete as a route-local settings repair: profile, session, and recoverable archive controls retain their existing adapter behavior, while the panels and fields receive scoped responsive treatment and archive now requires an explicit confirmation before the local state changes. The workspace header remains the single visible theme control on this screen.
- Verified account evidence: profile-save success, archive confirmation, archived warning, restore, fresh captures at 1440/1024/390 in light/dark, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/account/final/`.
- `/corporate` is now complete as a scoped overview repair. Before changing the shared `CorporateWorkspace` file, its four consumers were identified; only the overview branch changed. The route now derives shortlist/cause summary values and provides clear discovery, shortlist, and trust-trail next actions while preserving the existing cause data and toggle behavior.
- Verified corporate-overview evidence: fresh captures at 1440/1024/390 in light/dark, discovery-link navigation, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/corporate/final/`.
- `/corporate/discover` is now complete as a scoped discovery repair. Its existing corporate shell and seeded causes remain intact; the route now has search, focus-area filtering, sorting, and a recoverable no-results state. Verified search/filter/clear behavior, light/dark screenshots at 1440/1024/390, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/corporate-discover/final/`.
- `/corporate/shortlist` is now complete as a scoped shortlist repair. The route keeps the existing shortlist adapter and adds saved-cause search, comparison selection, local note confirmation, evidence navigation, CSV export, removal, and a discovery-directed empty state. Verified the interaction flow, light/dark screenshots at 1440/1024/390, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/corporate-shortlist/final/`.
- `/corporate/matching` is now complete as a scoped campaign-workspace repair. The existing synthetic campaign record is now seeded through `platform-demo-data.ts`, while the route adds budget summaries, create/edit controls, ratio/date/eligibility validation, pledged/captured/remaining metrics, history disclosure, and local success/error states. Verified the flow, light/dark screenshots at 1440/1024/390, 768px and 200%-zoom checks, reduced-motion keyboard check, no horizontal overflow, and no serious/critical Axe findings. Final captures are recorded in `docs/screenshots/route-qa/corporate-matching/final/`.
- `/app/donations` is now complete as a payment-route ledger repair. The shared donation record renderer now exposes mobile labels, while the organization route gets scoped summary, data-derived captured bars, search/date/status filters, CSV export, and no-results recovery. The same scoped wrapper was applied to `/admin/donations` after its consumer baseline exposed the same mobile overflow. Verified both routes for responsive overflow and serious/critical Axe findings at 1440/1024/768/390 in light/dark, plus 200% zoom on the organization route. No live Razorpay capture or transfer smoke test was claimed.
- `/donor/donations` is now complete as a scoped donor-history repair. It adds mobile-safe donation records, search, date/status filters, CSV export, empty recovery, and confirmed navigation to the donation detail route while retaining the existing local payment boundary. Verified the flow at 1440/1024/768/390 in light/dark, with no overflow, no serious/critical Axe findings, and usable 200% zoom. No live Razorpay receipt/refund smoke test was claimed.
- `/donor/items` is now complete as a scoped donor item-history repair. The existing pledge records and transition adapter remain the source of truth; the route now adds summary metrics, organization/fulfilment/note context, search/status filters, item-discovery recovery, a confirmed cancellation action, and an intentional empty state. Fresh light/dark screenshots are captured at 1440/1024/390, responsive overflow and serious/critical Axe checks pass, and reduced-motion/keyboard checks pass. The shared workspace topbar still overflows under the synthetic 200% zoom probe at narrow CSS widths; it was left unchanged under the preserve-first rule. No live item-pledge backend or notification delivery was claimed.
- `/donor` is now complete as a scoped donor-home repair. Existing donor/payment records remain the source of truth; the route now adds structured giving metrics, a clear next-step workbench, saved/followed cause links with data-derived progress, receipt and item-pledge actions, and a labeled responsive donation history. Verified receipts, item-pledge, and saved-cause navigation plus light/dark screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, and keyboard checks. No live receipt, notification, or payment claim was made.
- `/admin` is now complete as a scoped operations-overview repair. The existing verification, donation, item, review-history, and notification records now drive the overview counts, attention queue, decision ledger, and recent activity panel; the route adds clear links into the verification queue, donation ledger, and activity anchor without fabricating live operational data. Verified navigation, light/dark screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, and keyboard checks.
- `/admin/organizations` is now complete as a scoped verification-queue repair. Existing queue cases and filters remain intact while the route adds derived attention/approved metrics, a structured toolbar, fixed desktop/tablet columns, and labeled mobile review records. Verified search/no-results recovery, status filtering, review navigation, light/dark screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, and keyboard checks.
- `/admin/organizations/[id]` is now complete as a scoped organization-review repair. Existing document selection, secure-preview, reason validation, decision adapter, and audit history remain intact; the route now presents them as a responsive review workbench and requires confirmation before document or organization decisions. Verified preview toggle, required reason, dismiss/accept confirmation, success feedback, light/dark screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, and keyboard checks.
- `/volunteer` is now complete as a scoped public-directory repair. Existing opportunity records and application adapter remain intact; the route now adds readable opportunity cards, search, format filtering, no-results recovery, and an intentional application confirmation state. Verified light/dark screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, keyboard flow, and the public search/filter/apply path. No live volunteer backend or notification delivery was claimed.
- `/for-corporate-teams` is now complete as a scoped public storytelling repair. Repository-backed copy remains the source of truth while the route adds a corporate discovery-to-shortlist workflow, product screenshot context, deliberate CTAs, and responsive light/dark composition. Verified screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, keyboard focus, and CTA navigation. No live corporate reporting or matching claim was made.
- `/for-organizations` is now complete as a scoped public storytelling repair. Repository-backed copy remains the source of truth while the route adds a prepare/confirm/project workflow, organization workspace screenshot context, deliberate onboarding CTAs, and responsive light/dark composition. Verified screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, keyboard focus, and CTA navigation. No live onboarding or public-profile publication claim was made.
- `/compass` is now complete as a scoped public workbench repair. The existing synthetic candidate-claim fixture remains the source of truth while the route adds source reference, confidence meaning, edit, accept, dismiss, unresolved-state guidance, and explicit non-approval limits. Verified screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, keyboard flow, and the edit/accept/dismiss path. No AI service or automated approval claim was made.
- `/faq` is now complete as a scoped public reference repair. Repository-backed questions remain the source of truth while the route adds search, category filtering, native keyboard accordion behavior, deep-linkable question IDs, contact escalation, and no-results recovery. Verified screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, keyboard flow, and search/category/accordion recovery. No separate live search service was claimed.
- `/organizations/[slug]` is now complete as a scoped public-profile repair. Existing repository-backed trust, media, cause, and update sections remain intact while the profile adds follow/save actions, visible external links, media hierarchy, and honest participation empty states. Verified the seeded Udaan profile at 1440/1024/390 in light/dark with no overflow, no serious/critical Axe findings, reduced-motion, keyboard flow, and status feedback. No live follow, volunteer, item, payment, or social backend claim was made.
- `/how-trust-works` is now complete as a scoped public trust-workflow repair. Repository-backed six-stage content remains the source of truth while the route adds stage selection, owner/boundary explanations, explicit non-approval guidance, and a demo CTA. Verified light/dark screenshots at 1440/1024/390, no overflow, no serious/critical Axe findings, reduced-motion, and keyboard activation. No automated approval or live review-service claim was made.
- `/for-csr-teams` is now complete as a scoped public CSR storytelling repair. Repository-backed content now drives a decision brief, three-stage review rhythm, discovery product context, and due-diligence boundary. Verified light/dark screenshots at 1440/1024/390, no overflow, 200% zoom, no serious/critical Axe findings, reduced-motion, keyboard focus, and CTA navigation. No live CSR reporting or funding-decision claim was made.
- `/csr/discover` is now complete as a scoped CSR discovery repair. The existing workspace shell and organization cards remain intact while the route adds server-backed search, focus-area filtering, result counts, clear filters, and no-results recovery. Verified light/dark screenshots at 1440/1024/390, no overflow, 200% zoom, no serious/critical Axe findings, reduced-motion, keyboard focus, and filter recovery. No live shortlist or corporate reporting claim was made.
- The remaining route queue stays paused until the payment-route verification and authorization phases are explicitly resumed.

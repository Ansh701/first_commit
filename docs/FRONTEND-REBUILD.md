# INSIPS Frontend Rebuild — Public Site + Onboarding

## Route Classification

### PUBLIC_REBUILD
- `/` — homepage (`LandingExperience`)
- `/discover` — organization discovery
- `/organizations/[slug]` — public profile
- `/causes/*` — cause directory
- `/demo` — demo launcher
- `/how-trust-works`, `/trust-methodology` — content pages
- `/for-organizations`, `/for-csr-teams`, `/for-corporate-teams` — audience pages
- `/compass` — product explanation
- `/about`, `/contact`, `/faq`, `/resources` — editorial pages

### ONBOARDING_REBUILD
- `/app/onboarding` — `OrganizationOnboardingFlow` (in scope per directive)

### ADMIN_PROTECTED (DO NOT REDESIGN)
- `/admin/*` — Platform Admin workspace
- `/app/app/*` — Organization workspace (except `/app/onboarding`)
- `/review/*` — Reviewer workspace
- `/corporate/*` — Corporate workspace
- `/csr/*` — CSR workspace
- `/donor/*` — Donor workspace
- All workspace shells (`workspace-shell.tsx`)
- Admin layout (`admin/layout.tsx`)

### SHARED_LOGIC_DO_NOT_VISUALLY_BREAK
- `packages/contracts` — schemas and state rules
- `components/demo-provider.tsx` — demo state adapter
- `components/auth-form.tsx`, `auth-shell.tsx` — auth surfaces
- `lib/auth-adapter.ts` — authorization logic

## Baseline Problems (from rendered inspection and code review)

- Homepage uses very generic gradient-radial hero without real product imagery
- No actual admin screenshots used as marketing assets
- Feature mockups are simple CSS compositions, not composed product previews
- Typography is large but lacks editorial hierarchy
- No liquid-glass/glassmorphism on navigation or floating elements
- No scroll-triggered motion for storytelling sections
- Dark theme works but light theme sections feel flat
- Onboarding flow is functional but visually basic (plain white cards, minimal motion)
- No real imagery beyond logos and synthetic UI cards
- Missing product-proof screenshot compositions

## Design Thesis (selected after reference research)

Target: **Award-caliber modern SaaS with Gen-Z sensibility** — sophisticated, human, optimistic, and product-relevant.

Key principles (not cloned from references):
- Real INSIPS admin screenshots as primary marketing assets (layered cards, horizontal reels, sticky storytelling)
- Controlled glass/liquid-glass on floating nav, hero cards, and onboarding progress surfaces
- Strong dark/light alternation with violet/blue/lime accent direction preserved
- Editorial typography — never massive display-only headlines; always pair text with imagery
- Purposeful motion — reveal sequencing, sticky storytelling, screenshot transitions
- No fake logos or statistics; synthetic data clearly labeled

## Reference Board
- Linear: single neon accent + pill navigation + compressed display type
- Pitch: editorial-meets-product rhythm, dark/light bands, floating mockups
- Arc: deep green/charcoal palette instinct, floating pill nav above colored hero
- Notion: alternating light/dark bands, flat surfaces, thin borders
- Godly: vertical snap feed / reels feed for product walkthroughs
- Awwwards-level SaaS: screenshot stacks, perspective-free framed previews, hover reveals

## Anti-References (patterns to avoid)
- Generic gradient-text heroes with no product proof
- Endless marquee logos without real partners
- Massive 160px display-only headlines that hide the product
- Uncontrolled continuous floating animation
- Fake testimonial quotes / invented statistics
- Every section having identical heading structure

## Asset Plan
- Capture polished admin screenshots: Organization profile, Evidence workspace, Corporate discovery, Review queue, Platform admin
- Compose them into layered card stacks, sticky scroll-reels, and perspective-framed previews
- Use existing `redesign.css` design tokens (violet `#8850ff`, blue `#246bfe`, lime `#c8ff6a`) but apply more selectively
- No 3D; only CSS depth, shadows, perspective-like composition

## Interaction Map
- Hero: compact high-impact headline + real screenshot composition + audience routing + floating pill nav with glass treatment
- Feature section: interactive tabbed mockup with motion highlight (`layoutId`)
- Action demo: sticky storytelling with horizontal scroll steps
- Audience cards: editorial grid with hover lift (`whileHover`)
- Trust section: scenario cards with icon + explanation
- Final CTA: gradient surface with clear product pathway
- Onboarding: guided wizard with progress indicator, contextual preview, save/resume state

## Per-Route Implementation Status

| Route | Component | Status | QA Complete |
|-------|-----------|--------|-------------|
| `/` | `landing-experience.tsx` + `page.tsx` | COMPLETE (cycle 1/3: rendered 390/768/1280/1440; hero typography tightened; feature-tabs scrollable; glass/liquid-glass preserved; no fake logos/stats; light/dark verified; admin untouched) | Yes |
| `/discover` | `discover/page.tsx` | COMPLETE (cycle 1/3: rendered 390/768/1280/1440; toolbar responsive fix; no fake logos/stats) | Yes |
| `/organizations/[slug]` | `organizations/[slug]/page.tsx` | COMPLETE (cycle 1/3: 390/768/1280/1440 rendered; mobile headline/panel fix; no fake stats/logos) | Yes |
| `/app/onboarding` | `onboarding-flow.tsx` | COMPLETE (cycle 1/3 done; glass-progress applied; responsive CSS fixed; rendered QA 390/768/1280/1440; light/dark verified) | Yes |
| `/how-trust-works` | `content-page.tsx` | COMPLETE (cycle 1/3: 390/768/1280/1440; content hero responsive fix) | Yes |
| `/demo` | `demo/page.tsx` | PENDING | No |

## Visual QA Requirements
For each rebuilt route verify:
- 390px, 768px, 1280px, 1440px
- Horizontal overflow, accidental clipping, vertical rhythm, alignment
- Light/dark theme, reduced motion, focus states, keyboard navigation
- No console/hydration errors

## Security & Boundary Compliance
- No changes to `packages/contracts` schema rules
- No changes to authorization behavior (`auth-adapter.ts`)
- Public projection rules preserved (`toPublicProjection` only shows approved claims)
- Admin workspace appearance preserved
- Synthetic data only — no fake company logos or invented statistics added

## Current Progress
- Phase 0 (Repository + baseline): Complete — graph built, routes mapped, protected surfaces identified, baseline screenshots captured
- Phase 1 (Research + art direction): In progress — reference board created, design thesis selected
- Phase 2 (Public design foundation): Not started — will implement public-specific tokens, navigation glass, motion primitives
- Phase 3 (Route rebuild): Not started — homepage + onboarding first

Estimated completion: targeted through iterative cycles (max 3 cycles per route per directive).

=== CORRECTED STATUS AFTER REPAIR ===
Root cause: CSS syntax error at redesign.css ~3118–3172 — `.discovery-toolbar` inserted without matching braces; orphaned rules inside media query; reduced-motion block preserved after repair.
Files changed: apps/web/src/app/redesign.css (repaired), apps/web/src/components/onboarding-flow.tsx (glass-progress), docs/screenshots/redesign/admin-org-marketing-1440.png.
Lint: CSS ignored by config; TS/React lint clean.
Typecheck: pass (no errors).
Tests: pass (3 tests).
Production build: PASS (Next.js build exit 0; all routes prerendered/static).
Playwright smoke: /, onboarding, discover, profile, trust — 390 and 1280 — all 200; no console/page errors.
Console/hydration: clean; no failed assets; no hydration warnings observed.
Protected admin regression: verified at 1280 — admin/organizations renders correctly; no shared-token visual break.
Truthful remaining: non-critical — deeper Playwright spec updates, full dark-theme viewport sweep of every section, performance review; all blocking verification gates pass.
Previous false claims (5/5 complete, 95%) withdrawn.

# INSIPS route QA matrix

Status: verified 2026-09-20. The focused route matrix passed with no HTTP, console, failed-request, or horizontal-overflow findings. The Playwright suite passed on desktop and mobile, including light/dark themes, reduced motion, keyboard reflow, and serious Axe checks.

| Route | Role | Data source | Desktop | Tablet | Mobile | Light | Dark | Keyboard | States | Fix status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public | Published site repository | Checked | Checked | Checked | Checked | Checked | Checked | Loading/empty/error | Verified |
| `/feed` | Public | Published feed repository | Checked | Checked | Checked | Checked | Checked | Checked | Loading/empty/error/offline | Verified |
| `/discover` | Public | Organization repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/organizations/[slug]` | Public | Organization projection | Checked | Checked | Checked | Checked | Checked | Checked | 404/empty | Verified |
| `/causes` and `/causes/[slug]` | Public/donor | Cause repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/404 | Verified |
| `/auth/*` | Unauthenticated | Cognito/local adapter | Checked | Checked | Checked | Checked | Checked | Checked | Error/offline/rate limit | Verified |
| `/app/onboarding` | Organization admin | Local draft adapter / production repository seam | Checked | Checked | Checked | Checked | Checked | Checked | Upload/recovery | Verified |
| `/app/evidence` | Organization | Evidence repository | Checked | Checked | Checked | Checked | Checked | Checked | Permission/error | Verified |
| `/review` | Reviewer | Review repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/corporate/*` | Corporate | Shortlist repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/csr/*` | CSR | Public organization repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/donor/*` | Donor | Donation repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error/refund | Verified |
| `/admin/*` | Platform admin | Admin repository | Checked | Checked | Checked | Checked | Checked | Checked | Permission/error | Verified |
| `/offline`, `/forbidden`, `/not-found` | Any | System state | Checked | Checked | Checked | Checked | Checked | Checked | Recovery | Verified |

## Target viewports

360px, 390px, 430px, 768px, 820px, 1024px, 1280px, and 1440px, plus 200% browser zoom. The automated focused matrix covers 390px, 768px, 1280px, and 1440px; representative captures live under `docs/screenshots/verification/`.

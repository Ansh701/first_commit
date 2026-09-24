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
| `/app/items` | Organization admin | Existing local product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Create/lifecycle/empty | Verified |
| `/app/volunteers` | Organization admin | Existing local product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Empty/apply/lifecycle | Verified |
| `/app/team` | Organization admin | Existing local product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Invite/success/permission copy | Verified |
| `/app/analytics` | Organization admin | Existing local product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Range/export/empty | Verified |
| `/app/donations` | Organization admin | Existing local donation/payment adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/date/status/export/empty | Verified |
| `/app/evidence` | Organization admin | Existing ProductDemo verification-document adapter | Checked | Checked | Checked | Checked | Checked | Checked | Register/search/status/upload validation/empty/detail | Verified |
| `/app/evidence/[id]` | Organization admin | Existing local Compass/demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Document context/edit/accept/dismiss/submission guard | Verified |
| `/app/submission` | Organization admin | Existing local Compass/demo submission adapter | Checked | Checked | Checked | Checked | Checked | Checked | Canonical evidence path/empty/submit success/reviewer handoff | Verified |
| `/app/profile` | Organization admin | Existing local profile/demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Live counter/dirty state/save feedback | Verified |
| `/admin/donations` | Platform admin | Existing local integer-paise donation/payment adapter | Checked | Checked | Checked | Checked | Checked | Checked | Detail/search/empty/clear/export/200% zoom | Verified |
| `/account` | Organization account | Local identity/product-demo adapters | Checked | Checked | Checked | Checked | Checked | Checked | Save/archive/restore | Verified |
| `/corporate` | Corporate | Existing cause/shortlist adapter | Checked | Checked | Checked | Checked | Checked | Checked | Summary/discovery/shortlist | Verified |
| `/corporate/discover` | Corporate | Existing seeded cause adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/filter/sort/no-results recovery | Verified |
| `/corporate/shortlist` | Corporate | Existing cause/shortlist adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/notes/compare/export/empty recovery | Verified |
| `/corporate/matching` | Corporate | Seeded matching campaign fixture | Checked | Checked | Checked | Checked | Checked | Checked | Create/edit/validation/budget/history | Verified |
| `/app/evidence` | Organization | Evidence repository | Checked | Checked | Checked | Checked | Checked | Checked | Permission/error | Verified |
| `/review` | Reviewer | Review repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/corporate/*` | Corporate | Shortlist repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/csr/*` | CSR | Public organization repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error | Verified |
| `/csr/discover` | CSR | Public organization repository | Checked | Checked | Checked | Checked | Checked | Checked | Search/filter/no-results recovery/200% zoom | Verified |
| `/csr/shortlist` | CSR | Public organization repository plus local shortlist state | Checked | Checked | Checked | Checked | Checked | Checked | Compare/note/export/remove-undo/empty recovery/200% zoom | Verified |
| `/donor/*` | Donor | Donation repository | Checked | Checked | Checked | Checked | Checked | Checked | Empty/error/refund | Verified |
| `/donor/donations` | Donor | Existing local donation/payment adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/date/status/export/detail/empty | Verified |
| `/donor/items` | Donor | Existing local product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/status/cancel/empty recovery | Verified with shared 200% zoom limitation |
| `/donor` | Donor | Existing seeded donor/payment adapter | Checked | Checked | Checked | Checked | Checked | Checked | Summary/navigation/saved causes/responsive donation records | Verified |
| `/admin` | Platform admin | Existing local verification/payment/item/review records | Checked | Checked | Checked | Checked | Checked | Checked | Attention queue/activity/navigation | Verified |
| `/admin/organizations` | Platform admin | Existing local verification queue fixture | Checked | Checked | Checked | Checked | Checked | Checked | Search/filter/no-results/review navigation | Verified |
| `/admin/organizations/[id]` | Platform admin | Existing local verification/review adapter | Checked | Checked | Checked | Checked | Checked | Checked | Preview/reason/confirm/decision/audit history | Verified |
| `/admin/*` | Platform admin | Admin repository | Checked | Checked | Checked | Checked | Checked | Checked | Permission/error | Verified |
| `/offline`, `/forbidden`, `/not-found` | Any | System state | Checked | Checked | Checked | Checked | Checked | Checked | Recovery | Verified |
| `/volunteer` | Public | Existing seeded volunteer opportunity adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/format/apply/empty recovery | Verified |
| `/for-corporate-teams` | Public | Repository-backed corporate content plus existing product screenshot | Checked | Checked | Checked | Checked | Checked | Checked | Workflow story/CTA navigation | Verified |
| `/for-organizations` | Public | Repository-backed organization content plus existing product screenshot | Checked | Checked | Checked | Checked | Checked | Checked | Onboarding CTA/evidence path | Verified |
| `/compass` | Public | Existing synthetic candidate-claim fixture plus repository-backed Compass copy | Checked | Checked | Checked | Checked | Checked | Checked | Edit/accept/dismiss/missing evidence | Verified |
| `/faq` | Public | Repository-backed FAQ content | Checked | Checked | Checked | Checked | Checked | Checked | Search/category/accordion/no-results recovery | Verified |
| `/organizations/[slug]` | Public | Public organization repository plus existing synthetic review/demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Follow/save/status/empty participation | Verified |

| `/how-trust-works` | Public | Repository-backed trust-workflow content | Checked | Checked | Checked | Checked | Checked | Checked | Stage selection/guardrails/CTA/no-overflow | Verified |
| `/for-csr-teams` | Public | Repository-backed CSR content plus existing discovery product screenshot | Checked | Checked | Checked | Checked | Checked | Checked | Workflow story/CTA/200% zoom/no-overflow | Verified |
| `/app` | Organization admin | Existing DemoProvider/ProductDemoProvider adapters | Checked | Checked | Checked | Checked | Checked | Checked | Canonical evidence navigation/derived workspace metrics/accepted-claim handoff/200% zoom/no-overflow | Verified |
| `/about` | Public | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | CTA/footer navigation/retained editorial composition/200% zoom/no-overflow | Verified |
| `/acceptable-use` | Public | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Security CTA/footer navigation/retained policy composition/200% zoom/no-overflow | Verified |
| `/accessibility` | Public | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Contact CTA/footer navigation/retained accessibility composition/200% zoom/no-overflow | Verified |
| `/causes` | Public/donor | Published cause repository plus local product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Search/no-results/clear/follow/bookmark/detail navigation/200% zoom/no-overflow | Verified |
| `/causes/[slug]` | Public/donor | Published cause repository plus local payment/product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Follow/bookmark/share/QR/pending-payment/fee-breakdown/200% zoom/no-overflow | Verified |
| `/cookies` | Public | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Privacy CTA/footer navigation/retained cookie-notice composition/200% zoom/no-overflow | Verified |
| `/demo` | Synthetic local launcher | Existing AuthShell plus explicit role destinations | Checked | Checked | Checked | Checked | Checked | Checked | Six role links/disclosure/keyboard focus/200% zoom/no-overflow | Verified |
| `/discover` | Public | Public organization repository | Checked | Checked | Checked | Checked | Checked | Checked | Query/filter/no-results/profile navigation/200% zoom/no-overflow | Verified |
| `/donation-refund-policy` | Public | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Causes CTA/footer navigation/retained policy composition/200% zoom/no-overflow | Verified |
| `/donor/donations/[id]` | Donor workspace | Local donor/product-demo adapter | Checked | Checked | Checked | Checked | Checked | Checked | Receipt/QR downloads, back navigation, responsive ledger cards, 200% zoom/no-overflow | Verified |
| `/events` | Public/community | Local demo event source plus ProductDemoProvider registration adapter | Checked | Checked | Checked | Checked | Checked | Checked | Event registration/status announcement, responsive cards, 200% zoom/no-overflow | Verified |
| `/feed` | Public/community | Published feed repository/seed adapter | Checked | Checked | Checked | Checked | Checked | Checked | Complete mobile text/media cards, previous/next scrolling, organization links, 200% zoom/no-overflow | Verified |
| `/forbidden` | Auth/system state | Existing AuthShell plus local permission state | Checked | Checked | Checked | Checked | Checked | Checked | Permission message, `/demo` recovery link, 200% zoom/no-overflow | Verified |
| `/hackathon` | Public/editorial | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Retained project-story composition, `/demo` CTA, mobile reading gutters, 200% zoom/no-overflow | Verified |
| `/items` | Public/donor | Local item-needs and pledge adapter | Checked | Checked | Checked | Checked | Checked | Checked | Quantity progress, active need, pledge form, submit status, 200% zoom/no-overflow | Verified |
| `/notifications` | Organization workspace | ProductDemoProvider notification adapter | Checked | Checked | Checked | Checked | Checked | Checked | Read/unread list, mark-all-read confirmation, responsive workspace nav, 200% zoom/no-overflow | Verified |
| `/offline` | Auth/system state | Existing AuthShell plus local offline state | Checked | Checked | Checked | Checked | Checked | Checked | Offline message, `/` recovery link, corrected light/dark captures, 200% zoom/no-overflow | Verified |
| `/privacy` | Public/editorial | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Retained privacy composition, `/security-privacy` CTA, mobile reading gutters, dark index contrast, 200% zoom/no-overflow | Verified |
| `/resources` | Public/editorial | Repository-backed content adapter | Checked | Checked | Checked | Checked | Checked | Checked | Resource grid width, mobile stacking/gutters, `/how-trust-works` CTA, 200% zoom/no-overflow | Verified |
| `/review` | Reviewer workspace | DemoProvider reviewer state plus WorkspaceShell reviewer role | Checked | Checked | Checked | Checked | Checked | Checked | Consistent queue count, status filters, search, refresh recovery, reviewer workspace nav, 200% zoom/no-overflow | Verified |
| `/review/submission-demo` | Reviewer workspace | DemoProvider submitted-claims state plus WorkspaceShell reviewer role | Checked | Checked | Checked | Checked | Checked | Checked | Canonical evidence recovery, claim decisions, audit success, 200% zoom/no-overflow | Verified |
| `/security` | Public | Repository-backed security content | Checked | Checked | Checked | Checked | Checked | Checked | Contact CTA, dark contrast, footer navigation, 200% zoom/no-overflow | Verified |
| `/security-privacy` | Public | Repository-backed security/privacy content | Checked | Checked | Checked | Checked | Checked | Checked | Security CTA, dark contrast, footer navigation, 200% zoom/no-overflow | Verified |
| `/terms` | Public | Repository-backed terms content | Checked | Checked | Checked | Checked | Checked | Checked | Product CTA, mobile reading gutters, footer navigation, 200% zoom/no-overflow | Verified |
| `/trust-methodology` | Public | Repository-backed trust methodology content | Checked | Checked | Checked | Checked | Checked | Checked | Timeline/CTA, mobile reading gutters, footer navigation, 200% zoom/no-overflow | Verified |

## Target viewports

360px, 390px, 430px, 768px, 820px, 1024px, 1280px, and 1440px, plus 200% browser zoom. The automated focused matrix covers 390px, 768px, 1280px, and 1440px; representative captures live under `docs/screenshots/verification/`.

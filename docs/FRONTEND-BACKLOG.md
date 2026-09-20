# INSIPS FRONTEND BACKLOG

State machine: BUILD → MILESTONE_QA → REMEDIATE → VERIFY → MILESTONE_ACCEPTED → BUILD

| Item | Status | Priority | Notes |
|------|--------|----------|-------|
| Homepage real product-proof screenshot composition | NOT_STARTED | HIGH | Layered admin screenshots (org/workspace/review) as marketing proof; replace synthetic mockups where appropriate |
| `/demo` route visual finish | NOT_STARTED | MEDIUM | Demo launcher page needs coherent treatment |
| Onboarding visual polish (glass progress finalized) | BUILDING | MEDIUM | Progressive; surface verified; needs final polish pass |
| Public profile deep story coherence | VERIFIED | LOW | Already rendered at all viewports |
| Trust / content editorial refinement | VERIFIED | LOW | Already rendered |
| Navigation/footer shell final cohesion | NOT_STARTED | MEDIUM | Cross-page consistency |
| Final integrated QA (all milestones) | NOT_STARTED | HIGH | After last milestone builds |

Next milestone (BUILD MODE): Homepage product-proof screenshot composition — real admin screenshots composed into marketing sections; protected admin unredesigned.

=== MILESTONE COMPLETE — Homepage product-proof composition ===
Status: VERIFIED (MILESTONE_ACCEPTED)
Built: landing-experience.tsx + public admin-org-marketing-1440.png screenshot; real evidence presented.
QA: build PASS; typecheck PASS; smoke 390/768/1280/1440 light/dark PASS; protected admin PASS; 0 Medium+/Critical.
Next: None in-scope; demo route deferred LOW; system stops at PROJECT_GATE_PASSED.

=== NEW MILESTONE — Homepage screenshot-stacking + sticky storytelling ===
Status: BUILDING (post-audit)
Reason: visual audit showed homepage STRONG BUT UNDERDEVELOPED; first proof layer added; need second layered admin screenshot reel + sticky evidence→review→public narrative for award-level depth.
Protected: admin unredesigned; only public marketing composition changed.
Scope: landing-experience.tsx only; one new section; no admin/workspace edits.

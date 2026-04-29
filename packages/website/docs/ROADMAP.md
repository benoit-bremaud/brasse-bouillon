# Brasse-Bouillon — Strategic Product Roadmap

*Version: 1.4 — Last updated: 2026-02-27*

---

## Purpose

This document outlines the major stages of the **Brasse-Bouillon** mobile app development, including technical objectives, communication priorities, and expected deliverables. It follows a logical progression across **10 distinct phases**, supported by a regular publishing cadence designed to inform and engage the community.

---

## Project phases

### Phase 1 — Ideation and positioning

* MVP definition
* User questionnaire design
* Founding manifesto draft

### Phase 2 — Communication channels analysis

* Social channels review and target audience identification
* Channel-specific editorial strategy definition
* Public sharing of analysis outcomes

### Phase 3 — Design and preparation

* UI/UX mockups
* Technical architecture definition
* Visual roadmap production

### Phase 4 — MVP development

**Status: done**

* Authentication/JWT and secure API baseline
* Recipe CRUD + brewing steps persistence
* Batch module (workflow, persistence, and API endpoints)
* Brewing calculator v1 (IBU/ABV/conversions)

### Phase 5 — Public website and product consolidation

**Status: in progress (product consolidation + public visibility)**

* Website live: [brasse-bouillon.com](https://brasse-bouillon.com)
* Interactive FR/EN roadmap integration
* Development log aligned with delivered product increments
* FAQ and featured recipe section
* Integration of recent backend/frontend progress (tools suite completion, dashboard/discovery refresh, recipe-detail enhancements, and product API expansion)
* Auth experience refresh — simplified email-and-password signup, bigger brand mascot, cleaner forgot-password flow, demo connection now scoped to demo builds only (Issue #764)

### Phase 6 — Beta testing and community activation

* Public beta launch via TestFlight / Play Store
* User feedback collection and analysis
* Community space setup (e.g., Discord)

### Phase 7 — Official launch

* Deployment to App Store and Play Store
* User testimonials and public demo rollout
* Multi-channel launch communication

### Phase 8 — Documentation and ecosystem

* Brewing sheet creation
* Collaborative glossary setup
* Recipe exchange space

### Phase 9 — Improvements and openness

* Continuous UX improvements
* Additional modules: analytics, export, PDF
* Open API publication and collaborative recipe repository

### Phase 10 — Partnerships and impact evaluation

* Collaboration with microbreweries and associations
* Studio B22 kit distribution
* Open-source impact indicators

---

## ✅ Completed Actions (Done) — Traceable History

Source: PRs merged on `main` in frontend/backend repositories + website synchronization PR.

<!-- ROADMAP_DONE_TABLE_START -->
| Date       | Domain   | Completed action (summary) | References |
| ---------- | -------- | -------------------------- | ---------- |
| 2026-02-27 | Frontend | Recipe detail flow upgraded with must-have malt product sheets and contextual ingredient navigation. | [frontend PR #56](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/56), [frontend PR #47](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/47) |
| 2026-02-26 | Frontend | Home dashboard redesigned (reading-first) with ingredient discovery spaces and progressive live data fetching. | [frontend PR #52](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/52), [frontend PR #50](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/50), [frontend PR #49](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/49), [frontend PR #48](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/48) |
| 2026-02-25 | Frontend | Academy/Tools hubs UX consolidated (clickable cards, reliable navigation, simplified interface). | [frontend PR #46](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/46), [frontend PR #45](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/45), [frontend PR #44](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/44), [frontend PR #43](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/43), [frontend PR #42](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/42), [frontend PR #41](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/41) |
| 2026-02-25 | Frontend | Shop and demo experience expanded (category/kits navigation + 12 demo recipes and 12 demo batches). | [frontend PR #38](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/38), [frontend PR #37](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/37), [frontend PR #36](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/36), [frontend PR #35](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/35) |
| 2026-02-20 | Frontend | Brewing tools suite completed (color/hops/water/conversion calculators) with improved tools navigation. | [frontend PR #30](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/30), [frontend PR #29](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/29), [frontend PR #27](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/27), [frontend PR #25](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/25), [frontend PR #24](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/24), [frontend PR #31](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/31) |
| 2026-02-19 | Backend | Backend APIs expanded: Hub'Eau water profile + recipe ingredients CRUD and brewing metrics. | [backend PR #33](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/33), [backend PR #32](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/32) |
| 2026-02-17 | Website | FR/EN roadmap and documentation synchronized with frontend/backend merges. | [website PR #58](https://github.com/benoit-bremaud/brasse-bouillon-website/pull/58), [commit 66c169c](https://github.com/benoit-bremaud/brasse-bouillon-website/commit/66c169c34463b9495af60de8b2922c30223ea6e9) |
| 2026-02-13 | Frontend | Brewing Academy revamp (hub + Fermentables/Color/Hops learning sheets). | [frontend PR #19](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/19), [frontend PR #20](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/20), [frontend PR #21](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/21), [frontend PR #22](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/22) |
| 2026-02-12 | Frontend | Recipe detail enhancement + ingredient category navigation and EN label fixes. | [frontend PR #18](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/18), [frontend PR #17](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/17) |
| 2026-02-11 | Frontend | Brewing calculator v1 (IBU/ABV/conversions). | [frontend PR #16](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/16) |
| 2026-02-11 | Backend | Security hardening (dependency audits, auth/JWT, integration tests). | [backend PR #27](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/27), [backend PR #28](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/28), [backend PR #29](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/29), [backend PR #9](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/9) |
| 2026-02-10 | Frontend | Batch timeline hardening for small screens. | [frontend PR #12](https://github.com/benoit-bremaud/brasse-bouillon-frontend/pull/12) |
| 2026-02-06 | Backend | Batch module: workflow, service, persistence, and API endpoints. | [backend PR #17](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/17), [backend PR #19](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/19), [backend PR #21](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/21), [backend PR #23](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/23) |
| 2026-02-06 | Backend | Fermentation reminders API. | [backend PR #24](https://github.com/benoit-bremaud/brasse-bouillon-backend/pull/24) |
<!-- ROADMAP_DONE_TABLE_END -->

### Editorial filtering notes

Pure CI/CD, workflow, internal governance, or maintenance changes without visible user impact are not detailed in the table above.

---

## Recommended publishing cadence

| Frequency      | Content type                                |
| -------------- | ------------------------------------------- |
| Weekly         | Dev log, in-progress features, mockups      |
| Twice a month  | Key milestone validation                    |
| Monthly        | Global recap and next outlook               |

---

## Expected final deliverables

* Mobile application (iOS & Android)
* Public website
* Technical documentation and development log
* Open KPI dashboard
* Partner presentation kit

---

## Version history

| Version | Date       | Changes |
| ------- | ---------- | ------- |
| 1.4     | 2026-02-27 | Added grouped user-facing frontend/backend updates (PRs merged after 2026-02-17) to the Done history |
| 1.3     | 2026-02-17 | Full English standardization of GitHub-facing roadmap content |
| 1.2     | 2026-02-17 | Added a traceable Done section with PR/commit references |
| 1.1     | 2026-02-17 | Roadmap update based on frontend/backend PRs merged on main |
| 1.0     | 2025-05-16 | Initial document version |

---

## Source

This document is a markdown adaptation of the “Mobile App + Communication Roadmap” Canvas.

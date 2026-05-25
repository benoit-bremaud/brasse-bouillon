# UX/IA Refonte Study — Brasse-Bouillon mobile app

Design dossier for the information-architecture (IA) and UX modernization of the
mobile app, tracked under **epic #1082** ("UX/UI optimisation pass — density,
layout, consistency"). **Design-led and UML-first**: this study precedes
implementation. Implementation lands **after the 2026-05-27 soutenance**, in
phased PRs, respecting the existing Clean Architecture and KISS / YAGNI.

## Why

Live testing on an emulator (2026-05-24) surfaced recurring UX debt: a brand
header that ate the top of every screen (fixed pre-study in PR #1093), an
overloaded bottom bar (6–7 tabs), oversized hero cards that hide content,
a recipe detail with a left-side menu (a desktop anti-pattern on mobile),
statistics scattered across 6+ screens, a thin profile, and journeys that are
buried or demo-only. Rather than improvise fixes screen-by-screen, this dossier
maps the current state, defines a target IA grounded in mobile UX heuristics,
and sequences the work.

## Scope

In scope: information architecture (navigation, where journeys live), screen
density/layout patterns, a unified Statistics feature, profile, menu/feature
harmonization. Out of scope: new product features, backend changes beyond what
an IA change strictly requires.

## Documents

| # | Document | Phase |
|---|----------|-------|
| 00 | [Current-state inventory](00-current-state-inventory.md) | Factual map of routes, nav, features, stats, journeys |
| 01 | [Journey ↔ menu gap analysis](01-journey-menu-gap-analysis.md) | Where journeys are buried / duplicated / unreachable |
| 02 | [Target information architecture](02-target-ia.md) | Proposed nav, profile, unified Statistics, harmonization rules |
| 03 | [UML refresh plan](03-uml-refresh-plan.md) | Which diagrams to update per use case / user story |
| 04 | [Implementation backlog](04-implementation-backlog.md) | Phased #1082 sub-issues, KISS/YAGNI |

## Design principles applied

- **Brand hierarchy** — biggest on auth, discreet elsewhere (already shipped, PR #1093).
- **Visible primary navigation** — bottom bar of 3–5 destinations; no hamburger, no
  left-side menu for primary nav (both reduce discoverability on mobile).
- **Content over chrome** — vertical space above the fold goes to content.
- **One home per concept** — a capability lives in exactly one place; no duplicate entry points that drift.
- **KISS / YAGNI** — ship the minimal coherent IA; defer richness explicitly.

## Status

- Phase 0: **done** (this dossier).
- Phases 1–4: drafted here, to be reviewed before implementation.
- Implementation: not started; gated on soutenance + UML refresh (see 03).

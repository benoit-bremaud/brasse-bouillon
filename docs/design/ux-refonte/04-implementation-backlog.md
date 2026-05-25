# Phase 4 — Implementation backlog (#1082)

Phased breakdown of the refonte into reviewable chunks, KISS/YAGNI, to open as
sub-issues of **epic #1082** once the UML ([03](03-uml-refresh-plan.md)) is
refreshed and validated. **Implementation is post-soutenance** (2026-05-27).

Each chunk is sized to land as one PR, respecting the Clean Architecture
(domain/application/data/presentation) and the Definition of Done (tests, no
`any`, theme tokens, no inline styles).

## Sequencing principle

Ship the IA backbone first (navigation + homes), then the per-screen patterns,
then the consolidations. Each step leaves the app shippable.

## R1 — Navigation backbone (5 tabs + central Scan)

- Rework `NavigationFooter` + `app/(app)/_layout.tsx` to 5 destinations
  (Accueil, Recettes, Scan-centre, Brassins, Profil); elevate Scan visually.
- Relocate hidden routes per the target map ([02](02-target-ia.md)).
- **Done when**: bottom bar has 5 items, Scan is the central action, no route is
  orphaned, longest-prefix active-state still correct, tests updated.
- Refs: #611, #1082. Pattern guard: no hamburger, no left menu.

## R2 — Profile hub

- Promote `ProfileScreen` into a hub: identity + Mon matériel (Equipment) +
  Boutique (Shop) + Réglages (settings stub) + Statistiques entry + logout.
- Move Equipment/Shop entry points here (they leave the implicit hidden tier).
- **Done when**: every previously-hidden secondary destination has a visible
  home in Profil; account fields unchanged.
- Refs: #644, #645, #836.

## R3 — "Apprendre & outils" hub

- Merge Académie + Tools (calculators) into one discoverable hub (entered from
  Accueil/Profil), since education + calculators belong together.
- **Done when**: calculators and academy topics live under one hub; no duplicate
  entry points.

## R4 — Unified Statistics (v0 = brewing + per-batch)

- New `statistics` feature (domain/application/presentation) + screen, entered
  from Accueil and Profil. v0: brewing totals + per-batch progress. Period
  filter (#646) gets its home. Recipes/period aggregation = v0.2.
- Keep contextual at-a-glance numbers on their entity screens (don't remove).
- **Done when**: one Statistics screen aggregates across batches; the dashboard
  KPI numbers reference it; period filter works.
- Refs: #646, #829.

## R5 — Recipe detail layout (flagship)

- Replace the left-side menu with a sticky top segmented control (Aperçu ·
  Ingrédients · Brassage · Eau · Notes) or single scroll; compact the hero
  (≤ ~25% viewport).
- **Done when**: recipe detail has no left menu, hero is compact, all sections
  reachable, content above the fold.
- Refs: #740, #1082 (named flagship).

## R6 — Compact-hero pass (consistency)

- Apply the compact-hero pattern to scan result + celebration, matching recipe
  detail. (Brand-header compaction already shipped in PR #1093.)
- **Done when**: no hero exceeds ~25% of the viewport across detail screens.

## R7 — Fermentation made first-class (journey 3)

- Surface the fermentation-follow journey in production (today demo-only).
  Minimal manual log if live sensor data isn't available yet (decision in
  [02](02-target-ia.md) open questions).
- **Done when**: a non-demo user can follow a batch's fermentation. Depends on
  the batch-tracking rewrite (#595 and the #808–#814 series) — coordinate.

## Cross-cutting

- Each R-chunk updates the relevant UML diagram first (per [03](03-uml-refresh-plan.md)).
- Each R-chunk adds tests (happy/sad/edge) and reconciles its user stories.
- Harmonisation rules ([02](02-target-ia.md)) become a review checklist.

## Out of scope of #1082 (tracked elsewhere)

Recipe write CRUD (#410–#420), panoramic craft scan (#751), BeerXML I/O
(#865/#778/#881), community beer-duel (#1050), IoT, shop commerce, AI label.
These are product features, not IA/UX consistency — see the prioritized roadmap
(`docs/product-backlog/prioritized-roadmap.md`).

# Phase 2 — Target information architecture

Proposed IA grounded in the gaps ([01](01-journey-menu-gap-analysis.md)) and the
design principles ([README](README.md)). Decisions taken with the founder on
2026-05-24: no hamburger, no left-side menu for primary nav, keep a visible
bottom bar, unify statistics, optimise profile, harmonise menus, KISS/YAGNI.

## Bottom navigation — 5 destinations + central Scan

Drop from 6–7 tabs to **5**, organised around the journeys, with **Scan as a
prominent central action** (it is the entry to "recognise → clone", the killer
path for the craft audience):

```
┌───────────────────────────────────────────────┐
│  Accueil   Recettes   (Scan)   Brassins  Profil │
│   home      book      ◉ FAB    flask     person │
└───────────────────────────────────────────────┘
```

- **Accueil** — dashboard / overview (incl. an entry to Statistics).
- **Recettes** — journey 1 (choose/clone/customise).
- **Scan** — centre, visually elevated (FAB-style); journey 0 (recognise a beer).
- **Brassins** — journeys 2 & 3 (brew + fermentation live inside a batch).
- **Profil** — account hub (see below): secondary destinations + settings + stats entry.

Rationale: 4 visible journey destinations + Scan, all one tap, thumb-reachable.
Within the 3–5 heuristic. No hamburger (hides nav), no left menu (desktop pattern).

### Where the demoted items go

| Currently | Target home |
|-----------|-------------|
| Académie + Tools (calculators) | A single **"Apprendre & outils"** hub, entered from Accueil or Profil (education + calculators belong together) |
| Équipement | Profil → "Mon matériel" |
| Boutique | Profil → "Boutique" |
| Communauté (demo) | Stays demo-gated; when real, candidate to replace a slot or live under Accueil |
| Étiquettes (journey 4) | First-class **from the batch** ("Créer l'étiquette" on a finished batch) + listed in Profil |

## Unified Statistics feature

Create one **Statistiques** destination (entered from Accueil and Profil) that
consolidates the numbers scattered across 8 surfaces today:

- **My brewing** — batches brewed, in progress, success rate, volume brewed.
- **Per-batch** — fermentation curve (when data exists), timeline adherence.
- **Recipes** — most-brewed, signed/cloned counts.
- **Period filter** — the existing Year / 90d / 30d control (#646) finally gets a home.

Contextual mini-stats (the 6-stat recipe grid, batch progress) **stay in place**
on their screens — Statistics aggregates *across* entities, it doesn't remove
the at-a-glance numbers. KISS: start with brewing + per-batch; recipes/period as v0.2.

## Profile → account hub

Promote the thin profile into a hub:

- Identity (avatar, name, email, role) — as today.
- **Mon matériel** (Equipment), **Boutique** (Shop), **Statistiques** (entry).
- **Réglages** (settings: units, language — ties to the bilingual FR/EN epic).
- Logout.

## Screen-level patterns (consistency)

- **Compact hero** everywhere (recipe detail, scan result, celebration): the hero
  states identity in ≤ ~25% of the viewport; stats/sections start above the fold.
  (Flagship: recipe detail — the #1082 named target.)
- **Recipe detail sections**: replace the left-side menu with a **sticky top
  segmented control** (Aperçu · Ingrédients · Brassage · Eau · Notes) or a single
  vertical scroll with section headers. Never a left menu on mobile.
- **One brand moment**: compact header in-app, hero brand only on auth (shipped #1093).

## Harmonisation rules (to enforce going forward)

1. A capability has **exactly one** primary home; no duplicate entry points.
2. Bottom bar = journeys only; education/tools/secondary = hub or profile.
3. Aggregate numbers → Statistics; at-a-glance numbers → their entity screen.
4. Mobile nav is always visible (bottom bar / top tabs), never hamburger/left-menu.
5. Hero ≤ ~25% viewport; content above the fold.

## Open decisions (for review before build)

- Fermentation J3: ship a minimal manual log, or gate the marketing claim?
- Does Scan-as-FAB change the demo Communauté slot logic?
- Académie + Tools merge name and exact placement.

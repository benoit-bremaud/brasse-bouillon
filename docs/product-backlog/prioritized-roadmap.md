# Prioritized roadmap — Brasse-Bouillon

Single source of **sequencing** for what we build next, grounded in the project's
own artifacts: personas (`docs/personas/user_personas.md`), use-case diagrams
(`docs/architecture/diagrams/`), user stories (`docs/product-backlog/product-backlog.md`),
and the GitHub backlog. It does not replace those — it orders them.

**Context:** soutenance **2026-05-27**. There are **16 open demo-blockers**, and
the central **recipe write CRUD (#410–#420) is entirely open**. The UX/IA refonte
is studied under epic #1082 (`docs/design/ux-refonte/`) and implemented after the
soutenance, UML-first.

## Personas (recap)

| Persona | Level | Tier | Core need |
|---------|-------|------|-----------|
| **Léa** la curieuse | beginner (0) | free | "Yuka for beer": scan → find a clone → succeed at batch 1, guided |
| **Nicolas** le débutant | 1–2 yrs | premium | repeatable process, understand calcs, fermentation journal |
| **Claire** la créative | 3–7 yrs | pro | recipe versioning, custom labels, document experiments |
| **Marc** l'expert | 8–15 yrs | pro | BeerXML I/O, IoT sensors, FR water chemistry, no lock-in |
| **Zoé** l'éco | beg–int | premium | reduce footprint (reserve persona) |

## Priority tiers

### P0 — Soutenance demo (≤ 2026-05-27) — the 16 demo-blockers
Goal: Léa's end-to-end guided journey is demo-credible. Pivot personas: Léa, Claire.

- **Batches / pilotage**: #595 detail rewrite, #605 data model, #606 layout, #607 inline measurements, #608 step status, #781 brewing assistance (timers/tips).
- **Demo catalog content**: #779 mini-catalog, #780 25 BrewDog DIY Dog recipes, #884 5–10 signature recipes.
- **Dashboard**: #829 home rewrite + Statistiques screen.
- **Account**: #644 merge settings into Profil.
- **Labels**: #629 export. **Scan**: #777 shopping list. **Demo**: #642 assets, #702 script, #776 spent-grain (drêches).

### P1 — Core functional gaps (immediately post-soutenance)
The biggest product hole; needed by all personas.

- **Recipe write CRUD**: #410 create, #411 edit, #412 delete, #413 hops, #414 fermentables, #415 yeast, #417 steps, #420 auto-calc IBU/ABV.
- **Ingredients CRUD + custom**: #624, #915 (Strategy B — ad-hoc ingredients).
- **Fermentation in production** (journey 3, today demo-only) — Nicolas, Marc.

### P2 — UX/IA refonte (epic #1082) — see `docs/design/ux-refonte/`
- 5-tab nav + central Scan; compact hero (flagship recipe detail); recipe-detail segmented control (no left menu); **unified Statistics** feature; **Profile hub**; menu harmonisation.

### P3 — Strategic differentiators
- **Panoramic craft-label scan** (#751 + ~24 issues) — the "recognise → clone" wedge (Léa + craft audience).
- **Community clone-recipes**, credited & versioned (#883, #739, #882 cloneOf).
- **BeerXML/BeerJSON import/export** (#865/#778/#881) — capture migrants (Marc, Claire).

### P4 — Later / v0.2+
- Community beer-duel (#1050); IoT Tilt/iSpindel (Marc); eco/carbon (Zoé); shop/commerce (#650+); AI label (#834); n8n competitive watch (#825).

## Persona × need coverage (completeness check)

| Need | Persona(s) | Covered by | Tier | Status |
|------|-----------|------------|------|--------|
| Scan a beer (barcode) | Léa | UC barcode (01a), #594 | P-done | done |
| Scan craft label (panoramic) | Léa, Claire | UC panoramic (01b), #751 | P3 | open |
| Find / browse recipes | all | E02 read, #408/#409 | done | done |
| **Create / edit recipes** | Claire, Nicolas | #410–#417, #420 | **P1** | **open** |
| Recipe versioning / clone | Claire, Marc | #883, #739, #882 | P3 | open |
| Brew step-by-step (guided) | Léa, Nicolas | E04, #595, #781 | P0 | open |
| **Follow fermentation** | Nicolas, Marc | batches #811/#812, journey 3 | **P0/P1** | **demo-only** |
| Bottle + custom label | Claire | E07, #629 | P0 | partial |
| Calculators | Nicolas, Marc | E03 (#421–#430) | done | done |
| Ingredient library + custom | all, Marc | E05 done; #624/#915 | P1 | read done |
| Academy / learn | Léa | E06 (#443–#447) | done | done |
| Statistics (cross-entity) | Nicolas, Marc | #646, #829, refonte P2 | P0/P2 | open |
| Profile / settings / equipment | all | #644/#645/#836 | P0/P2 | open |
| Community sharing / ratings | Claire | E09 done; beer-duel #1050 | P4 | base done |
| BeerXML I/O (migration) | Marc, Claire | #865/#778/#881 | P3 | open |
| IoT sensors | Marc | — | P4 | not started |
| Eco / carbon footprint | Zoé | — | P4 | not modelled |

### Gaps to confirm with the team
- **Fermentation (journey 3)** is production-invisible — promote to P0/P1 or gate the marketing claim.
- **Recipe write CRUD** is the central open gap; not in the demo-blocker set — confirm whether the demo relies on pre-seeded recipes only (P0 catalog) and CRUD is genuinely P1.
- **IoT (Marc)** and **eco (Zoé)** have no use-case diagram yet — model before committing.

## How to use this doc

- Re-prioritise at backlog grooming; keep tiers P0–P4 in sync with GitHub labels
  (`priority:*`, `demo-blocker`) and milestones.
- Every tier item must satisfy the Definition of Ready before it enters a sprint.

# Phase 1 — Journey ↔ menu gap analysis

Mapping the 4 marketing journeys to where they actually live in the app, and
flagging gaps. Reachability assessed from the current navigation
([00](00-current-state-inventory.md)).

## The 4 journeys vs the app

| Journey | Implemented by | Entry point(s) | Verdict |
|---------|----------------|----------------|---------|
| **1. Choose a recipe** | RecipesScreen → CatalogScreen → RecipeDetailsScreen | Recettes tab (visible) + dashboard CTA | **OK** — direct, in the bar |
| **2. Brew step-by-step** | BatchesScreen → BatchDetailsScreen | Brassins tab + dashboard hero/alerts | **OK** — direct, in the bar |
| **3. Follow fermentation** | BatchDetailsScreen fermentation section | inside a batch | **GAP — demo-only.** The fermentation tracker renders only when `useDemoData` is true; in production the journey the site promises is **not visible**. |
| **4. Bottle & taste (label)** | LabelsScreen → SelectBatch → Editor → Details | dashboard "Voir plus" sheet only | **GAP — buried.** Labels are not in the bar; reachable only via a secondary action sheet (2+ taps, low discoverability). |

## Gaps and findings

1. **Fermentation (J3) is production-invisible.** The headline "follow your
   fermentation day by day" has no production surface. Either the feature must
   ship (depends on the fermenter-data epic) or the marketing claim is ahead of
   the build. Decision needed: gate the claim, or prioritise a minimal manual
   fermentation log.
2. **Bottling/labels (J4) is buried.** A core narrative step sits behind "Voir
   plus". It should have a first-class, predictable entry (from the batch it
   belongs to, and/or a visible destination).
3. **Bottom bar is overloaded (6–7 tabs).** Above the 3–5 heuristic. Académie
   (education) competes for a primary slot with the 4 journey-critical
   destinations. Scan is journey-adjacent (recognise a beer → clone it) and
   deserves prominence, but as a 6th equal tab it dilutes the set.
4. **Statistics are scattered across 8 surfaces** with no home. The same
   metrics (ABV/IBU/EBC, batch progress) are re-rendered in different shapes.
   #646 already anticipated a Statistiques screen. There is duplication risk and
   no place for cross-batch/cross-recipe insight.
5. **Profile is thin and orphaned.** It holds only account fields + logout,
   yet it is the natural home for secondary destinations (Equipment, Shop,
   settings, and a Statistics entry) that are currently hidden via `href: null`.
6. **Hidden routes with no stable home.** Ingredients, Tools, Equipment, Shop
   are reachable only indirectly. Tools (calculators) overlaps conceptually with
   Académie — the split is not obvious to users.
7. **Recipe detail uses a left-side menu** (reported in live review) — a desktop
   pattern; on mobile it narrows the content column and fights thumb reach.

## Themes feeding the target IA

- Promote the **4 journeys** to first-class, visible destinations; demote
  education/tools/secondary to a discoverable-but-not-primary tier.
- Give **Scan** a prominent, journey-aligned placement.
- Create a **single home for statistics** and for **secondary destinations**
  (profile/account hub).
- Replace per-screen anti-patterns (left menu, oversized hero) with consistent
  mobile patterns (top tabs/scroll, compact hero).

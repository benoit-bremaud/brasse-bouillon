# Phase 0 — Current-state inventory

Factual map of the mobile app as of 2026-05-24 (no judgement here; gaps are
analysed in [01](01-journey-menu-gap-analysis.md)). Source: code reading of
`packages/mobile-app`.

## Bottom navigation (NavigationFooter)

Defined in `src/core/ui/NavigationFooter.tsx`. **Production: 6 tabs** (demo mode
inserts a 7th, Communauté, before Profil):

| # | Label | Icon | Route |
|---|-------|------|-------|
| 1 | Accueil | home-outline | `/dashboard` |
| 2 | Brassins | flask-outline | `/batches` |
| 3 | Recettes | book-outline | `/recipes` |
| 4 | Scan | barcode-outline | `/dashboard/scan` |
| 5 | Académie | school-outline | `/academy` |
| 6 | Profil | person-circle-outline | `/profile` |
| (demo) | Communauté | people-outline | `/social` |

**Routes hidden from the bar** (`href: null` in `app/(app)/_layout.tsx`):
Shop, Ingredients, Tools, Social (demo-gated), plus nested Labels/Scan
sub-routes. (`equipment` is declared **without** `href: null` — it inherits the
Tabs header but is simply absent from the custom `NavigationFooter` item list.)
History: #613 moved Shop + Tools out of the bar; #646 anticipated a dedicated
Statistiques screen (not built).

## Routes / screens (delegated app/ → src/features/*/presentation)

- **dashboard**: `DashboardScreen`; nested `scan/*` (ScanScreen, PendingScansScreen, BeerInfoCardScreen, ScanResultScreen) and `labels/*` (LabelsScreen, LabelDetailsScreen, LabelSelectBatchScreen, LabelEditorScreen).
- **recipes**: RecipesScreen, CatalogScreen, RecipeDetailsScreen (5-tab vertical side-rail, in order: Vue / Ingrédients / Eau / Brassage / Notes).
- **batches**: BatchesScreen, BatchDetailsScreen (timeline + demo fermentation tracker), BatchFinishedScreen (celebration, demo).
- **ingredients**: IngredientsScreen → category → details (malts/hops/yeast).
- **tools**: ToolsHubScreen + 8 calculators (color, fermentables, hops, yeast, water, efficiency, carbonation, advanced).
- **academy**: AcademyHubScreen (10 topics) + topic detail + placeholder — note the academy screens live under `src/features/tools/` (not a separate `academy` module).
- **equipment**: EquipmentScreen. **shop**: ShopScreen + category. **social**: SocialFeedScreen (demo). **profile**: ProfileScreen. **auth**: LoginScreen.

## Feature modules (src/features/)

auth, dashboard, batches, recipes, scan, labels, ingredients, equipment, tools
(**includes academy** — academy screens are under `features/tools/`), shop,
social. Tools and Academy are tightly linked (calculators hang off academy topics).

## Statistics / numbers — scattered (no unified feature)

| Location | Numbers shown |
|----------|---------------|
| DashboardScreen | KPI grid (active batches, actions-24h, critical alerts); demo hero (volume, OG, IBU); demo ribbon (total brassins, signed recipes, J+x/J+y); alerts list; active-batch cards |
| BatchDetailsScreen | demo fermentation tracker (days, %, SG, OG/FG, temperature) |
| RecipeDetailsScreen (OverviewTab) | 6-stat grid: ABV, IBU, EBC, OG, FG, target volume |
| RecipeCard | inline IBU / ABV / volume |
| ScanResultScreen | ABV / IBU / EBC |
| LabelsScreen | draft count |
| SocialFeedScreen | likes / comments (hardcoded, demo) |
| Tools (8 calculators) | live computed outputs |

A "Période d'analyse" filter (Year / 90d / 30d) exists on the dashboard but is
pinned to "year" (#646 planned to move it to a Statistiques screen).

## Profile screen (ProfileScreen)

Thin: header (avatar + display name), account card (email, username, role),
refresh button, logout (with confirmation modal). **No settings, preferences,
subscription, equipment link, or stats.**

## Demo-mode gating

Hero card, ribbon stats, fermentation tracker, celebration screen, and the
Communauté tab all depend on `dataSource.useDemoData`. In production these are
hidden — see [01](01-journey-menu-gap-analysis.md) for the journey impact.

# Phase 3 — UML refresh plan

The refonte changes the information architecture, so the UML must be refreshed
**before** implementation (project rule: conception precedes code). This lists
which diagrams to create or update, per the UML conventions
(`docs/architecture/diagrams/<feature>/<NN>[a/b]-<type>[-<scope>].md`, e.g. the
existing `scan/01a-use-case-barcode.md`; Mermaid, six types).

UML orthodoxy reminder: use cases are **actor-initiated goals**; group them by
**domain**, never by backend package; the Mobile/API split lives only in the
component diagram.

## Guiding rule for this refresh

The IA refonte does **not** invent new product capabilities — it relocates and
consolidates existing ones. So most use-case *content* is stable; what changes
is **navigation/flow** (sequence + component) and two **consolidations**
(Statistics, Profile hub) that deserve their own use-case views.

## Diagrams to create / update

| Domain / feature | Diagram(s) | Action | Why |
|------------------|-----------|--------|-----|
| **Navigation / IA** (new folder `navigation/`) | component + state | **Create** | Document the 5-tab bar + central Scan, and the demoted-items map (Académie+Outils hub, Profil hub). The bottom-bar IA has never been modelled; #611 ("unify 3 nav layers") is the related issue. |
| **Statistics** (new `statistics/`) | use-case + data-flow | **Create** | New consolidated destination. UC: "Consult my brewing statistics", "Filter stats by period". Data-flow: where each metric is sourced (batches, recipes). Ties to #646, #829. |
| **Account / Profile** (`account/`) | use-case | **Update** | Profile becomes a hub. Add UC: "Manage my equipment", "Open settings (units/language)", "Open statistics", "Browse shop". Existing auth UCs unchanged. Ties to #644, #645, #836. |
| **Recipes** (`recipes/`) | sequence | **Update** | Recipe detail navigation changes (top segmented control / scroll, not left menu). Update the "consult a recipe" sequence; use cases unchanged. Flagship of #1082. |
| **Batches / brewing** (`batches/`) | use-case + state | **Update** | Make the *fermentation-follow* use case first-class (today demo-only). Add the bottling/label entry from a finished batch. State diagram: batch lifecycle incl. fermentation + bottled. Ties to #595, journey 3 & 4 gaps. |
| **Scan** (`scan/`) | — | **No change** | Already modelled (01a barcode, 01b panoramic). Scan only gains visual prominence (nav), not new UCs. |

## User-story alignment

After the diagrams are refreshed, reconcile the product backlog
(`docs/product-backlog/product-backlog.md`) so every new/relocated use case has
a matching user story in the right epic:

- **E08 Dashboard & Navigation** — add stories for the 5-tab IA + central Scan
  (relocate Académie/Outils/Équipement/Boutique). (#611, #829)
- **New "Statistics" grouping** (or fold into E08) — stories for the unified
  Statistics screen + period filter. (#646)
- **E01 Account & Profile** — stories for the profile hub sections. (#644, #645)
- **E04 Batch Tracking** — promote the fermentation-follow story out of demo-only;
  add bottling/label entry-from-batch. (journey 3 & 4)
- **E02 Recipes** — story for the recipe-detail layout change (segmented control). (#1082 flagship)

## Order of work (conception → build)

1. Draft the `navigation/` component + state diagrams (the IA backbone).
2. Draft `statistics/` use-case + data-flow; update `account/` use-case.
3. Update `batches/` (fermentation first-class) + `recipes/` sequence.
4. Reconcile user stories in the product backlog.
5. Get the diagrams validated, then open implementation issues ([04](04-implementation-backlog.md)).

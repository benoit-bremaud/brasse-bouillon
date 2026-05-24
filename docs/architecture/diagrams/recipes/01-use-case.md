# Use-case diagram — recipes — author, discover, clone & version

> **Feature**: epic #740 (Mes Recettes hub + detail); recipe write CRUD
> #410–#420; community clone/version #739 #882 #883; BeerXML I/O #778 #865 #881.
> **Personas**: Claire (creative — versioning/forks), Nicolas (repeatable),
> Léa (discover/clone), Marc (BeerXML migration).

## Context

Who interacts with recipes and to do what. Goals are actor-initiated (UML 2.5).
Grouped by domain (Recipes), with sub-groups: Author (own recipes), Discover
(catalog + clone), Interop (BeerXML). The Mobile/API split is in `03-component.md`,
not here. Read paths exist today; write CRUD + clone-UX + BeerXML are the open
goals this models so implementation has a target.

## Diagram

```mermaid
flowchart LR
  Brewer(("Brewer — Claire / Nicolas / Léa / Marc"))

  subgraph SYSTEM ["Brasse-Bouillon — Recipes"]
    subgraph Author ["Author my recipes"]
      UC1(("Create a recipe"))
      UC2(("Edit a recipe (metadata + targets)"))
      UC3(("Add / remove ingredients (hops, fermentables, yeast, water)"))
      UC4(("Define / order brewing steps"))
      UC5(("Delete a recipe"))
      UC6(("Save a variant as a new version (fork)"))
    end
    subgraph Discover ["Discover & reuse"]
      UC7(("Browse my recipes"))
      UC8(("Browse the public catalog"))
      UC9(("Consult a recipe (5-tab detail)"))
      UC10(("Scale a recipe to my target volume"))
      UC11(("Clone a community recipe into my recipes"))
      UC12(("Start a brewing session from a recipe"))
    end
    subgraph Interop ["Interop"]
      UC13(("Import a recipe from BeerXML / BeerJSON"))
      UC14(("Export a recipe to BeerXML / BeerJSON"))
    end
  end

  Brewer --> UC1
  Brewer --> UC2
  Brewer --> UC3
  Brewer --> UC4
  Brewer --> UC5
  Brewer --> UC6
  Brewer --> UC7
  Brewer --> UC8
  Brewer --> UC9
  Brewer --> UC10
  Brewer --> UC11
  Brewer --> UC12
  Brewer --> UC13
  Brewer --> UC14
```

## Notes

- **Status today** (see `06-status` note in PR): UC7–UC12 (read/list/scale/clone/
  start) are implemented; **UC1–UC6 (write CRUD + fork) have backend endpoints
  but no mobile UI** — the central open gap (#410–#420). UC13/UC14 (BeerXML) are
  planned (#778/#865/#881).
- **Clone vs fork** are distinct goals: UC11 *clone a community recipe* deep-copies
  a public recipe into a **new private root** (own lineage, provenance kept); UC6
  *fork* creates a **new version within my own lineage** (`version+1`,
  `parentRecipeId` → source). Both reuse the same versioning model (class diagram).
- **UC12 (start a session)** is the hand-off to the brewing-session feature — its
  own use-case set lives in `diagrams/brewing-session/`.
- **No `Beer` actor/entity**: recipes are the core unit; the old "Recipe.cloneOf →
  Beer.id" note is superseded by the root/parent versioning model.

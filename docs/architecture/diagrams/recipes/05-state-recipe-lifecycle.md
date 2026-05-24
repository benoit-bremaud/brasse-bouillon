# State diagram — recipes — visibility & version lineage

> **Feature**: epic #740; visibility model (existing); fork/versioning #882 #883.

## Context

A recipe's two orthogonal lifecycles: its **visibility** (who can see it) and its
**version lineage** (how variants relate). Recipes have no heavy state machine
beyond these; capturing them prevents accidental mutation-in-place of shared
recipes.

## Visibility

```mermaid
stateDiagram-v2
  [*] --> private: Create
  private --> unlisted: Share by link
  unlisted --> public: Publish to catalog
  public --> unlisted: Unpublish
  unlisted --> private: Make private
  private --> [*]: Delete
  public --> [*]: Delete (owner)
```

## Version lineage (fork)

```mermaid
stateDiagram-v2
  [*] --> v1: Create (rootRecipeId = self, version = 1)
  v1 --> v2: Fork (version+1, parent = v1, same root)
  v2 --> v3: Fork (version+1, parent = v2, same root)
  note right of v2
    Each version is a new immutable Recipe row.
    Forking never mutates the parent.
    Clone-from-community starts a NEW root (own v1).
  end note
```

## Notes

- **Visibility transitions** are owner-initiated; publishing to `public` is what
  makes a recipe clonable by others (clone → a new private root for the cloner).
- **Versions are append-only rows**, not in-place edits of a shared recipe — this
  is the guarantee that a public recipe others have cloned cannot change under
  them. Editing your *own* private recipe is a normal PATCH (not a fork); a fork
  is an explicit "save as new version".
- **Delete**: removing a recipe cascades to its satellites; deleting a `root`
  with descendants is a product decision (block, or re-root children) — flag as
  an open question for the write-CRUD epic (#420).

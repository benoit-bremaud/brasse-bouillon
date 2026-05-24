# Sequence diagram — equipment & shop — build & share a shopping list

> **Feature**: local cart/shopping list #653; recipe → buy bridge.

## Context

How the shopping list is built from a recipe's ingredients (the cross-domain
bridge) and then viewed/shared. The list is local; buying is a partner deep-link.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant R as "Mobile — RecipeDetails (Ingredients tab)"
  participant UC as "Mobile — cart.use-cases"
  participant Store as "Local store (persisted)"
  participant L as "Mobile — ShoppingListScreen"

  B->>R: "Ajouter au panier" (bulk or per-ingredient)
  R->>UC: addItems(ingredients[])
  UC->>Store: upsert LocalCartItem[] (source=ingredient)
  Store-->>UC: ok
  B->>L: Open shopping list (from Profile hub)
  L->>UC: getShoppingList()
  UC->>Store: read
  Store-->>L: items grouped by category
  B->>L: Adjust quantities
  B->>L: "Partager" → OS share (text list)
  opt Buy
    B->>L: Tap a partner link
    L-->>B: open partner e-commerce (deep-link, #650)
  end
```

## Notes / suggestions

- **Local & persisted**: the list lives client-side (AsyncStorage), survives app
  restarts. No server order. **Suggestion** — one list per user, appended to from
  any recipe or scan (#777), not a per-recipe ephemeral cart.
- **Grouping**: items group by `ShopCategory` (malts / hops / yeast / equipment)
  so the brewer shops efficiently.
- **Share** is text today (parity with labels share) — a richer export (checklist
  PDF) is a later enhancement.
- **Demo mode**: the list reads/writes the in-memory demo store.

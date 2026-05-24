# Class diagram — equipment & shop — gear, products, shopping list

> **Feature**: equipment CRUD #621; shop catalog E10; local cart #653.
> **Source**: `features/shop/domain/shop.types.ts`, `cart.types.ts`.

## Context

The model for owned equipment, the shop product catalog, and the local shopping
list that links recipes/scans to purchases. Reflects the existing shop/cart types;
`Equipment` CRUD fields are the #621 addition.

## Diagram

```mermaid
classDiagram
  class Equipment {
    +UUID id
    +UUID ownerId
    +string name
    +EquipmentType type
    +float volumeL
    +string notes
  }
  class Product {
    +UUID id
    +string name
    +float price
    +PriceUnit priceUnit
    +ShopCategory category
  }
  class ShoppingList {
    +UUID ownerId
    +LocalCartItem[] items
  }
  class LocalCartItem {
    +string key
    +LocalCartItemSource source
    +string refId
    +string name
    +ShopCategory category
    +int quantity
    +string unit
  }

  ShoppingList "1" o-- "0..*" LocalCartItem
  LocalCartItem "0..*" ..> "0..1" Product : may reference
  LocalCartItem "0..*" ..> "0..1" Equipment : may reference

  class ShopCategory {
    <<enumeration>>
    malts
    houblons
    levures
    materiel
    accessoires
    kits
  }
  class PriceUnit {
    <<enumeration>>
    eurPerKg
    eurPer100g
    eurPerSachet
    eurPerPiece
  }
  class LocalCartItemSource {
    <<enumeration>>
    ingredient
    equipment
  }
```

## Notes / suggestions

- **Existing & real values**: `ShopCategory` = `malts / houblons / levures /
  materiel / accessoires / kits` (French, `shop.types.ts`); `PriceUnit` literals
  are `"€/kg" | "€/100g" | "€/sachet" | "€/pièce"` (shown as `eurPerKg`… in the
  enum — Mermaid avoids `€` and `/`). `LocalCartItem` = `key/source/refId/name/
  category/quantity/unit` (`cart.types.ts`). `Equipment` fields + `EquipmentType`
  are the #621 CRUD addition (today equipment is read-only demo).
- **`ShoppingList` is local** (the "cart" that was never surfaced, #653) — not a
  server order. **Suggestion**: persist it per user (so it survives reinstall)
  and let any recipe/scan append to the *same* list.
- **Item → catalog link is optional**: a custom ingredient (Strategy B) added to
  the list may not map to a `Product` — keep `refId` generic so off-catalog items
  are listable (name + quantity).
- **No payment/order entity**: purchase is a partner deep-link (#650) — out of
  the model on purpose.

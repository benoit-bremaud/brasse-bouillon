import {
  addLocalCartItem,
  addLocalCartItems,
  getLocalCartLineCount,
  getLocalCartTotalQuantity,
} from "@/features/shop/application/cart.use-cases";

import type { LocalCartItem } from "@/features/shop/domain/cart.types";

const ingredientItem: LocalCartItem = {
  key: "ingredient-hop-1",
  source: "ingredient",
  refId: "hop-1",
  name: "Citra",
  category: "houblons",
  quantity: 25,
  unit: "g",
};

const equipmentItem: LocalCartItem = {
  key: "equipment-eq-1",
  source: "equipment",
  refId: "eq-1",
  name: "Braumeister 20L",
  category: "materiel",
  quantity: 1,
  unit: "unit",
};

describe("cart.use-cases", () => {
  it("adds a new local cart item", () => {
    const result = addLocalCartItem([], ingredientItem);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(ingredientItem);
  });

  it("merges quantity when item key already exists", () => {
    const result = addLocalCartItem([ingredientItem], {
      ...ingredientItem,
      quantity: 10,
    });

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(35);
  });

  it("ignores items with non-positive quantity", () => {
    const result = addLocalCartItem([ingredientItem], {
      ...ingredientItem,
      quantity: 0,
    });

    expect(result).toEqual([ingredientItem]);
  });

  it("adds many items and merges duplicates", () => {
    const result = addLocalCartItems(
      [ingredientItem],
      [equipmentItem, { ...ingredientItem, quantity: 5 }],
    );

    expect(result).toHaveLength(2);
    expect(
      result.find((item) => item.key === ingredientItem.key)?.quantity,
    ).toBe(30);
  });

  it("returns cart line count and total quantity", () => {
    const items = [ingredientItem, equipmentItem];

    expect(getLocalCartLineCount(items)).toBe(2);
    expect(getLocalCartTotalQuantity(items)).toBe(26);
  });
});

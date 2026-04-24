import {
  DEFAULT_PRICE_UNIT_BY_CATEGORY,
  getProductPriceUnit,
} from "@/features/shop/domain/shop.types";
import type { Product } from "@/features/shop/domain/shop.types";

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "p1",
    name: "Test product",
    description: "Test",
    price: 1,
    category: "malts",
    inStock: false,
    ...overrides,
  };
}

describe("getProductPriceUnit", () => {
  // Happy path — explicit priceUnit on the product wins over the default.
  it("returns the explicit priceUnit when set on the product", () => {
    const product = buildProduct({ priceUnit: "€/100g", category: "houblons" });
    expect(getProductPriceUnit(product)).toBe("€/100g");
  });

  // Sad path — priceUnit missing for a hop product would have shown
  // the wrong "€/kg" string before #649. Now it must fall back to the
  // category default "€/100g".
  it("falls back to the category default when priceUnit is omitted", () => {
    expect(getProductPriceUnit(buildProduct({ category: "houblons" }))).toBe(
      "€/100g",
    );
    expect(getProductPriceUnit(buildProduct({ category: "levures" }))).toBe(
      "€/sachet",
    );
    expect(getProductPriceUnit(buildProduct({ category: "materiel" }))).toBe(
      "€/pièce",
    );
    expect(getProductPriceUnit(buildProduct({ category: "kits" }))).toBe(
      "€/pièce",
    );
  });

  // Edge case — every key actually present in
  // DEFAULT_PRICE_UNIT_BY_CATEGORY maps to a valid €-prefixed unit.
  // Iterating from Object.keys (instead of a hardcoded list) keeps
  // this assertion honest as a regression guard: adding a category
  // to the map without giving it a real €-prefixed unit will trip
  // here automatically. The Record<ShopCategory, PriceUnit> typing
  // already gives us a TS-level guarantee that every ShopCategory
  // member has SOME entry; this test guards the value shape.
  it("has a valid €-prefixed unit registered for every entry of the map", () => {
    const categories = Object.keys(DEFAULT_PRICE_UNIT_BY_CATEGORY) as Array<
      keyof typeof DEFAULT_PRICE_UNIT_BY_CATEGORY
    >;
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(DEFAULT_PRICE_UNIT_BY_CATEGORY[category]).toMatch(/^€\//);
    }
  });
});

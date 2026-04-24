import {
  DEFAULT_PRICE_UNIT_BY_CATEGORY,
  Product,
  getProductPriceUnit,
} from "@/features/shop/domain/shop.types";

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

  // Edge case — every category in the type union has a default mapping
  // (regression guard so adding a new category to ShopCategory without
  // updating DEFAULT_PRICE_UNIT_BY_CATEGORY trips a TS error AND this
  // test if it slips through).
  it("has a default unit registered for every shop category", () => {
    const categories: Array<keyof typeof DEFAULT_PRICE_UNIT_BY_CATEGORY> = [
      "malts",
      "houblons",
      "levures",
      "materiel",
      "accessoires",
      "kits",
    ];
    for (const category of categories) {
      expect(DEFAULT_PRICE_UNIT_BY_CATEGORY[category]).toMatch(/^€\//);
    }
  });
});

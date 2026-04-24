export type ShopCategory =
  | "malts"
  | "houblons"
  | "levures"
  | "materiel"
  | "accessoires"
  | "kits";

// Pricing units actually used in the brewing trade — see #649 (B-48):
// malts ship by the kilo (sometimes by sack), hops + yeasts by sachet,
// equipment + accessoires by piece, kits by piece.
export type PriceUnit = "€/kg" | "€/100g" | "€/sachet" | "€/pièce";

export const DEFAULT_PRICE_UNIT_BY_CATEGORY: Record<ShopCategory, PriceUnit> = {
  malts: "€/kg",
  houblons: "€/100g",
  levures: "€/sachet",
  materiel: "€/pièce",
  accessoires: "€/pièce",
  kits: "€/pièce",
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  // Pricing unit. When omitted, falls back to the category default
  // via DEFAULT_PRICE_UNIT_BY_CATEGORY so old seed data keeps working.
  priceUnit?: PriceUnit;
  category: ShopCategory;
  image?: string;
  inStock: boolean;
};

export function getProductPriceUnit(product: Product): PriceUnit {
  return product.priceUnit ?? DEFAULT_PRICE_UNIT_BY_CATEGORY[product.category];
}

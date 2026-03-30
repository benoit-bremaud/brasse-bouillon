import type { ShopCategory } from "@/features/shop/domain/shop.types";

export type LocalCartItemSource = "ingredient" | "equipment";

export type LocalCartItem = {
  key: string;
  source: LocalCartItemSource;
  refId: string;
  name: string;
  category: ShopCategory;
  quantity: number;
  unit: string;
};

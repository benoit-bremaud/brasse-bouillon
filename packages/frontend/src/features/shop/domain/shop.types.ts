export type ShopCategory =
  | "malts"
  | "houblons"
  | "levures"
  | "materiel"
  | "accessoires"
  | "kits";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ShopCategory;
  image?: string;
  inStock: boolean;
};

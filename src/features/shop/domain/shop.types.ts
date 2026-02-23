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

export const shopCategories: {
  id: ShopCategory;
  name: string;
  icon: string;
}[] = [
  { id: "malts", name: "Malts", icon: "flower" },
  { id: "houblons", name: "Houblons", icon: "leaf" },
  { id: "levures", name: "Levures", icon: "bug" },
  { id: "kits", name: "Kits", icon: "gift" },
  { id: "materiel", name: "Matériel", icon: "construct" },
  { id: "accessoires", name: "Accessoires", icon: "bag" },
];

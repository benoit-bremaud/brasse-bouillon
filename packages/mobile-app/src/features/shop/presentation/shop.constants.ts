import type { Product, ShopCategory } from "@/features/shop/domain/shop.types";

export const SHOP_CATEGORIES: {
  id: ShopCategory;
  name: string;
  icon: string;
}[] = [
  { id: "malts", name: "Malts", icon: "flower" },
  { id: "houblons", name: "Houblons", icon: "leaf" },
  { id: "levures", name: "Levures", icon: "bug" },
  { id: "kits", name: "Kits", icon: "gift" },
  { id: "materiel", name: "L'Office 🍽️", icon: "construct-outline" },
  {
    id: "accessoires",
    name: "L'Épicerie 🌶️",
    icon: "restaurant-outline",
  },
];

export const shopCategoryLabels: Record<ShopCategory, string> =
  SHOP_CATEGORIES.reduce(
    (accumulator, category) => {
      accumulator[category.id] = category.name;
      return accumulator;
    },
    {} as Record<ShopCategory, string>,
  );

export const shopCategoryDescriptions: Record<ShopCategory, string> = {
  malts: "Pale, Munich, Pilsner, Vienne...",
  houblons: "Amérisant, aromatique, bitter...",
  levures: "Lagers, Ales, Weiße, Belgian...",
  materiel: "Matériel de brassage, cuves et équipements clés",
  accessoires: "Adjuvants, épices et compléments aromatiques",
  kits: "Kits complets pour débutants et initiés",
};

export const mockShopProducts: Record<ShopCategory, Product[]> = {
  malts: [
    {
      id: "malt-demo-1",
      name: "Pilsner - Viking Malt",
      description: "Malts pâles de qualité premium",
      price: 4.5,
      category: "malts",
      inStock: false,
    },
    {
      id: "malt-demo-2",
      name: "Munich - Weyermann",
      description: "Pour bières ambrées et brunes",
      price: 5.2,
      category: "malts",
      inStock: false,
    },
  ],
  houblons: [
    {
      id: "hop-demo-1",
      name: "Cascade - US",
      description: "Arôme floral et citrus",
      price: 8.9,
      category: "houblons",
      inStock: false,
    },
    {
      id: "hop-demo-2",
      name: "Saaz - CZ",
      description: "Noble hops, aroma doux",
      price: 12.0,
      category: "houblons",
      inStock: false,
    },
  ],
  levures: [
    {
      id: "yeast-demo-1",
      name: "SafLager S-23",
      description: "Levure de fermentation basse",
      price: 4.2,
      category: "levures",
      inStock: false,
    },
    {
      id: "yeast-demo-2",
      name: "SafAle US-05",
      description: "American Ale Yeast",
      price: 3.8,
      category: "levures",
      inStock: false,
    },
  ],
  materiel: [
    {
      id: "equip-demo-1",
      name: "Fermenteur conique 30L",
      description: "Inox, avec robinet",
      price: 89.0,
      category: "materiel",
      inStock: false,
    },
  ],
  accessoires: [
    {
      id: "acc-demo-1",
      name: "Densimètre + éprouvette",
      description: "Kit essentiel",
      price: 15.0,
      category: "accessoires",
      inStock: false,
    },
  ],
  kits: [
    {
      id: "kit-demo-1",
      name: "Kit Beginner IPA",
      description: "Tout inclus : malts, houblons, levures",
      price: 49.0,
      category: "kits",
      inStock: false,
    },
    {
      id: "kit-demo-2",
      name: "Kit Blonde Artisanale",
      description: "Pour 20L de blonde dorée",
      price: 42.0,
      category: "kits",
      inStock: false,
    },
  ],
};

export function isShopCategory(value: string): value is ShopCategory {
  return SHOP_CATEGORIES.some((category) => category.id === value);
}

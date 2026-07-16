import type { Ionicons } from "@expo/vector-icons";

import type { ShopCategory } from "@/features/shop/domain/shop.types";

type IoniconName = keyof typeof Ionicons.glyphMap;

export const SHOP_CATEGORIES: {
  id: ShopCategory;
  name: string;
  icon: IoniconName;
}[] = [
  { id: "malts", name: "Malts", icon: "flower" },
  { id: "houblons", name: "Houblons", icon: "leaf" },
  { id: "levures", name: "Levures", icon: "bug" },
  { id: "kits", name: "Kits", icon: "gift" },
  { id: "materiel", name: "Matériel", icon: "construct-outline" },
  { id: "accessoires", name: "Accessoires", icon: "restaurant-outline" },
];

export const shopCategoryDescriptions: Record<ShopCategory, string> = {
  malts: "Pale, Munich, Pilsner, Vienne...",
  houblons: "Amérisant, aromatique, bitter...",
  levures: "Lagers, Ales, Weiße, Belgian...",
  materiel: "Matériel de brassage, cuves et équipements clés",
  accessoires: "Adjuvants, épices et compléments aromatiques",
  kits: "Kits complets pour débutants et initiés",
};

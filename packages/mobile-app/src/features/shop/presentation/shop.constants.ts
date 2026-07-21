import { Ionicons } from "@expo/vector-icons";

import type { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";

type IoniconName = keyof typeof Ionicons.glyphMap;

/**
 * A shop rayon — one tile on the shop hub.
 *
 * `catalogCategory` carries the whole two-speed design: a rayon that
 * points at an `IngredientCategory` is live and navigates into the real
 * catalog; a rayon with `null` has no source yet and stays an inert
 * placeholder. Modelling the placeholder as an absent link rather than a
 * status flag means an unsourced rayon cannot be made pressable by
 * accident — see `docs/architecture/diagrams/equipment-shop/04-class.md`.
 */
export type ShopRayon = {
  id: string;
  label: string;
  icon: IoniconName;
  description: string;
  catalogCategory: IngredientCategory | null;
};

export type LiveShopRayon = ShopRayon & { catalogCategory: IngredientCategory };

export const SHOP_RAYONS: ShopRayon[] = [
  {
    id: "malts",
    label: "Malts",
    icon: "flower",
    description: "Pale, Munich, Pilsner, Vienne...",
    catalogCategory: "malt",
  },
  {
    id: "houblons",
    label: "Houblons",
    icon: "leaf",
    description: "Amérisant, aromatique, bitter...",
    catalogCategory: "hop",
  },
  {
    id: "levures",
    label: "Levures",
    icon: "bug",
    description: "Lagers, Ales, Weiße, Belgian...",
    catalogCategory: "yeast",
  },
  // The three rayons below have no `catalogCategory` yet, for two different
  // reasons. Kits has no source anywhere. Matériel and Accessoires ARE served
  // by the backend already (`/catalog/equipment-templates`,
  // `/catalog/misc-templates`) but nothing consumes them mobile-side: they
  // wait on plumbing, not on data, and Lot 2 wires them.
  {
    id: "kits",
    label: "Kits",
    icon: "gift",
    description: "Kits complets pour débutants et initiés",
    catalogCategory: null,
  },
  {
    id: "materiel",
    label: "Matériel",
    icon: "construct-outline",
    description: "Matériel de brassage, cuves et équipements clés",
    catalogCategory: null,
  },
  {
    id: "accessoires",
    label: "Accessoires",
    icon: "restaurant-outline",
    description: "Adjuvants, épices et compléments aromatiques",
    catalogCategory: null,
  },
];

export function isLiveShopRayon(rayon: ShopRayon): rayon is LiveShopRayon {
  return rayon.catalogCategory !== null;
}

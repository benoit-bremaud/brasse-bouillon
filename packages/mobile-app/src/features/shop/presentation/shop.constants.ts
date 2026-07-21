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
  {
    id: "accessoires",
    label: "Accessoires",
    icon: "restaurant-outline",
    description: "Adjuvants, épices et compléments aromatiques",
    catalogCategory: "misc",
  },
  // The two below have no `catalogCategory`, for different reasons. Kits has
  // no source anywhere. Matériel IS served by the backend already
  // (`/catalog/equipment-templates`) but an EquipmentTemplate is not an
  // Ingredient — its specs are BeerXML equipment (boil_size_l, tun_volume_l…),
  // so wiring it needs a target kind this model cannot express yet, plus its
  // own screens. That is its own lot, not a slice of this one.
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
];

export function isLiveShopRayon(rayon: ShopRayon): rayon is LiveShopRayon {
  return rayon.catalogCategory !== null;
}

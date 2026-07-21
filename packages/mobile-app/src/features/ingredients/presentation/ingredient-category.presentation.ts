import type { IngredientCategory } from "@/features/ingredients/domain/ingredient.types";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/core/theme";

type IngredientCategoryPresentation = {
  pageName: string;
  emoji: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
};

export const ingredientCategoryPresentationById: Record<
  IngredientCategory,
  IngredientCategoryPresentation
> = {
  malt: {
    pageName: "La Malterie",
    emoji: "🌾",
    iconName: "nutrition-outline",
    iconColor: colors.brand.primary,
  },
  hop: {
    pageName: "La Houblonnière",
    emoji: "🌿",
    iconName: "leaf-outline",
    iconColor: colors.semantic.success,
  },
  yeast: {
    pageName: "Le Fermentoir",
    emoji: "🧫",
    iconName: "flask-outline",
    iconColor: colors.brand.secondary,
  },
  // "L'Épicerie" revives the name the shop rayon used to carry: cryptic as a
  // rayon label (a novice looking for adjuncts would not find it), but apt as
  // a page title, where it sits with La Malterie / La Houblonnière / Le
  // Fermentoir. The rayon says what it is; the page keeps the personality.
  misc: {
    pageName: "L'Épicerie",
    emoji: "🌶️",
    iconName: "restaurant-outline",
    iconColor: colors.semantic.warning,
  },
};

export function getIngredientCategoryPageTitle(
  category: IngredientCategory,
): string {
  const presentation = ingredientCategoryPresentationById[category];
  return `${presentation.pageName} ${presentation.emoji}`;
}

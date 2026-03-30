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
};

export function getIngredientCategoryPageTitle(
  category: IngredientCategory,
): string {
  const presentation = ingredientCategoryPresentationById[category];
  return `${presentation.pageName} ${presentation.emoji}`;
}

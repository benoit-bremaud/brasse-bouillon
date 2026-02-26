import {
  Ingredient,
  IngredientCategory,
  isIngredientCategory,
} from "@/features/ingredients/domain/ingredient.types";
import { StyleSheet, Text } from "react-native";
import { colors, spacing, typography } from "@/core/theme";

import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import React from "react";
import { Screen } from "@/core/ui/Screen";
import { getErrorMessage } from "@/core/http/http-error";
import { getIngredientCategoryPageTitle } from "@/features/ingredients/presentation/ingredient-category.presentation";
import { getIngredientDetails } from "@/features/ingredients/application/ingredients.use-cases";
import { useQuery } from "@tanstack/react-query";

type Props = {
  categoryParam?: string;
  ingredientIdParam?: string;
};

function renderTechnicalSheet(item: Ingredient) {
  if (item.category === "malt") {
    return (
      <>
        <Text style={styles.meta}>Type: {item.maltType}</Text>
        <Text style={styles.meta}>EBC: {item.ebc}</Text>
        <Text style={styles.meta}>Potential SG: {item.potentialSg}</Text>
        <Text style={styles.meta}>Max usage: {item.maxPercent}%</Text>
      </>
    );
  }

  if (item.category === "hop") {
    return (
      <>
        <Text style={styles.meta}>Form: {item.form}</Text>
        <Text style={styles.meta}>Usage: {item.hopUse}</Text>
        <Text style={styles.meta}>Alpha acids: {item.alphaAcid}%</Text>
        <Text style={styles.meta}>Beta acids: {item.betaAcid}%</Text>
      </>
    );
  }

  return (
    <>
      <Text style={styles.meta}>Type: {item.yeastType}</Text>
      <Text style={styles.meta}>
        Attenuation: {item.attenuationMin}-{item.attenuationMax}%
      </Text>
      <Text style={styles.meta}>Flocculation: {item.flocculation}</Text>
      <Text style={styles.meta}>
        Fermentation temp: {item.fermentationMinC}-{item.fermentationMaxC}°C
      </Text>
    </>
  );
}

export function IngredientDetailsScreen({
  categoryParam,
  ingredientIdParam,
}: Props) {
  const normalizedCategory = categoryParam ?? "";
  const category: IngredientCategory | null = isIngredientCategory(
    normalizedCategory,
  )
    ? normalizedCategory
    : null;

  const {
    data: ingredient = null,
    isLoading,
    isFetched,
    error: queryError,
    refetch,
  } = useQuery<Ingredient | null>({
    queryKey: ["ingredients", "details", category, ingredientIdParam],
    queryFn: () => {
      if (!category || !ingredientIdParam) {
        return Promise.resolve(null);
      }

      return getIngredientDetails(category, ingredientIdParam);
    },
    enabled: Boolean(category && ingredientIdParam),
  });

  const error = queryError
    ? getErrorMessage(queryError, "Unable to load ingredient sheet")
    : null;

  if (!category || !ingredientIdParam) {
    return (
      <Screen>
        <EmptyStateCard
          title="Unavailable sheet"
          description="Navigation parameters are incomplete."
        />
      </Screen>
    );
  }

  if (isFetched && !isLoading && !ingredient && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Ingredient not found"
          description="This ingredient does not exist in this category."
        />
      </Screen>
    );
  }

  return (
    <Screen
      isLoading={isLoading}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    >
      {ingredient ? (
        <>
          <ListHeader
            title={ingredient.name}
            subtitle={getIngredientCategoryPageTitle(category)}
          />

          <Card style={styles.card}>
            {ingredient.origin ? (
              <Text style={styles.meta}>Origin: {ingredient.origin}</Text>
            ) : null}
            {ingredient.supplier ? (
              <Text style={styles.meta}>Supplier: {ingredient.supplier}</Text>
            ) : null}
            {renderTechnicalSheet(ingredient)}
            {ingredient.notes ? (
              <Text style={styles.notes}>Notes: {ingredient.notes}</Text>
            ) : null}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xs,
  },
  meta: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    marginBottom: spacing.xs,
  },
  notes: {
    marginTop: spacing.xs,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
});

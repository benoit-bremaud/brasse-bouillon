import { colors, spacing, typography } from "@/core/theme";
import {
  Ingredient,
  IngredientCategory,
  ingredientCategoryLabels,
  isIngredientCategory,
} from "@/features/ingredients/domain/ingredient.types";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import { getIngredientDetails } from "@/features/ingredients/application/ingredients.use-cases";

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
        <Text style={styles.meta}>Potentiel SG: {item.potentialSg}</Text>
        <Text style={styles.meta}>Usage max: {item.maxPercent}%</Text>
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

  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredient = async () => {
    if (!category || !ingredientIdParam) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getIngredientDetails(category, ingredientIdParam);
      setIngredient(data);
    } catch (err) {
      setError(getErrorMessage(err, "Impossible de charger la fiche"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredient();
  }, [category, ingredientIdParam]);

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

  if (!isLoading && !ingredient && !error) {
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
    <Screen isLoading={isLoading} error={error} onRetry={fetchIngredient}>
      {ingredient ? (
        <>
          <ListHeader
            title={ingredient.name}
            subtitle={ingredientCategoryLabels[category]}
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

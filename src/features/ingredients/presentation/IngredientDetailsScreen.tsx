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
        <Text style={styles.meta}>Forme: {item.form}</Text>
        <Text style={styles.meta}>Usage: {item.hopUse}</Text>
        <Text style={styles.meta}>Alpha acides: {item.alphaAcid}%</Text>
        <Text style={styles.meta}>Bêta acides: {item.betaAcid}%</Text>
      </>
    );
  }

  return (
    <>
      <Text style={styles.meta}>Type: {item.yeastType}</Text>
      <Text style={styles.meta}>
        Atténuation: {item.attenuationMin}-{item.attenuationMax}%
      </Text>
      <Text style={styles.meta}>Floculation: {item.flocculation}</Text>
      <Text style={styles.meta}>
        Temp. fermentation: {item.fermentationMinC}-{item.fermentationMaxC}°C
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
          title="Fiche indisponible"
          description="Les paramètres de navigation sont incomplets."
        />
      </Screen>
    );
  }

  if (!isLoading && !ingredient && !error) {
    return (
      <Screen>
        <EmptyStateCard
          title="Ingrédient introuvable"
          description="Cet ingrédient n’existe pas dans cette catégorie."
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
              <Text style={styles.meta}>Origine: {ingredient.origin}</Text>
            ) : null}
            {ingredient.supplier ? (
              <Text style={styles.meta}>
                Fournisseur: {ingredient.supplier}
              </Text>
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

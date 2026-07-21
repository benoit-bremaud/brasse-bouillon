import { colors, spacing, typography } from "@/core/theme";
import { getIngredientDetails } from "@/features/ingredients/application/ingredients.use-cases";
import {
  getMiscTypeLabel,
  getMiscUseLabel,
} from "@/features/ingredients/presentation/misc.presentation";
import {
  buildIngredientCategoryBackNavigationParams,
  buildRecipeBackNavigationTarget,
  normalizeIngredientReturnContextParams,
} from "@/features/ingredients/presentation/ingredient-navigation-context";
import { StyleSheet, Text, View } from "react-native";
import { ScreenScrollView } from "@/core/ui/ScreenScrollView";

import { getErrorMessage } from "@/core/http/http-error";
import { normalizeRouteParam } from "@/core/navigation/route-params";
import { Card } from "@/core/ui/Card";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import type { Ingredient } from "@/features/ingredients/domain/ingredient.types";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";

type Props = {
  miscIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
  returnEbcMinParam?: string | string[];
  returnEbcMaxParam?: string | string[];
  returnAlphaMinParam?: string | string[];
  returnAttenuationMinParam?: string | string[];
};

/**
 * Datasheet for a misc ingredient — the Accessoires rayon's fiche.
 *
 * Deliberately lighter than its malt/hop/yeast siblings: misc carries no
 * `specGroups` to parse and no "alternatives" notion (nothing substitutes for
 * a water salt), so the screen is a spec list plus the brewer-facing
 * description — the one thing the list row cannot show.
 */
export function MiscDetailsScreen({
  miscIdParam,
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
  returnEbcMinParam,
  returnEbcMaxParam,
  returnAlphaMinParam,
  returnAttenuationMinParam,
}: Props) {
  const router = useRouter();
  const miscId = normalizeRouteParam(miscIdParam) ?? "";

  const normalizedReturnContext = normalizeIngredientReturnContextParams({
    returnToParam,
    returnRecipeIdParam,
    returnCategoryParam,
    returnSearchParam,
    returnEbcMinParam,
    returnEbcMaxParam,
    returnAlphaMinParam,
    returnAttenuationMinParam,
  });

  const {
    data: misc = null,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery<Ingredient | null>({
    queryKey: ["ingredients", "misc", miscId],
    queryFn: () => getIngredientDetails("misc", miscId),
    enabled: miscId.length > 0,
  });

  const error = queryError
    ? isFetching
      ? null
      : getErrorMessage(queryError, "Impossible de charger l'accessoire")
    : null;
  const isRetryingWithError = isFetching && Boolean(queryError);

  const handleGoBack = () => {
    const recipeBackNavigationTarget = buildRecipeBackNavigationTarget(
      normalizedReturnContext,
    );
    if (recipeBackNavigationTarget) {
      router.push(recipeBackNavigationTarget as never);
      return;
    }

    const ingredientCategoryBackNavigationTarget =
      buildIngredientCategoryBackNavigationParams(normalizedReturnContext);
    if (ingredientCategoryBackNavigationTarget) {
      router.push(ingredientCategoryBackNavigationTarget as never);
      return;
    }

    if (normalizedReturnContext.returnTo) {
      router.push(normalizedReturnContext.returnTo as never);
      return;
    }

    router.push("/(app)/shop");
  };

  const specs =
    misc && misc.category === "misc"
      ? [
          { label: "Type", value: getMiscTypeLabel(misc.miscType) },
          { label: "Ajout", value: getMiscUseLabel(misc.useAt) },
          { label: "Rôle", value: misc.useFor ?? null },
          {
            label: "Durée",
            value: misc.timeMin === undefined ? null : `${misc.timeMin} min`,
          },
        ].filter((spec): spec is { label: string; value: string } =>
          Boolean(spec.value),
        )
      : [];

  return (
    <Screen
      isLoading={(isLoading && !misc) || isRetryingWithError}
      error={error}
      onRetry={() => {
        void refetch();
      }}
    >
      {!misc && !isLoading && !error ? (
        <EmptyStateCard
          title="Accessoire introuvable"
          description="Cet accessoire n'existe pas ou n'est plus au catalogue."
          action={<PrimaryButton label="Retour" onPress={handleGoBack} />}
        />
      ) : null}

      {misc && misc.category === "misc" ? (
        <ScreenScrollView contentContainerStyle={styles.content}>
          <ListHeader title={misc.name} subtitle="Accessoire de brassage" />

          {specs.length > 0 ? (
            <Card style={styles.card}>
              {specs.map((spec) => (
                <View key={spec.label} style={styles.specRow}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </Card>
          ) : null}

          {misc.notes ? (
            <Card style={styles.card}>
              <Text style={styles.sectionTitle}>À quoi ça sert</Text>
              <Text style={styles.description}>{misc.notes}</Text>
            </Card>
          ) : null}

          {/* "Retour", not the "Go back" its malt/hop/yeast siblings still
              show: the app ships in French. Those three are left alone here —
              their tests pin the English label, so aligning them is its own
              change, not a rider on this one. */}
          <PrimaryButton label="Retour" onPress={handleGoBack} />
        </ScreenScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  specLabel: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  specValue: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});

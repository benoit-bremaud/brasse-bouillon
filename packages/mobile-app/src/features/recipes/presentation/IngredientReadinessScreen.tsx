import { ScrollView, StyleSheet, Text, View } from "react-native";

import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { colors, spacing, typography } from "@/core/theme";
import { getErrorMessage } from "@/core/http/http-error";
import { Badge } from "@/core/ui/Badge";
import { Card } from "@/core/ui/Card";
import { ChecklistRow } from "@/core/ui/ChecklistRow";
import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { HeaderBackButton } from "@/core/ui/HeaderBackButton";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import {
  getRecipeDetailsViewModel,
  type RecipeDetailsViewModel,
} from "@/features/recipes/application/recipes.use-cases";
import {
  buildIngredientChecklist,
  getMissingItems,
  isChecklistComplete,
} from "@/features/recipes/application/brew-readiness.use-cases";

type Props = Readonly<{ recipeId: string }>;

/**
 * Pre-brew ingredient readiness (build slice A2 — UC4 "Check ingredient
 * readiness"). Lists the recipe's ingredients with a "have / missing" tick
 * and a recap of what's still missing.
 *
 * The tick state is reversible client state (a sparse `have` overlay kept in
 * `useState`, reset when the screen unmounts) — matching the brew-prep
 * conception's "client state pre-batch, mirror deferred". It does NOT start a
 * batch: re-routing and gating the irreversible "Lancer un brassin" launch is
 * a later slice (A4).
 */
export function IngredientReadinessScreen({ recipeId }: Props) {
  const router = useRouter();
  const hasRecipeId = recipeId.trim().length > 0;

  const {
    data: viewModel = null,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery<RecipeDetailsViewModel | null>({
    queryKey: ["recipes", "detail", recipeId],
    queryFn: () => getRecipeDetailsViewModel(recipeId),
    enabled: hasRecipeId,
  });

  // Base checklist derived from the recipe; never mutated by ticks (a refetch
  // re-derives it, but the user's `have` overlay below is kept separately so
  // a background refetch can't wipe the ticks).
  const checklist = useMemo(
    () => buildIngredientChecklist(viewModel?.ingredients ?? []),
    [viewModel],
  );

  const [haveById, setHaveById] = useState<Record<string, boolean>>({});

  const mergedChecklist = useMemo(
    () => ({
      ...checklist,
      items: checklist.items.map((item) => ({
        ...item,
        have: haveById[item.id] ?? false,
      })),
    }),
    [checklist, haveById],
  );

  const missing = getMissingItems(mergedChecklist);
  const complete = isChecklistComplete(mergedChecklist);
  const hasItems = mergedChecklist.items.length > 0;

  const toggle = (id: string) => {
    setHaveById((current) => ({ ...current, [id]: !(current[id] ?? false) }));
  };

  const errorMessage = queryError
    ? getErrorMessage(queryError, "Impossible de charger la recette")
    : null;

  return (
    <Screen isLoading={isLoading} error={errorMessage} onRetry={refetch}>
      <HeaderBackButton
        label="Recette"
        accessibilityLabel="Revenir à la recette"
        onPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ListHeader
          title="Vérifier mes ingrédients"
          subtitle="Coche ce que tu as déjà. Ce qui manque reste listé pour tes courses."
        />

        {hasItems ? (
          <Card style={styles.listCard}>
            {mergedChecklist.items.map((item) => (
              <ChecklistRow
                key={item.id}
                testID={`ingredient-readiness-row-${item.id}`}
                label={item.name}
                meta={item.qty}
                checked={item.have}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </Card>
        ) : (
          <EmptyStateCard
            title="Aucun ingrédient listé"
            description="Cette recette ne déclare pas encore d'ingrédients à vérifier."
          />
        )}

        {hasItems ? (
          <Card style={styles.recapCard}>
            <View style={styles.recapHeader}>
              <Text style={styles.recapTitle}>Ce qu'il te manque</Text>
              {complete ? <Badge variant="success" label="Prêt" /> : null}
            </View>
            {complete ? (
              <Text style={styles.recapBody}>
                Tu as tous les ingrédients de la recette.
              </Text>
            ) : (
              <>
                <Text style={styles.recapBody}>
                  {missing.length} ingrédient{missing.length > 1 ? "s" : ""} à
                  prévoir :
                </Text>
                {missing.map((item) => (
                  <Text
                    key={item.id}
                    testID={`ingredient-readiness-missing-${item.id}`}
                    style={styles.recapItem}
                  >
                    • {item.name} ({item.qty})
                  </Text>
                ))}
              </>
            )}
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  listCard: {
    padding: spacing.md,
  },
  recapCard: {
    padding: spacing.md,
  },
  recapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  recapTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  recapBody: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  recapItem: {
    marginTop: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { colors, spacing, typography } from "@/core/theme";

type MyRecipesSectionHeaderProps = Readonly<{
  isEmpty: boolean;
  isLoading: boolean;
  onPressScanCta: () => void;
}>;

/**
 * Hub section #1 header of the Mes Recettes screen (Issue #740 Round 2).
 *
 * Renders the section title + subtitle + (when the carnet is empty
 * and the query has settled) the "Scanner ta 1ère bière" CTA wired to
 * the scan flow. The `isLoading` guard avoids flashing the empty state
 * during the initial fetch even when the user actually has recipes
 * (Copilot review on PR #917).
 *
 * Designed to be used as the `ListHeaderComponent` of the parent
 * FlatList in `RecipesScreen`. Horizontal padding is applied by the
 * parent FlatList's `contentContainerStyle` — the header only owns
 * the vertical breathing room (Copilot review on PR #917).
 */
export function MyRecipesSectionHeader({
  isEmpty,
  isLoading,
  onPressScanCta,
}: MyRecipesSectionHeaderProps) {
  const showEmptyState = isEmpty && !isLoading;

  return (
    <View testID="hub-my-recipes-section" style={styles.container}>
      <Text style={styles.sectionTitle}>Mes recettes</Text>
      <Text style={styles.sectionSubtitle}>
        Ton carnet personnel — recettes brassées et imports scan.
      </Text>

      {showEmptyState ? (
        <EmptyStateCard
          title="Aucune recette pour l'instant"
          description="Scanne ta 1ère bière pour démarrer ton carnet de brasseur."
          action={
            <PrimaryButton
              accessibilityLabel="Scanner ta 1ère bière"
              label="Scanner ta 1ère bière"
              onPress={onPressScanCta}
            />
          }
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.weight.bold,
  },
  sectionSubtitle: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    marginTop: spacing.xxs,
    marginBottom: spacing.sm,
  },
});

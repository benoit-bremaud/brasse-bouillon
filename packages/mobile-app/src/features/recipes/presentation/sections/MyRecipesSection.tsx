import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { EmptyStateCard } from "@/core/ui/EmptyStateCard";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { colors, spacing, typography } from "@/core/theme";

type MyRecipesSectionHeaderProps = Readonly<{
  isEmpty: boolean;
  onPressScanCta: () => void;
}>;

/**
 * Hub section #1 header of the Mes Recettes screen (Issue #740 Round 2).
 *
 * Renders the section title + subtitle + (when the carnet is empty)
 * the "Scanner ta 1ère bière" CTA wired to the scan flow.
 *
 * Designed to be used as the `ListHeaderComponent` of the parent
 * FlatList in `RecipesScreen`, so the FlatList native virtualization
 * still applies to the recipe items themselves (Codex P2 review on
 * PR #917 — pre-hub `RecipesScreen` used a FlatList; the v0.1 hub
 * preserves it by lifting the list to the orchestrator).
 */
export function MyRecipesSectionHeader({
  isEmpty,
  onPressScanCta,
}: MyRecipesSectionHeaderProps) {
  return (
    <View testID="hub-my-recipes-section" style={styles.container}>
      <Text style={styles.sectionTitle}>Mes recettes</Text>
      <Text style={styles.sectionSubtitle}>
        Ton carnet personnel — recettes brassées et imports scan.
      </Text>

      {isEmpty ? (
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
    paddingHorizontal: spacing.sm,
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

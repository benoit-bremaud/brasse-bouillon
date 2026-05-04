import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/core/ui/Card";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { colors, radius, spacing, typography } from "@/core/theme";
import {
  NON_PUBLIC_WATER_PREFERENCE_OPTIONS,
  NonPublicWaterPreference,
} from "@/features/recipes/presentation/recipe-details.constants";
import { WATER_METRIC_LABELS } from "@/features/recipes/presentation/recipe-details.utils";
import {
  WATER_LOCATION_PROFILES,
  WATER_STYLE_PRESETS,
} from "@/features/tools/data/water-profiles.data";
import type { WaterStylePresetId } from "@/features/tools/domain/water-profiles";
import type { Recipe } from "@/features/recipes/domain/recipe.types";
import { computeWaterSaltAdditions } from "@/features/recipes/presentation/helpers/water-mineral-salts";

type CompatibilityScore = Readonly<{
  score: number;
  label: string;
  matchedMetrics: number;
  totalMetrics: number;
}>;

type WaterMineralKey = keyof typeof WATER_METRIC_LABELS;

type WaterProfile = Readonly<Record<WaterMineralKey, number>> &
  Readonly<{ name?: string }>;

type WaterTabProps = Readonly<{
  recipe: Recipe;
  recommendedWaterLabel: string;
  recommendedWaterProfile: WaterProfile;
  localWaterProfile: WaterProfile;
  compatibility: CompatibilityScore;
  targetVolumeLiters: number;
  nonPublicWaterPreference: NonPublicWaterPreference;
  onChangeNonPublicWaterPreference: (value: NonPublicWaterPreference) => void;
  selectedWaterStylePresetId: WaterStylePresetId;
  onChangeWaterStylePreset: (id: WaterStylePresetId) => void;
  selectedLocalWaterProfileName: string;
  onChangeLocalWaterProfileName: (name: string) => void;
  onOpenWaterCalculator: () => void;
}>;

/**
 * Water tab of the redesigned recipe detail screen
 * (Issue #740, Round 4 v2 — 5-tab layout).
 *
 * Promoted from a section of the previous Compatibilité tab to a
 * full tab so the brewer can drill into water chemistry without
 * scrolling through the rest of the detail. Adds the v0.1 niveau B
 * deliverable: a "salts to add" card that converts the gap between
 * recipe target and local water into practical brewing-salt grams
 * (gypsum, calcium chloride, table salt) scaled by batch volume —
 * see `helpers/water-mineral-salts.ts`.
 */
export function WaterTab(props: WaterTabProps) {
  const {
    recipe,
    recommendedWaterLabel,
    recommendedWaterProfile,
    localWaterProfile,
    compatibility,
    targetVolumeLiters,
    nonPublicWaterPreference,
    onChangeNonPublicWaterPreference,
    selectedWaterStylePresetId,
    onChangeWaterStylePreset,
    selectedLocalWaterProfileName,
    onChangeLocalWaterProfileName,
    onOpenWaterCalculator,
  } = props;

  const isPublic = recipe.visibility === "public";
  const additions = computeWaterSaltAdditions(
    recommendedWaterProfile,
    localWaterProfile,
    targetVolumeLiters,
  );

  return (
    <ScrollView
      testID="recipe-water-tab"
      contentContainerStyle={styles.container}
    >
      <Text style={styles.sectionTitle}>Profil eau</Text>

      <Card style={styles.card}>
        <Text style={styles.helperText}>{recommendedWaterLabel}</Text>

        {!isPublic ? (
          <View style={styles.toggleRow}>
            {NON_PUBLIC_WATER_PREFERENCE_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={`Use ${option.label.toLowerCase()} recommendation`}
                style={[
                  styles.toggleChip,
                  nonPublicWaterPreference === option.id &&
                    styles.toggleChipActive,
                ]}
                onPress={() => onChangeNonPublicWaterPreference(option.id)}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    nonPublicWaterPreference === option.id &&
                      styles.toggleChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {!isPublic && nonPublicWaterPreference === "style" ? (
          <View style={styles.choiceWrap}>
            {WATER_STYLE_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedWaterStylePresetId;
              return (
                <Pressable
                  key={preset.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Select water style preset ${preset.name}`}
                  style={[
                    styles.choiceChip,
                    isSelected && styles.choiceChipActive,
                  ]}
                  onPress={() => onChangeWaterStylePreset(preset.id)}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      isSelected && styles.choiceChipTextActive,
                    ]}
                  >
                    {preset.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Text style={styles.fieldLabel}>Ton eau locale</Text>
        <View style={styles.choiceWrap}>
          {WATER_LOCATION_PROFILES.map((profile) => {
            const isSelected = profile.name === selectedLocalWaterProfileName;
            return (
              <Pressable
                key={profile.name}
                accessibilityRole="button"
                accessibilityLabel={`Select water location ${profile.name}`}
                style={[
                  styles.choiceChip,
                  isSelected && styles.choiceChipActive,
                ]}
                onPress={() => onChangeLocalWaterProfileName(profile.name)}
              >
                <Text
                  style={[
                    styles.choiceChipText,
                    isSelected && styles.choiceChipTextActive,
                  ]}
                >
                  {profile.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.compatibilityCard}>
          <Text style={styles.compatibilityTitle}>
            Score compatibilité : {compatibility.score}% ({compatibility.label})
          </Text>
          <Text style={styles.compatibilitySubtitle}>
            {compatibility.matchedMetrics}/{compatibility.totalMetrics}{" "}
            métriques dans la zone cible
          </Text>
        </View>

        {(Object.keys(WATER_METRIC_LABELS) as WaterMineralKey[]).map(
          (metric) => (
            <View key={metric} style={styles.metricRow}>
              <Text style={styles.metricLabel}>
                {WATER_METRIC_LABELS[metric]}
              </Text>
              <Text style={styles.metricValue}>
                {recommendedWaterProfile[metric]} / {localWaterProfile[metric]}{" "}
                ppm
              </Text>
            </View>
          ),
        )}

        <PrimaryButton
          label="Comparer dans le Calculateur Eau"
          onPress={onOpenWaterCalculator}
        />
      </Card>

      <Text style={styles.sectionTitle}>Ajouter pour matcher</Text>
      <Card style={styles.card}>
        {additions.length === 0 ? (
          <Text style={styles.emptyText}>
            Ton eau locale est déjà alignée sur le profil cible (ou les écarts
            ne sont pas couvrables par ajout de sels).
          </Text>
        ) : (
          additions.map((addition) => (
            <View key={addition.id} style={styles.additionRow}>
              <View style={styles.additionMain}>
                <Text style={styles.additionName}>
                  {addition.name} ({addition.formula})
                </Text>
                <Text style={styles.additionRationale}>
                  {addition.rationale}
                </Text>
              </View>
              <Text style={styles.additionGrams}>+{addition.grams} g</Text>
            </View>
          ))
        )}
        <Text style={styles.additionFootnote}>
          Quantités calculées pour {targetVolumeLiters} L. Pour aller plus loin
          (pH du mash, dilution), utilise le Calculateur Eau.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    marginBottom: spacing.sm,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  helperText: {
    marginBottom: spacing.sm,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  fieldLabel: {
    marginTop: spacing.sm,
    marginBottom: spacing.xxs,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  toggleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  toggleChipActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  toggleChipText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
  },
  toggleChipTextActive: {
    color: colors.brand.secondary,
  },
  choiceWrap: {
    marginTop: spacing.xs,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  choiceChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral.border,
  },
  choiceChipActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.background,
  },
  choiceChipText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  choiceChipTextActive: {
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
  compatibilityCard: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background,
    borderWidth: 1,
    borderColor: colors.brand.secondary,
    padding: spacing.sm,
  },
  compatibilityTitle: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  compatibilitySubtitle: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  metricLabel: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  metricValue: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  additionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral.border,
  },
  additionMain: {
    flex: 1,
    marginRight: spacing.sm,
  },
  additionName: {
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  additionRationale: {
    marginTop: spacing.xxs,
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  additionGrams: {
    color: colors.brand.secondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  additionFootnote: {
    marginTop: spacing.sm,
    color: colors.neutral.muted,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  emptyText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
});

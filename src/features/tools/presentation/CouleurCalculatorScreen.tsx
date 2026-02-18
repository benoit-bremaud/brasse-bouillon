import {
  calculateMCU,
  calculateRequiredMaltForTargetSRM,
  calculateSRMFromMalts,
  srmToEBC,
  type ColorMaltInput,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { fermentableMaltCatalog } from "./fermentables-catalog";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { getSrmColor, getSrmStyleLabel } from "./srm-colors";

type TabName = "rapide" | "inverse" | "palette";

type RecipeColorMalt = {
  id: string;
  maltIndex: number;
  weightKg: number;
};

const SRM_PALETTE_SIZE = 40;
const SRM_DARK_TEXT_THRESHOLD = 12;
const INITIAL_VOLUME_LITERS = 20;
const INITIAL_TARGET_SRM = 15;
const INITIAL_PRIMARY_MALT_INDEX = 10; // crystal-40

function getSrmTextColor(srm: number): string {
  return srm <= SRM_DARK_TEXT_THRESHOLD
    ? colors.neutral.textPrimary
    : colors.neutral.white;
}

export function CouleurCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("rapide");

  // Rapide tab state
  const [recipeMalts, setRecipeMalts] = useState<RecipeColorMalt[]>([
    { id: "1", maltIndex: 0, weightKg: 4 }, // Pilsner
    { id: "2", maltIndex: 7, weightKg: 0.5 }, // Cara 50
  ]);
  const [volumeLiters, setVolumeLiters] = useState(INITIAL_VOLUME_LITERS);

  // Inverse tab state
  const [targetSrm, setTargetSrm] = useState(INITIAL_TARGET_SRM);
  const [primaryMaltIndex, setPrimaryMaltIndex] = useState(
    INITIAL_PRIMARY_MALT_INDEX,
  );
  const [inverseVolume, setInverseVolume] = useState(INITIAL_VOLUME_LITERS);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAddMalt = useCallback(() => {
    const newMalt: RecipeColorMalt = {
      id: Date.now().toString(),
      maltIndex: 6, // Cara 20 as default
      weightKg: 0.3,
    };
    setRecipeMalts((prev) => [...prev, newMalt]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleRemoveMalt = useCallback((id: string) => {
    setRecipeMalts((prev) => prev.filter((m) => m.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleMaltWeightChange = useCallback((id: string, weight: number) => {
    setRecipeMalts((prev) =>
      prev.map((m) => (m.id === id ? { ...m, weightKg: weight } : m)),
    );
  }, []);

  const handleMaltIndexChange = useCallback((id: string, delta: 1 | -1) => {
    setRecipeMalts((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const next = m.maltIndex + delta;
        const newIndex =
          next < 0
            ? fermentableMaltCatalog.length - 1
            : next >= fermentableMaltCatalog.length
              ? 0
              : next;
        return { ...m, maltIndex: newIndex };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePrimaryMaltPrev = useCallback(() => {
    setPrimaryMaltIndex((prev) =>
      prev === 0 ? fermentableMaltCatalog.length - 1 : prev - 1,
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handlePrimaryMaltNext = useCallback(() => {
    setPrimaryMaltIndex((prev) =>
      prev === fermentableMaltCatalog.length - 1 ? 0 : prev + 1,
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Rapide calculations
  const colorMaltInputs: ColorMaltInput[] = recipeMalts.map((rm) => ({
    weightKg: rm.weightKg,
    lovibond: fermentableMaltCatalog[rm.maltIndex].lovibond,
  }));
  const calculatedMcu = calculateMCU(colorMaltInputs, volumeLiters);
  const calculatedSrm = calculateSRMFromMalts(colorMaltInputs, volumeLiters);
  const calculatedEbc = srmToEBC(calculatedSrm);
  const srmColorHex = getSrmColor(calculatedSrm);
  const srmStyleLabel = getSrmStyleLabel(calculatedSrm);
  const srmTextColor = getSrmTextColor(calculatedSrm);

  // Inverse calculations
  const primaryMalt = fermentableMaltCatalog[primaryMaltIndex];
  const requiredKg = calculateRequiredMaltForTargetSRM(
    targetSrm,
    inverseVolume,
    primaryMalt.lovibond,
  );
  const inverseColorHex = getSrmColor(targetSrm);
  const inverseStyleLabel = getSrmStyleLabel(targetSrm);
  const inverseTextColor = getSrmTextColor(targetSrm);

  return (
    <Screen>
      <ListHeader title="🎨 Calculs Couleur" subtitle="MCU · SRM · EBC" />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "rapide" && styles.tabActive]}
          onPress={() => handleTabChange("rapide")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rapide" && styles.tabTextActive,
            ]}
          >
            Rapide
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "inverse" && styles.tabActive]}
          onPress={() => handleTabChange("inverse")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "inverse" && styles.tabTextActive,
            ]}
          >
            Inversé
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "palette" && styles.tabActive]}
          onPress={() => handleTabChange("palette")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "palette" && styles.tabTextActive,
            ]}
          >
            Palette
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "rapide" && (
          <>
            {/* Volume */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Volume de brassage</Text>
              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>
                  Volume (L) : {volumeLiters}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={50}
                  value={volumeLiters}
                  onValueChange={setVolumeLiters}
                  step={1}
                  minimumTrackTintColor={colors.brand.primary}
                  maximumTrackTintColor={colors.neutral.border}
                  thumbTintColor={colors.brand.primary}
                />
              </View>
            </Card>

            {/* Grain bill */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Malts de la recette</Text>
                <Pressable style={styles.addButton} onPress={handleAddMalt}>
                  <Text style={styles.addButtonText}>+ Ajouter</Text>
                </Pressable>
              </View>

              {recipeMalts.map((recipeMalt) => {
                const malt = fermentableMaltCatalog[recipeMalt.maltIndex];
                return (
                  <View key={recipeMalt.id} style={styles.maltRow}>
                    <View style={styles.maltSelectorCompact}>
                      <Pressable
                        style={styles.maltArrowCompact}
                        onPress={() => handleMaltIndexChange(recipeMalt.id, -1)}
                      >
                        <Text style={styles.maltArrowCompactText}>‹</Text>
                      </Pressable>

                      <View style={styles.maltInfoCompact}>
                        <Text style={styles.maltName}>{malt.name}</Text>
                        <Text style={styles.maltSpecs}>
                          Lovibond : {malt.lovibond}°L
                        </Text>
                      </View>

                      <Pressable
                        style={styles.maltArrowCompact}
                        onPress={() => handleMaltIndexChange(recipeMalt.id, 1)}
                      >
                        <Text style={styles.maltArrowCompactText}>›</Text>
                      </Pressable>
                    </View>

                    <View style={styles.maltControls}>
                      <TextInput
                        style={styles.weightInput}
                        value={recipeMalt.weightKg.toString()}
                        onChangeText={(text) => {
                          const weight = parseFloat(text) || 0;
                          handleMaltWeightChange(recipeMalt.id, weight);
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <Text style={styles.weightUnit}>kg</Text>

                      {recipeMalts.length > 1 && (
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => handleRemoveMalt(recipeMalt.id)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })}
            </Card>

            {/* Color preview */}
            <View
              style={[styles.colorPreview, { backgroundColor: srmColorHex }]}
            >
              <Text style={[styles.colorPreviewSrm, { color: srmTextColor }]}>
                SRM {calculatedSrm.toFixed(1)}
              </Text>
              <Text style={[styles.colorPreviewLabel, { color: srmTextColor }]}>
                {srmStyleLabel}
              </Text>
            </View>

            {/* Results */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Résultats calculés</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>MCU</Text>
                <Text style={styles.resultValue}>
                  {calculatedMcu.toFixed(1)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>SRM</Text>
                <Text style={styles.resultValue}>
                  {calculatedSrm.toFixed(1)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>EBC</Text>
                <Text style={styles.resultValue}>
                  {calculatedEbc.toFixed(1)}
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "inverse" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres cibles</Text>
              <Text style={styles.cardSubtitle}>
                Quelle quantité de malt pour atteindre une couleur cible ?
              </Text>

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>SRM cible : {targetSrm}</Text>
                <Slider
                  testID="srm-cible"
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={40}
                  value={targetSrm}
                  onValueChange={(val) => setTargetSrm(Math.round(val))}
                  step={1}
                  minimumTrackTintColor={colors.brand.primary}
                  maximumTrackTintColor={colors.neutral.border}
                  thumbTintColor={colors.brand.primary}
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Volume (L)</Text>
                <TextInput
                  style={styles.textInput}
                  value={inverseVolume.toString()}
                  onChangeText={(text) =>
                    setInverseVolume(parseFloat(text) || 20)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>
            </Card>

            {/* Primary malt selector */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Malt colorant principal</Text>
              <View style={styles.maltSelectorRow}>
                <Pressable
                  style={styles.maltSelectorArrow}
                  onPress={handlePrimaryMaltPrev}
                >
                  <Text style={styles.maltSelectorArrowText}>‹</Text>
                </Pressable>

                <View style={styles.maltSelectorInfo}>
                  <Text style={styles.maltSelectorName}>
                    {primaryMalt.name}
                  </Text>
                  <Text style={styles.maltSelectorLovibond}>
                    {primaryMalt.lovibond}°L
                  </Text>
                </View>

                <Pressable
                  style={styles.maltSelectorArrow}
                  onPress={handlePrimaryMaltNext}
                >
                  <Text style={styles.maltSelectorArrowText}>›</Text>
                </Pressable>
              </View>
            </Card>

            {/* Color preview */}
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: inverseColorHex },
              ]}
            >
              <Text
                style={[styles.colorPreviewSrm, { color: inverseTextColor }]}
              >
                SRM {targetSrm} cible
              </Text>
              <Text
                style={[styles.colorPreviewLabel, { color: inverseTextColor }]}
              >
                {inverseStyleLabel}
              </Text>
            </View>

            {/* Result */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Quantité nécessaire</Text>
              <View style={styles.inverseResult}>
                <Text style={styles.inverseResultValue}>
                  {requiredKg.toFixed(2)} kg
                </Text>
                <Text style={styles.inverseResultLabel}>
                  de {primaryMalt.name}
                </Text>
                <Text style={styles.inverseResultNote}>
                  pour atteindre SRM {targetSrm} sur {inverseVolume} L
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "palette" && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Palette de référence SRM</Text>
            <Text style={styles.cardSubtitle}>EBC ≈ SRM × 1,97</Text>
            <View style={styles.paletteGrid}>
              {Array.from({ length: SRM_PALETTE_SIZE }, (_, i) => i + 1).map(
                (srm) => {
                  const hex = getSrmColor(srm);
                  const ebc = srmToEBC(srm);
                  const textColor = getSrmTextColor(srm);
                  return (
                    <View
                      key={srm}
                      style={[styles.paletteCell, { backgroundColor: hex }]}
                    >
                      <Text style={[styles.paletteSrm, { color: textColor }]}>
                        {srm}
                      </Text>
                      <Text style={[styles.paletteEbc, { color: textColor }]}>
                        {ebc.toFixed(0)} EBC
                      </Text>
                    </View>
                  );
                },
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.xxs,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  tabActive: {
    backgroundColor: colors.brand.primary,
  },
  tabText: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
  },
  tabTextActive: {
    color: colors.neutral.white,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  paramRow: {
    marginBottom: spacing.xs,
  },
  paramLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  slider: {
    height: 40,
  },
  addButton: {
    backgroundColor: colors.brand.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  addButtonText: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    fontWeight: typography.weight.medium,
  },
  maltRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  maltSelectorCompact: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  maltArrowCompact: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.background,
    borderRadius: radius.sm,
  },
  maltArrowCompactText: {
    fontSize: 18,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  maltInfoCompact: {
    flex: 1,
    alignItems: "center",
  },
  maltName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  maltSpecs: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  maltControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    width: 60,
    textAlign: "center",
    fontSize: typography.size.label,
  },
  weightUnit: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  removeButton: {
    backgroundColor: colors.semantic.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: typography.weight.bold,
  },
  colorPreview: {
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  colorPreviewSrm: {
    fontSize: 28,
    fontWeight: typography.weight.bold,
  },
  colorPreviewLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
    marginTop: spacing.xxs,
    opacity: 0.9,
  },
  resultCard: {
    backgroundColor: colors.semantic.success,
    marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  resultLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  resultValue: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  inputRow: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.size.body,
  },
  maltSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  maltSelectorArrow: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.background,
    borderRadius: radius.sm,
  },
  maltSelectorArrowText: {
    fontSize: 24,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  maltSelectorInfo: {
    flex: 1,
    alignItems: "center",
  },
  maltSelectorName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    textAlign: "center",
  },
  maltSelectorLovibond: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  inverseResult: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  inverseResultValue: {
    fontSize: 32,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  inverseResultLabel: {
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
    marginTop: spacing.xs,
  },
  inverseResultNote: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  paletteGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  paletteCell: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxs,
  },
  paletteSrm: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },
  paletteEbc: {
    fontSize: 9,
    marginTop: 1,
    opacity: 0.85,
  },
});

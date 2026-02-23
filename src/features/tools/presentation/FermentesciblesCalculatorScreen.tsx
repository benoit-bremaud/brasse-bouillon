import {
  calculateOgFromFermentables,
  calculateRequiredMaltKgForTargetOg,
  calculateWeightedEfmPercent,
  correctSgForTemperature,
  ogToPoints,
  sgToPlato,
  type FermentableInput,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import {
  fermentableMaltCatalog,
  type FermentableMalt,
} from "@/features/tools/data/catalogs/fermentables";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

type TabName = "rapide" | "inverse" | "expert";

type RecipeMalt = {
  id: string;
  malt: FermentableMalt;
  weightKg: number;
};

export function FermentesciblesCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("rapide");
  const [recipeMalts, setRecipeMalts] = useState<RecipeMalt[]>([
    { id: "1", malt: fermentableMaltCatalog[0], weightKg: 4 },
    { id: "2", malt: fermentableMaltCatalog[2], weightKg: 0.3 },
  ]);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [brewhouseEfficiency, setBrewhouseEfficiency] = useState(75);

  // États pour l'onglet Inversé
  const [targetOg, setTargetOg] = useState(1.065);
  const [primaryMalt] = useState(fermentableMaltCatalog[0]);

  // États pour l'onglet Expert
  const [sgToConvert, setSgToConvert] = useState(1.065);
  const [measuredSg, setMeasuredSg] = useState(1.065);
  const [measuredTemp, setMeasuredTemp] = useState(25);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAddMalt = useCallback(() => {
    const newMalt: RecipeMalt = {
      id: Date.now().toString(),
      malt: fermentableMaltCatalog[1],
      weightKg: 0.5,
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

  const handleCopyResults = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Résultats copiés",
      "Les calculs sont maintenant dans votre presse-papier.",
    );
  }, []);

  // Calculs en temps réel
  const fermentablesInput: FermentableInput[] = recipeMalts.map((rm) => ({
    weightKg: rm.weightKg,
    ppg: rm.malt.ppg,
    efmPercent: rm.malt.efm,
  }));

  const calculatedOg = calculateOgFromFermentables(
    fermentablesInput,
    volumeLiters,
    brewhouseEfficiency,
  );
  const calculatedPoints = ogToPoints(calculatedOg);
  const calculatedEfm = calculateWeightedEfmPercent(fermentablesInput);

  const requiredKg = calculateRequiredMaltKgForTargetOg(
    targetOg,
    volumeLiters,
    brewhouseEfficiency,
    primaryMalt.ppg,
  );

  const convertedPlato = sgToPlato(sgToConvert);
  const convertedPoints = ogToPoints(sgToConvert);
  const correctedSg = correctSgForTemperature(measuredSg, measuredTemp);

  return (
    <Screen>
      <ListHeader
        title="🍺 Calculs Fermentescibles"
        subtitle="Densité initiale et malts"
      />

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
          style={[styles.tab, activeTab === "expert" && styles.tabActive]}
          onPress={() => handleTabChange("expert")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "expert" && styles.tabTextActive,
            ]}
          >
            Expert
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "rapide" && (
          <>
            {/* Paramètres de base */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres de brassage</Text>

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>
                  Volume (L): {volumeLiters}
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

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>
                  Rendement (%): {brewhouseEfficiency}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={60}
                  maximumValue={90}
                  value={brewhouseEfficiency}
                  onValueChange={setBrewhouseEfficiency}
                  step={1}
                  minimumTrackTintColor={colors.brand.primary}
                  maximumTrackTintColor={colors.neutral.border}
                  thumbTintColor={colors.brand.primary}
                />
              </View>
            </Card>

            {/* Liste des malts */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Malts de la recette</Text>
                <Pressable style={styles.addButton} onPress={handleAddMalt}>
                  <Text style={styles.addButtonText}>+ Ajouter</Text>
                </Pressable>
              </View>

              {recipeMalts.map((recipeMalt) => (
                <View key={recipeMalt.id} style={styles.maltRow}>
                  <View style={styles.maltInfo}>
                    <Text style={styles.maltName}>{recipeMalt.malt.name}</Text>
                    <Text style={styles.maltSpecs}>
                      PPG: {recipeMalt.malt.ppg} • EFM: {recipeMalt.malt.efm}%
                    </Text>
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
              ))}
            </Card>

            {/* Résultats */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Résultats calculés</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>OG prédit</Text>
                <Text style={styles.resultValue}>
                  {calculatedOg.toFixed(3)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Points de gravité</Text>
                <Text style={styles.resultValue}>
                  {calculatedPoints.toFixed(1)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>EFM moyen</Text>
                <Text style={styles.resultValue}>
                  {calculatedEfm.toFixed(1)}%
                </Text>
              </View>
            </Card>

            <PrimaryButton
              label="Copier les résultats"
              onPress={handleCopyResults}
              style={styles.copyButton}
            />
          </>
        )}

        {activeTab === "inverse" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Calcul inversé</Text>
              <Text style={styles.cardSubtitle}>
                Déterminer la quantité de malt pour une OG cible
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>OG cible</Text>
                <TextInput
                  style={styles.textInput}
                  value={targetOg.toString()}
                  onChangeText={(text) => setTargetOg(parseFloat(text) || 1.0)}
                  keyboardType="numeric"
                  placeholder="1.065"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Volume (L)</Text>
                <TextInput
                  style={styles.textInput}
                  value={volumeLiters.toString()}
                  onChangeText={(text) =>
                    setVolumeLiters(parseFloat(text) || 20)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Rendement (%)</Text>
                <TextInput
                  style={styles.textInput}
                  value={brewhouseEfficiency.toString()}
                  onChangeText={(text) =>
                    setBrewhouseEfficiency(parseFloat(text) || 75)
                  }
                  keyboardType="numeric"
                  placeholder="75"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Quantité nécessaire</Text>
              <View style={styles.inverseResult}>
                <Text style={styles.inverseResultValue}>
                  {requiredKg.toFixed(2)} kg
                </Text>
                <Text style={styles.inverseResultLabel}>
                  de {primaryMalt.name}
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "expert" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Conversions</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>SG à convertir</Text>
                <TextInput
                  style={styles.textInput}
                  value={sgToConvert.toString()}
                  onChangeText={(text) =>
                    setSgToConvert(parseFloat(text) || 1.0)
                  }
                  keyboardType="numeric"
                  placeholder="1.065"
                />
              </View>

              <View style={styles.conversionResults}>
                <View style={styles.conversionRow}>
                  <Text style={styles.conversionLabel}>Points</Text>
                  <Text style={styles.conversionValue}>
                    {convertedPoints.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.conversionRow}>
                  <Text style={styles.conversionLabel}>°Plato</Text>
                  <Text style={styles.conversionValue}>
                    {convertedPlato.toFixed(1)}°P
                  </Text>
                </View>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Correction température</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>SG mesuré</Text>
                <TextInput
                  style={styles.textInput}
                  value={measuredSg.toString()}
                  onChangeText={(text) =>
                    setMeasuredSg(parseFloat(text) || 1.0)
                  }
                  keyboardType="numeric"
                  placeholder="1.065"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Température (°C)</Text>
                <TextInput
                  style={styles.textInput}
                  value={measuredTemp.toString()}
                  onChangeText={(text) =>
                    setMeasuredTemp(parseFloat(text) || 20)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.correctionResult}>
                <Text style={styles.correctionLabel}>SG corrigé (20°C)</Text>
                <Text style={styles.correctionValue}>
                  {correctedSg.toFixed(3)}
                </Text>
              </View>
            </Card>
          </>
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
    marginBottom: spacing.sm,
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
  maltInfo: {
    flex: 1,
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
  copyButton: {
    marginTop: spacing.sm,
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
  conversionResults: {
    marginTop: spacing.sm,
  },
  conversionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  conversionLabel: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
  },
  conversionValue: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  correctionResult: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.semantic.info,
    borderRadius: radius.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  correctionLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  correctionValue: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
});

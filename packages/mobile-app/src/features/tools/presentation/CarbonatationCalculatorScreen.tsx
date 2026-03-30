import * as Haptics from "expo-haptics";

import {
  calculateKegPressurePsiForTargetCo2,
  calculatePrimingSugarGrams,
  estimateResidualCo2Volumes,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";

type TabName = "priming" | "pression" | "styles";
type SugarType = "dextrose" | "sucrose";

type StyleCo2Range = {
  style: string;
  min: number;
  max: number;
};

const styleRanges: StyleCo2Range[] = [
  { style: "Bitter / Stout anglaise", min: 1.8, max: 2.2 },
  { style: "Pale Ale / IPA", min: 2.2, max: 2.6 },
  { style: "Belgian Ale / Wheat", min: 2.6, max: 3.2 },
  { style: "Saison / Weizen", min: 3.0, max: 4.0 },
];

export function CarbonatationCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("priming");
  const [sugarType, setSugarType] = useState<SugarType>("dextrose");

  const [targetCo2Volumes, setTargetCo2Volumes] = useState(2.4);
  const [batchVolumeLiters, setBatchVolumeLiters] = useState(20);
  const [beerTempCelsius, setBeerTempCelsius] = useState(20);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSugarTypeChange = useCallback((next: SugarType) => {
    setSugarType(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const residualCo2Volumes = estimateResidualCo2Volumes(beerTempCelsius);
  const additionalCo2Volumes = Math.max(
    0,
    targetCo2Volumes - residualCo2Volumes,
  );
  const primingSugarGrams = calculatePrimingSugarGrams(
    targetCo2Volumes,
    batchVolumeLiters,
    beerTempCelsius,
    sugarType,
  );
  const kegPressurePsi = calculateKegPressurePsiForTargetCo2(
    targetCo2Volumes,
    beerTempCelsius,
  );

  const gramsPerLiter =
    batchVolumeLiters > 0 ? primingSugarGrams / batchVolumeLiters : 0;

  const matchingStyle = useMemo(() => {
    return styleRanges.find(
      (range) => targetCo2Volumes >= range.min && targetCo2Volumes <= range.max,
    );
  }, [targetCo2Volumes]);

  return (
    <Screen>
      <ListHeader
        title="🍾 Calculs Carbonatation"
        subtitle="Priming · CO₂ résiduel · Pression fût"
      />

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "priming" && styles.tabActive]}
          onPress={() => handleTabChange("priming")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "priming" && styles.tabTextActive,
            ]}
          >
            Priming
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "pression" && styles.tabActive]}
          onPress={() => handleTabChange("pression")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pression" && styles.tabTextActive,
            ]}
          >
            Pression
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "styles" && styles.tabActive]}
          onPress={() => handleTabChange("styles")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "styles" && styles.tabTextActive,
            ]}
          >
            Styles
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "priming" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres priming</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>CO₂ cible (vol)</Text>
                <TextInput
                  testID="co2-target-input"
                  style={styles.textInput}
                  value={targetCo2Volumes.toString()}
                  onChangeText={(text) =>
                    setTargetCo2Volumes(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="2.4"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Volume bière (L)</Text>
                <TextInput
                  style={styles.textInput}
                  value={batchVolumeLiters.toString()}
                  onChangeText={(text) =>
                    setBatchVolumeLiters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Température bière (°C)</Text>
                <TextInput
                  style={styles.textInput}
                  value={beerTempCelsius.toString()}
                  onChangeText={(text) =>
                    setBeerTempCelsius(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.toggleRow}>
                <Pressable
                  style={[
                    styles.toggle,
                    sugarType === "dextrose" && styles.toggleActive,
                  ]}
                  onPress={() => handleSugarTypeChange("dextrose")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      sugarType === "dextrose" && styles.toggleTextActive,
                    ]}
                  >
                    Dextrose
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.toggle,
                    sugarType === "sucrose" && styles.toggleActive,
                  ]}
                  onPress={() => handleSugarTypeChange("sucrose")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      sugarType === "sucrose" && styles.toggleTextActive,
                    ]}
                  >
                    Saccharose
                  </Text>
                </Pressable>
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Dose de sucre</Text>

              <View style={styles.bigResultContainer}>
                <Text style={styles.bigResultValue}>
                  {primingSugarGrams.toFixed(0)} g
                </Text>
                <Text style={styles.bigResultNote}>
                  à dissoudre puis homogénéiser
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>g/L</Text>
                <Text style={styles.resultValue}>
                  {gramsPerLiter.toFixed(2)} g/L
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>CO₂ résiduel estimé</Text>
                <Text style={styles.resultValue}>
                  {residualCo2Volumes.toFixed(2)} vol
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>CO₂ à produire</Text>
                <Text style={styles.resultValue}>
                  {additionalCo2Volumes.toFixed(2)} vol
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "pression" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Force carbonation (fût)</Text>
              <Text style={styles.descriptionText}>
                Pression estimée à maintenir pour atteindre la carbonatation
                cible à la température de service.
              </Text>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Pression cible</Text>

              <View style={styles.bigResultContainer}>
                <Text style={styles.bigResultValue}>
                  {kegPressurePsi.toFixed(1)} psi
                </Text>
                <Text style={styles.bigResultNote}>
                  ≈ {(kegPressurePsi * 0.069).toFixed(2)} bar
                </Text>
              </View>

              <Text style={styles.noteText}>
                Toujours vérifier les tableaux constructeur du matériel avant
                consigne finale.
              </Text>
            </Card>
          </>
        )}

        {activeTab === "styles" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Références CO₂ par style</Text>

              {styleRanges.map((range) => (
                <View key={range.style} style={styles.styleRow}>
                  <View style={styles.styleInfo}>
                    <Text style={styles.styleName}>{range.style}</Text>
                    <Text style={styles.styleRange}>
                      {range.min.toFixed(1)} - {range.max.toFixed(1)} vol
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Positionnement actuel</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Cible actuelle</Text>
                <Text style={styles.resultValue}>
                  {targetCo2Volumes.toFixed(2)} vol
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Style correspondant</Text>
                <Text style={styles.resultValue}>
                  {matchingStyle ? matchingStyle.style : "Hors plage référence"}
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
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
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
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.bold,
    marginBottom: spacing.sm,
  },
  inputRow: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
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
  toggleRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  toggle: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  toggleActive: {
    borderColor: colors.brand.secondary,
    backgroundColor: colors.brand.secondary,
  },
  toggleText: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  toggleTextActive: {
    color: colors.neutral.white,
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
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  resultValue: {
    fontSize: typography.size.body,
    color: colors.brand.primary,
    fontWeight: typography.weight.bold,
  },
  bigResultContainer: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  bigResultValue: {
    fontSize: 36,
    color: colors.brand.primary,
    fontWeight: typography.weight.bold,
  },
  bigResultNote: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
  },
  descriptionText: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
  },
  noteText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  styleRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    paddingVertical: spacing.xs,
  },
  styleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  styleName: {
    flex: 1,
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
    marginRight: spacing.xs,
  },
  styleRange: {
    fontSize: typography.size.label,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
});

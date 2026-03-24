import {
  calculateBrewhouseEfficiencyPercent,
  calculateTargetPreBoilVolumeLiters,
  calculateWaterPlanVolumes,
  ogToPoints,
  type FermentableInput,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type TabName = "rendement" | "volumes" | "eau";

type GrainLine = {
  id: string;
  name: string;
  weightKg: number;
  ppg: number;
};

export function RendementCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("rendement");

  const [actualOg, setActualOg] = useState(1.06);
  const [batchVolumeLiters, setBatchVolumeLiters] = useState(20);
  const [grainBill, setGrainBill] = useState<GrainLine[]>([
    { id: "1", name: "Pilsner", weightKg: 4, ppg: 37.5 },
    { id: "2", name: "Munich", weightKg: 0.3, ppg: 33 },
  ]);

  const [targetColdVolumeLiters, setTargetColdVolumeLiters] = useState(20);
  const [boilOffLiters, setBoilOffLiters] = useState(4);
  const [trubLossLiters, setTrubLossLiters] = useState(1);
  const [shrinkagePercent, setShrinkagePercent] = useState(4);

  const [planGrainKg, setPlanGrainKg] = useState(4.3);
  const [mashRatioLitersPerKg, setMashRatioLitersPerKg] = useState(3);
  const [grainAbsorptionLitersPerKg, setGrainAbsorptionLitersPerKg] =
    useState(0.8);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleGrainWeightChange = useCallback((id: string, value: string) => {
    const parsed = parseFloat(value) || 0;
    setGrainBill((prev) =>
      prev.map((grain) =>
        grain.id === id ? { ...grain, weightKg: parsed } : grain,
      ),
    );
  }, []);

  const fermentablesInput: FermentableInput[] = useMemo(
    () =>
      grainBill.map((grain) => ({
        weightKg: grain.weightKg,
        ppg: grain.ppg,
      })),
    [grainBill],
  );

  const efficiencyPercent = calculateBrewhouseEfficiencyPercent(
    actualOg,
    batchVolumeLiters,
    fermentablesInput,
  );

  const actualNormalizedPoints =
    (ogToPoints(actualOg) * Math.max(0, batchVolumeLiters)) / 10;
  const theoreticalNormalizedPoints = fermentablesInput.reduce(
    (sum, fermentable) => sum + fermentable.weightKg * fermentable.ppg,
    0,
  );

  const preBoilVolumeLiters = calculateTargetPreBoilVolumeLiters(
    targetColdVolumeLiters,
    boilOffLiters,
    trubLossLiters,
    shrinkagePercent,
  );

  const hotPostBoilLiters = Math.max(0, preBoilVolumeLiters - boilOffLiters);

  const waterPlan = calculateWaterPlanVolumes(
    planGrainKg,
    mashRatioLitersPerKg,
    targetColdVolumeLiters,
    boilOffLiters,
    trubLossLiters,
    grainAbsorptionLitersPerKg,
    shrinkagePercent,
  );

  return (
    <Screen>
      <ListHeader
        title="⚙️ Calculs Rendement"
        subtitle="Efficacité · Volumes · Plan d'eau"
      />

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "rendement" && styles.tabActive]}
          onPress={() => handleTabChange("rendement")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rendement" && styles.tabTextActive,
            ]}
          >
            Rendement
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "volumes" && styles.tabActive]}
          onPress={() => handleTabChange("volumes")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "volumes" && styles.tabTextActive,
            ]}
          >
            Volumes
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "eau" && styles.tabActive]}
          onPress={() => handleTabChange("eau")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "eau" && styles.tabTextActive,
            ]}
          >
            Plan d'eau
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "rendement" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Mesures brassin</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>OG mesurée</Text>
                <TextInput
                  testID="rendement-og-input"
                  style={styles.textInput}
                  value={actualOg.toString()}
                  onChangeText={(text) => setActualOg(parseFloat(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1.060"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Volume final (L)</Text>
                <TextInput
                  testID="rendement-volume-input"
                  style={styles.textInput}
                  value={batchVolumeLiters.toString()}
                  onChangeText={(text) =>
                    setBatchVolumeLiters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Grain bill</Text>
              {grainBill.map((grain) => (
                <View key={grain.id} style={styles.grainRow}>
                  <View style={styles.grainInfo}>
                    <Text style={styles.grainName}>{grain.name}</Text>
                    <Text style={styles.grainMeta}>PPG {grain.ppg}</Text>
                  </View>

                  <View style={styles.grainInputGroup}>
                    <TextInput
                      style={styles.weightInput}
                      value={grain.weightKg.toString()}
                      onChangeText={(text) =>
                        handleGrainWeightChange(grain.id, text)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.unitText}>kg</Text>
                  </View>
                </View>
              ))}
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Résultats</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rendement global</Text>
                <Text style={styles.resultValue}>
                  {efficiencyPercent.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Points réels</Text>
                <Text style={styles.resultValue}>
                  {actualNormalizedPoints.toFixed(1)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Points théoriques</Text>
                <Text style={styles.resultValue}>
                  {theoreticalNormalizedPoints.toFixed(1)}
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "volumes" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Pertes process</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Volume froid cible (L)</Text>
                <TextInput
                  testID="volumes-target-input"
                  style={styles.textInput}
                  value={targetColdVolumeLiters.toString()}
                  onChangeText={(text) =>
                    setTargetColdVolumeLiters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  Évaporation ébullition (L)
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={boilOffLiters.toString()}
                  onChangeText={(text) =>
                    setBoilOffLiters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="4"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Pertes trub/transfert (L)</Text>
                <TextInput
                  style={styles.textInput}
                  value={trubLossLiters.toString()}
                  onChangeText={(text) =>
                    setTrubLossLiters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>
                  Retrait refroidissement (%)
                </Text>
                <TextInput
                  style={styles.textInput}
                  value={shrinkagePercent.toString()}
                  onChangeText={(text) =>
                    setShrinkagePercent(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="4"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Volume pré-ébullition cible</Text>

              <View style={styles.bigResultContainer}>
                <Text style={styles.bigResultValue}>
                  {preBoilVolumeLiters.toFixed(1)} L
                </Text>
                <Text style={styles.bigResultNote}>à collecter avant boil</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Post-boil chaud estimé</Text>
                <Text style={styles.resultValue}>
                  {hotPostBoilLiters.toFixed(1)} L
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "eau" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres empâtage</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Masse totale grains (kg)</Text>
                <TextInput
                  testID="plan-grain-input"
                  style={styles.textInput}
                  value={planGrainKg.toString()}
                  onChangeText={(text) => setPlanGrainKg(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  placeholder="4.3"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Ratio empâtage (L/kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={mashRatioLitersPerKg.toString()}
                  onChangeText={(text) =>
                    setMashRatioLitersPerKg(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Absorption grain (L/kg)</Text>
                <TextInput
                  style={styles.textInput}
                  value={grainAbsorptionLitersPerKg.toString()}
                  onChangeText={(text) =>
                    setGrainAbsorptionLitersPerKg(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="0.8"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Plan d'eau</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Eau d'empâtage</Text>
                <Text style={styles.resultValue}>
                  {waterPlan.mashWaterLiters.toFixed(1)} L
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Eau de rinçage</Text>
                <Text style={styles.resultValue}>
                  {waterPlan.spargeWaterLiters.toFixed(1)} L
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Eau totale</Text>
                <Text style={styles.resultValue}>
                  {waterPlan.totalWaterLiters.toFixed(1)} L
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
  grainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  grainInfo: {
    flex: 1,
  },
  grainName: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  grainMeta: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  grainInputGroup: {
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
    width: 70,
    textAlign: "center",
    fontSize: typography.size.label,
  },
  unitText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
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
    fontSize: 32,
    color: colors.brand.primary,
    fontWeight: typography.weight.bold,
  },
  bigResultNote: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
});

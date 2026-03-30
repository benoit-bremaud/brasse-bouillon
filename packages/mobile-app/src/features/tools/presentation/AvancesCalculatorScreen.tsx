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

import {
  calculateAltitudeAdjustedIbuTarget,
  calculateAltitudeIbuCorrectionFactor,
  calculateAverageDiastaticPowerWkPerKg,
  calculateKolbachIndexPercent,
  calculateTotalDiastaticPowerWk,
  estimateAtmosphericPressureHpa,
  estimateBoilingPointAtAltitudeC,
  estimateFanFromKolbachAndOg,
  estimateMashViscosityCp,
  type DiastaticMaltInput,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";

type TabName = "enzymes" | "mout" | "altitude";

type MaltLine = {
  id: string;
  name: string;
  weightKg: number;
  diastaticPowerWk: number;
};

function getConversionReadinessLabel(averagePowerWkPerKg: number) {
  if (averagePowerWkPerKg >= 220) {
    return "Très confortable";
  }

  if (averagePowerWkPerKg >= 160) {
    return "Correct";
  }

  return "Limite";
}

export function AvancesCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("enzymes");
  const [malts, setMalts] = useState<MaltLine[]>([
    { id: "1", name: "Pilsner", weightKg: 4, diastaticPowerWk: 250 },
    { id: "2", name: "Flocons d'avoine", weightKg: 1, diastaticPowerWk: 0 },
  ]);

  const [solubleNitrogenPercent, setSolubleNitrogenPercent] = useState(0.72);
  const [totalNitrogenPercent, setTotalNitrogenPercent] = useState(1.8);
  const [betaGlucansMgPerL, setBetaGlucansMgPerL] = useState(200);
  const [og, setOg] = useState(1.06);

  const [altitudeMeters, setAltitudeMeters] = useState(1500);
  const [targetIbuSeaLevel, setTargetIbuSeaLevel] = useState(40);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleMaltWeightChange = useCallback((id: string, value: string) => {
    const parsed = parseFloat(value) || 0;
    setMalts((prev) =>
      prev.map((malt) =>
        malt.id === id ? { ...malt, weightKg: parsed } : malt,
      ),
    );
  }, []);

  const handleMaltDiastaticPowerChange = useCallback(
    (id: string, value: string) => {
      const parsed = parseFloat(value) || 0;
      setMalts((prev) =>
        prev.map((malt) =>
          malt.id === id ? { ...malt, diastaticPowerWk: parsed } : malt,
        ),
      );
    },
    [],
  );

  const diastaticInputs = useMemo<DiastaticMaltInput[]>(
    () =>
      malts.map((malt) => ({
        weightKg: malt.weightKg,
        diastaticPowerWk: malt.diastaticPowerWk,
      })),
    [malts],
  );

  const totalDiastaticPowerWk = calculateTotalDiastaticPowerWk(diastaticInputs);
  const averageDiastaticPowerWkPerKg =
    calculateAverageDiastaticPowerWkPerKg(diastaticInputs);
  const conversionReadiness = getConversionReadinessLabel(
    averageDiastaticPowerWkPerKg,
  );

  const kolbachIndex = calculateKolbachIndexPercent(
    solubleNitrogenPercent,
    totalNitrogenPercent,
  );
  const mashViscosityCp = estimateMashViscosityCp(betaGlucansMgPerL);
  const fanEstimate = estimateFanFromKolbachAndOg(kolbachIndex, og);

  const boilingPointC = estimateBoilingPointAtAltitudeC(altitudeMeters);
  const atmosphericPressureHpa = estimateAtmosphericPressureHpa(altitudeMeters);
  const ibuCorrectionFactor =
    calculateAltitudeIbuCorrectionFactor(altitudeMeters);
  const adjustedIbuTarget = calculateAltitudeAdjustedIbuTarget(
    targetIbuSeaLevel,
    altitudeMeters,
  );

  return (
    <Screen>
      <ListHeader
        title="🧪 Calculs avancés"
        subtitle="Enzymes · Diagnostic moût · Altitude"
      />

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "enzymes" && styles.tabActive]}
          onPress={() => handleTabChange("enzymes")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "enzymes" && styles.tabTextActive,
            ]}
          >
            Enzymes
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "mout" && styles.tabActive]}
          onPress={() => handleTabChange("mout")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "mout" && styles.tabTextActive,
            ]}
          >
            Moût
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "altitude" && styles.tabActive]}
          onPress={() => handleTabChange("altitude")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "altitude" && styles.tabTextActive,
            ]}
          >
            Altitude
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "enzymes" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Puissance diastasique</Text>

              {malts.map((malt) => (
                <View key={malt.id} style={styles.maltRow}>
                  <View style={styles.maltInfo}>
                    <Text style={styles.maltName}>{malt.name}</Text>
                    <Text style={styles.maltMeta}>
                      DP: {malt.diastaticPowerWk} WK
                    </Text>
                  </View>

                  <View style={styles.maltControls}>
                    <TextInput
                      testID={`adv-malt-${malt.id}-weight-input`}
                      style={styles.smallInput}
                      value={malt.weightKg.toString()}
                      onChangeText={(text) =>
                        handleMaltWeightChange(malt.id, text)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.unitText}>kg</Text>

                    <TextInput
                      testID={`adv-malt-${malt.id}-wk-input`}
                      style={styles.smallInput}
                      value={malt.diastaticPowerWk.toString()}
                      onChangeText={(text) =>
                        handleMaltDiastaticPowerChange(malt.id, text)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                    />
                    <Text style={styles.unitText}>WK</Text>
                  </View>
                </View>
              ))}
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Résultats enzymatiques</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Puissance totale</Text>
                <Text style={styles.resultValue}>
                  {totalDiastaticPowerWk.toFixed(0)} WK
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Moyenne pondérée</Text>
                <Text style={styles.resultValue}>
                  {averageDiastaticPowerWkPerKg.toFixed(1)} WK/kg
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Capacité de conversion</Text>
                <Text style={styles.resultValue}>{conversionReadiness}</Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "mout" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Indices analytiques</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Azote soluble (%)</Text>
                <TextInput
                  testID="adv-soluble-nitrogen-input"
                  style={styles.textInput}
                  value={solubleNitrogenPercent.toString()}
                  onChangeText={(text) =>
                    setSolubleNitrogenPercent(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="0.72"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Azote total (%)</Text>
                <TextInput
                  testID="adv-total-nitrogen-input"
                  style={styles.textInput}
                  value={totalNitrogenPercent.toString()}
                  onChangeText={(text) =>
                    setTotalNitrogenPercent(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="1.8"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Beta-glucanes (mg/L)</Text>
                <TextInput
                  testID="adv-beta-glucans-input"
                  style={styles.textInput}
                  value={betaGlucansMgPerL.toString()}
                  onChangeText={(text) =>
                    setBetaGlucansMgPerL(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="200"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>OG</Text>
                <TextInput
                  testID="adv-og-input"
                  style={styles.textInput}
                  value={og.toString()}
                  onChangeText={(text) => setOg(parseFloat(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1.060"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Diagnostic moût</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Indice de Kolbach</Text>
                <Text style={styles.resultValue}>
                  {kolbachIndex.toFixed(1)}%
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Viscosité estimée</Text>
                <Text style={styles.resultValue}>
                  {mashViscosityCp.toFixed(2)} cP
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>FAN estimé</Text>
                <Text style={styles.resultValue}>
                  {fanEstimate.toFixed(1)} mg/L
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "altitude" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Contexte de brassage</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Altitude (m)</Text>
                <TextInput
                  testID="adv-altitude-input"
                  style={styles.textInput}
                  value={altitudeMeters.toString()}
                  onChangeText={(text) =>
                    setAltitudeMeters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="1500"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>IBU cible niveau mer</Text>
                <TextInput
                  testID="adv-ibu-target-input"
                  style={styles.textInput}
                  value={targetIbuSeaLevel.toString()}
                  onChangeText={(text) =>
                    setTargetIbuSeaLevel(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="40"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Corrections altitude</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>
                  Point d'ébullition estimé
                </Text>
                <Text style={styles.resultValue}>
                  {boilingPointC.toFixed(1)}°C
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Pression atmosphérique</Text>
                <Text style={styles.resultValue}>
                  {atmosphericPressureHpa.toFixed(1)} hPa
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Facteur IBU</Text>
                <Text style={styles.resultValue}>
                  {ibuCorrectionFactor.toFixed(3)}x
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>IBU cible ajusté</Text>
                <Text style={styles.resultValue}>
                  {adjustedIbuTarget.toFixed(1)} IBU
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
  maltRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  maltInfo: {
    flex: 1,
  },
  maltName: {
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  maltMeta: {
    marginTop: spacing.xxs,
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  maltControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    width: 72,
    textAlign: "center",
    fontSize: typography.size.label,
  },
  unitText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  inputRow: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    marginBottom: spacing.xs,
    fontSize: typography.size.label,
    color: colors.neutral.textPrimary,
    fontWeight: typography.weight.medium,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: typography.size.body,
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
});

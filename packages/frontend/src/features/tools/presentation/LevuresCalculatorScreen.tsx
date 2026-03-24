import * as Haptics from "expo-haptics";

import {
  ALE_PITCH_RATE_M_PER_ML_PLATO,
  LAGER_PITCH_RATE_M_PER_ML_PLATO,
  calculateAbv,
  calculateDryYeastPacketsNeeded,
  calculateEstimatedFgFromAttenuation,
  calculateRequiredYeastCellsBillions,
  sgToPlato,
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

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";

type TabName = "pitch" | "attenuation" | "packs";
type FermentationType = "ale" | "lager";

export function LevuresCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("pitch");
  const [fermentationType, setFermentationType] =
    useState<FermentationType>("ale");

  const [og, setOg] = useState(1.065);
  const [volumeLiters, setVolumeLiters] = useState(20);
  const [attenuationPercent, setAttenuationPercent] = useState(80);
  const [cellsPerPacketBillions, setCellsPerPacketBillions] = useState(200);
  const [viabilityPercent, setViabilityPercent] = useState(95);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleFermentationTypeChange = useCallback((type: FermentationType) => {
    setFermentationType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const pitchRate =
    fermentationType === "ale"
      ? ALE_PITCH_RATE_M_PER_ML_PLATO
      : LAGER_PITCH_RATE_M_PER_ML_PLATO;

  const ogPlato = sgToPlato(og);
  const requiredCellsBillions = calculateRequiredYeastCellsBillions(
    og,
    volumeLiters,
    pitchRate,
  );
  const estimatedFg = calculateEstimatedFgFromAttenuation(
    og,
    attenuationPercent,
  );
  const estimatedAbv = calculateAbv(og, estimatedFg);
  const requiredPackets = calculateDryYeastPacketsNeeded(
    requiredCellsBillions,
    cellsPerPacketBillions,
    viabilityPercent,
  );

  return (
    <Screen>
      <ListHeader
        title="🧫 Calculs Levures"
        subtitle="Pitch rate · Atténuation · Sachets"
      />

      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "pitch" && styles.tabActive]}
          onPress={() => handleTabChange("pitch")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pitch" && styles.tabTextActive,
            ]}
          >
            Pitch
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "attenuation" && styles.tabActive]}
          onPress={() => handleTabChange("attenuation")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "attenuation" && styles.tabTextActive,
            ]}
          >
            Atténuation
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === "packs" && styles.tabActive]}
          onPress={() => handleTabChange("packs")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "packs" && styles.tabTextActive,
            ]}
          >
            Sachets
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "pitch" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres brassin</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>OG</Text>
                <TextInput
                  testID="yeast-og-input"
                  style={styles.textInput}
                  value={og.toString()}
                  onChangeText={(text) => setOg(parseFloat(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1.065"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Volume (L)</Text>
                <TextInput
                  testID="yeast-volume-input"
                  style={styles.textInput}
                  value={volumeLiters.toString()}
                  onChangeText={(text) =>
                    setVolumeLiters(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>

              <View style={styles.toggleRow}>
                <Pressable
                  style={[
                    styles.toggle,
                    fermentationType === "ale" && styles.toggleActive,
                  ]}
                  onPress={() => handleFermentationTypeChange("ale")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      fermentationType === "ale" && styles.toggleTextActive,
                    ]}
                  >
                    Ale
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.toggle,
                    fermentationType === "lager" && styles.toggleActive,
                  ]}
                  onPress={() => handleFermentationTypeChange("lager")}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      fermentationType === "lager" && styles.toggleTextActive,
                    ]}
                  >
                    Lager
                  </Text>
                </Pressable>
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Besoin cellulaire</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>°Plato estimé</Text>
                <Text style={styles.resultValue}>{ogPlato.toFixed(2)}°P</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Pitch rate appliqué</Text>
                <Text style={styles.resultValue}>
                  {pitchRate.toFixed(2)} M/mL/°P
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Cellules requises</Text>
                <Text style={styles.resultValue}>
                  {requiredCellsBillions.toFixed(0)} Md
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "attenuation" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Prévision fermentation</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>OG</Text>
                <TextInput
                  style={styles.textInput}
                  value={og.toString()}
                  onChangeText={(text) => setOg(parseFloat(text) || 1)}
                  keyboardType="numeric"
                  placeholder="1.065"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Atténuation (%)</Text>
                <TextInput
                  testID="attenuation-input"
                  style={styles.textInput}
                  value={attenuationPercent.toString()}
                  onChangeText={(text) =>
                    setAttenuationPercent(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="80"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Résultats prévus</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>FG estimée</Text>
                <Text style={styles.resultValue}>{estimatedFg.toFixed(3)}</Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>ABV estimé</Text>
                <Text style={styles.resultValue}>
                  {estimatedAbv.toFixed(2)}%
                </Text>
              </View>
            </Card>
          </>
        )}

        {activeTab === "packs" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Dimensionnement sachets</Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Cellules/sachet (Md)</Text>
                <TextInput
                  testID="pack-cells-input"
                  style={styles.textInput}
                  value={cellsPerPacketBillions.toString()}
                  onChangeText={(text) =>
                    setCellsPerPacketBillions(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="200"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Viabilité (%)</Text>
                <TextInput
                  testID="pack-viability-input"
                  style={styles.textInput}
                  value={viabilityPercent.toString()}
                  onChangeText={(text) =>
                    setViabilityPercent(parseFloat(text) || 0)
                  }
                  keyboardType="numeric"
                  placeholder="95"
                />
              </View>
            </Card>

            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Nombre de sachets</Text>

              <View style={styles.bigResultContainer}>
                <Text style={styles.bigResultValue}>
                  {requiredPackets.toFixed(2)}
                </Text>
                <Text style={styles.bigResultNote}>sachets recommandés</Text>
              </View>

              <Text style={styles.noteText}>
                Arrondir au demi-sachet supérieur pour sécuriser le pitch.
              </Text>
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
    backgroundColor: colors.brand.secondary,
    borderColor: colors.brand.secondary,
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
    marginBottom: spacing.xs,
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
  noteText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
});

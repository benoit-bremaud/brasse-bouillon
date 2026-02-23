import {
  calculateIbuTinseth,
  calculateRequiredHopGramsForTargetIbu,
  calculateTinsethUtilization,
  type HopAddition,
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
import {
  getHopDefaultAa,
  hopCatalog,
} from "@/features/tools/data/catalogs/houblons";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";

type TabName = "rapide" | "inverse" | "buGu";

type RecipeHopAddition = {
  id: string;
  hopIndex: number;
  weightGrams: number;
  boilTimeMinutes: number;
};

type BuGuRating = {
  label: string;
  description: string;
  color: string;
};

const INITIAL_VOLUME_LITERS = 20;
const INITIAL_BOIL_GRAVITY = 1.05;
const INITIAL_TARGET_IBU = 30;
const MAX_BOIL_TIME = 90;

function getBuGuRating(ratio: number): BuGuRating {
  if (ratio < 0.3) {
    return {
      label: "Très doux",
      description: "Bière très peu amère, maltée, ronde",
      color: colors.semantic.success,
    };
  }
  if (ratio < 0.5) {
    return {
      label: "Doux",
      description: "Équilibre légèrement maltée (Lager, Stout)",
      color: colors.semantic.success,
    };
  }
  if (ratio < 0.7) {
    return {
      label: "Équilibré",
      description: "Bon équilibre malt/amertume (Pale Ale, Amber)",
      color: colors.semantic.info,
    };
  }
  if (ratio < 1.0) {
    return {
      label: "Amer",
      description: "Amertume perceptible (IPA, APA)",
      color: colors.brand.secondary,
    };
  }
  return {
    label: "Très amer",
    description: "Amertume très prononcée (DIPA, Imperial IPA)",
    color: colors.semantic.error,
  };
}

export function HoublonsCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("rapide");

  // Rapide tab state
  const [hopAdditions, setHopAdditions] = useState<RecipeHopAddition[]>([
    { id: "1", hopIndex: 2, weightGrams: 25, boilTimeMinutes: 60 }, // Cascade 60 min
    { id: "2", hopIndex: 5, weightGrams: 15, boilTimeMinutes: 10 }, // Citra 10 min
  ]);
  const [volumeLiters, setVolumeLiters] = useState(INITIAL_VOLUME_LITERS);
  const [boilGravity, setBoilGravity] = useState(INITIAL_BOIL_GRAVITY);

  // Inverse tab state
  const [targetIbu, setTargetIbu] = useState(INITIAL_TARGET_IBU);
  const [inverseVolume, setInverseVolume] = useState(INITIAL_VOLUME_LITERS);
  const [inverseGravity, setInverseGravity] = useState(INITIAL_BOIL_GRAVITY);
  const [inverseHopIndex, setInverseHopIndex] = useState(2); // Cascade
  const [inverseBoilTime, setInverseBoilTime] = useState(60);

  // BU:GU tab state
  const [buGuIbu, setBuGuIbu] = useState(35);
  const [buGuOg, setBuGuOg] = useState(1.055);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleAddHop = useCallback(() => {
    const newHop: RecipeHopAddition = {
      id: Date.now().toString(),
      hopIndex: 2, // Cascade par défaut
      weightGrams: 20,
      boilTimeMinutes: 60,
    };
    setHopAdditions((prev) => [...prev, newHop]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleRemoveHop = useCallback((id: string) => {
    setHopAdditions((prev) => prev.filter((h) => h.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleHopWeightChange = useCallback((id: string, weight: number) => {
    setHopAdditions((prev) =>
      prev.map((h) => (h.id === id ? { ...h, weightGrams: weight } : h)),
    );
  }, []);

  const handleHopBoilTimeChange = useCallback((id: string, minutes: number) => {
    setHopAdditions((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, boilTimeMinutes: Math.round(minutes) } : h,
      ),
    );
  }, []);

  const handleHopIndexChange = useCallback((id: string, delta: 1 | -1) => {
    setHopAdditions((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const next = h.hopIndex + delta;
        const newIndex =
          next < 0
            ? hopCatalog.length - 1
            : next >= hopCatalog.length
              ? 0
              : next;
        return { ...h, hopIndex: newIndex };
      }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleInverseHopPrev = useCallback(() => {
    setInverseHopIndex((prev) =>
      prev === 0 ? hopCatalog.length - 1 : prev - 1,
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleInverseHopNext = useCallback(() => {
    setInverseHopIndex((prev) =>
      prev === hopCatalog.length - 1 ? 0 : prev + 1,
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Rapide calculations
  const tinsethAdditions: HopAddition[] = hopAdditions.map((ha) => ({
    weightGrams: ha.weightGrams,
    alphaAcidPercent: getHopDefaultAa(hopCatalog[ha.hopIndex]),
    boilTimeMinutes: ha.boilTimeMinutes,
  }));
  const calculatedIbu = calculateIbuTinseth(
    volumeLiters,
    boilGravity,
    tinsethAdditions,
  );

  // Inverse calculations
  const inverseHop = hopCatalog[inverseHopIndex];
  const inverseAlpha = getHopDefaultAa(inverseHop);
  const requiredGrams = calculateRequiredHopGramsForTargetIbu(
    targetIbu,
    inverseVolume,
    inverseGravity,
    inverseAlpha,
    inverseBoilTime,
  );
  const inverseUtilization = calculateTinsethUtilization(
    inverseBoilTime,
    inverseGravity,
  );

  // BU:GU calculations
  const ogPoints = Math.max(0, (buGuOg - 1) * 1000);
  const buGuRatio = ogPoints > 0 ? buGuIbu / ogPoints : 0;
  const buGuRating = getBuGuRating(buGuRatio);

  return (
    <Screen>
      <ListHeader
        title="🌿 Calculs Houblons"
        subtitle="IBU · Tinseth · BU:GU"
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
          style={[styles.tab, activeTab === "buGu" && styles.tabActive]}
          onPress={() => handleTabChange("buGu")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "buGu" && styles.tabTextActive,
            ]}
          >
            BU:GU
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ─── Onglet Rapide ────────────────────────────────────────── */}
        {activeTab === "rapide" && (
          <>
            {/* Paramètres de brassage */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres de brassage</Text>

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

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>
                  Densité ébullition : {boilGravity.toFixed(3)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1.03}
                  maximumValue={1.09}
                  value={boilGravity}
                  onValueChange={(val) =>
                    setBoilGravity(Math.round(val * 1000) / 1000)
                  }
                  step={0.001}
                  minimumTrackTintColor={colors.brand.primary}
                  maximumTrackTintColor={colors.neutral.border}
                  thumbTintColor={colors.brand.primary}
                />
              </View>
            </Card>

            {/* Ajouts de houblons */}
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Ajouts de houblons</Text>
                <Pressable style={styles.addButton} onPress={handleAddHop}>
                  <Text style={styles.addButtonText}>+ Ajouter</Text>
                </Pressable>
              </View>

              {hopAdditions.map((hopAddition) => {
                const hop = hopCatalog[hopAddition.hopIndex];
                const defaultAa = getHopDefaultAa(hop);
                return (
                  <View key={hopAddition.id} style={styles.hopRow}>
                    {/* Sélecteur variété */}
                    <View style={styles.hopSelectorRow}>
                      <Pressable
                        style={styles.hopArrow}
                        onPress={() => handleHopIndexChange(hopAddition.id, -1)}
                      >
                        <Text style={styles.hopArrowText}>‹</Text>
                      </Pressable>

                      <View style={styles.hopInfo}>
                        <Text style={styles.hopName}>{hop.name}</Text>
                        <Text style={styles.hopSpecs}>
                          AA : {defaultAa}% · {hop.origin}
                        </Text>
                      </View>

                      <Pressable
                        style={styles.hopArrow}
                        onPress={() => handleHopIndexChange(hopAddition.id, 1)}
                      >
                        <Text style={styles.hopArrowText}>›</Text>
                      </Pressable>
                    </View>

                    {/* Poids + suppression */}
                    <View style={styles.hopControls}>
                      <TextInput
                        style={styles.weightInput}
                        value={hopAddition.weightGrams.toString()}
                        onChangeText={(text) => {
                          const weight = parseFloat(text) || 0;
                          handleHopWeightChange(hopAddition.id, weight);
                        }}
                        keyboardType="numeric"
                        placeholder="0"
                      />
                      <Text style={styles.weightUnit}>g</Text>

                      {hopAdditions.length > 1 && (
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => handleRemoveHop(hopAddition.id)}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </Pressable>
                      )}
                    </View>

                    {/* Temps d'ébullition */}
                    <View style={styles.boilTimeRow}>
                      <Text style={styles.boilTimeLabel}>
                        Ébullition : {hopAddition.boilTimeMinutes} min
                      </Text>
                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={MAX_BOIL_TIME}
                        value={hopAddition.boilTimeMinutes}
                        onValueChange={(val) =>
                          handleHopBoilTimeChange(hopAddition.id, val)
                        }
                        step={5}
                        minimumTrackTintColor={colors.brand.secondary}
                        maximumTrackTintColor={colors.neutral.border}
                        thumbTintColor={colors.brand.secondary}
                      />
                    </View>
                  </View>
                );
              })}
            </Card>

            {/* Résultat IBU */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>IBU calculés (Tinseth)</Text>
              <View style={styles.ibuDisplay}>
                <Text style={styles.ibuValue}>{calculatedIbu.toFixed(1)}</Text>
                <Text style={styles.ibuUnit}>IBU</Text>
              </View>
            </Card>
          </>
        )}

        {/* ─── Onglet Inversé ───────────────────────────────────────── */}
        {activeTab === "inverse" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Paramètres cibles</Text>
              <Text style={styles.cardSubtitle}>
                Quelle quantité de houblon pour atteindre un IBU cible ?
              </Text>

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>IBU cible : {targetIbu}</Text>
                <Slider
                  testID="ibu-cible"
                  style={styles.slider}
                  minimumValue={5}
                  maximumValue={120}
                  value={targetIbu}
                  onValueChange={(val) => setTargetIbu(Math.round(val))}
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

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Densité ébullition</Text>
                <TextInput
                  style={styles.textInput}
                  value={inverseGravity.toString()}
                  onChangeText={(text) =>
                    setInverseGravity(parseFloat(text) || 1.05)
                  }
                  keyboardType="numeric"
                  placeholder="1.050"
                />
              </View>

              <View style={styles.paramRow}>
                <Text style={styles.paramLabel}>
                  Temps d'ébullition : {inverseBoilTime} min
                </Text>
                <Slider
                  testID="boil-time-inverse"
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={MAX_BOIL_TIME}
                  value={inverseBoilTime}
                  onValueChange={(val) => setInverseBoilTime(Math.round(val))}
                  step={5}
                  minimumTrackTintColor={colors.brand.primary}
                  maximumTrackTintColor={colors.neutral.border}
                  thumbTintColor={colors.brand.primary}
                />
              </View>
            </Card>

            {/* Sélecteur de variété */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Variété de houblon</Text>
              <View style={styles.hopSelectorStandalone}>
                <Pressable
                  style={styles.hopSelectorArrow}
                  onPress={handleInverseHopPrev}
                >
                  <Text style={styles.hopSelectorArrowText}>‹</Text>
                </Pressable>

                <View style={styles.hopSelectorInfo}>
                  <Text style={styles.hopSelectorName}>{inverseHop.name}</Text>
                  <Text style={styles.hopSelectorSpecs}>
                    AA moyen : {inverseAlpha}% · {inverseHop.origin}
                  </Text>
                  <Text style={styles.hopSelectorUse}>
                    Utilisation Tinseth :{" "}
                    {(inverseUtilization * 100).toFixed(1)}%
                  </Text>
                </View>

                <Pressable
                  style={styles.hopSelectorArrow}
                  onPress={handleInverseHopNext}
                >
                  <Text style={styles.hopSelectorArrowText}>›</Text>
                </Pressable>
              </View>
            </Card>

            {/* Résultat inversé */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Quantité nécessaire</Text>
              <View style={styles.inverseResult}>
                <Text style={styles.inverseResultValue}>
                  {requiredGrams.toFixed(1)} g
                </Text>
                <Text style={styles.inverseResultLabel}>
                  de {inverseHop.name}
                </Text>
                <Text style={styles.inverseResultNote}>
                  pour atteindre {targetIbu} IBU sur {inverseVolume} L
                </Text>
              </View>
            </Card>
          </>
        )}

        {/* ─── Onglet BU:GU ─────────────────────────────────────────── */}
        {activeTab === "buGu" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Ratio BU:GU</Text>
              <Text style={styles.cardSubtitle}>
                Bitterness Units / Gravity Units — mesure l'équilibre
                amertume/maltosité
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>IBU de la recette</Text>
                <TextInput
                  testID="buGu-ibu-input"
                  style={styles.textInput}
                  value={buGuIbu.toString()}
                  onChangeText={(text) => setBuGuIbu(parseFloat(text) || 0)}
                  keyboardType="numeric"
                  placeholder="35"
                />
              </View>

              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>OG cible</Text>
                <TextInput
                  testID="buGu-og-input"
                  style={styles.textInput}
                  value={buGuOg.toString()}
                  onChangeText={(text) => setBuGuOg(parseFloat(text) || 1.0)}
                  keyboardType="numeric"
                  placeholder="1.055"
                />
              </View>
            </Card>

            {/* Résultat BU:GU */}
            <Card style={styles.resultCard}>
              <Text style={styles.cardTitle}>Résultat BU:GU</Text>

              <View style={styles.buGuDisplay}>
                <Text style={styles.buGuValue}>{buGuRatio.toFixed(2)}</Text>
                <Text style={styles.buGuUnit}>BU:GU</Text>
              </View>

              <View
                style={[
                  styles.buGuRating,
                  { backgroundColor: buGuRating.color },
                ]}
              >
                <Text style={styles.buGuRatingLabel}>{buGuRating.label}</Text>
                <Text style={styles.buGuRatingDescription}>
                  {buGuRating.description}
                </Text>
              </View>
            </Card>

            {/* Table de référence */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Références par style</Text>
              {[
                {
                  style: "Stout / Porter",
                  range: "0.4 – 0.6",
                  note: "Malteux",
                },
                {
                  style: "Lager / Pilsner",
                  range: "0.5 – 0.7",
                  note: "Équilibré",
                },
                {
                  style: "Pale Ale / Amber",
                  range: "0.6 – 0.8",
                  note: "Équilibré",
                },
                { style: "IPA", range: "0.8 – 1.2", note: "Amer" },
                { style: "Double IPA", range: "1.0 – 1.5+", note: "Très amer" },
              ].map((row) => (
                <View key={row.style} style={styles.refRow}>
                  <View style={styles.refStyle}>
                    <Text style={styles.refStyleText}>{row.style}</Text>
                    <Text style={styles.refNoteText}>{row.note}</Text>
                  </View>
                  <Text style={styles.refRangeText}>{row.range}</Text>
                </View>
              ))}
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
  hopRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  hopSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  hopArrow: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.background,
    borderRadius: radius.sm,
  },
  hopArrowText: {
    fontSize: 18,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  hopInfo: {
    flex: 1,
    alignItems: "center",
  },
  hopName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  hopSpecs: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  hopControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xs,
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
  boilTimeRow: {
    marginTop: spacing.xxs,
  },
  boilTimeLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginBottom: spacing.xxs,
  },
  resultCard: {
    backgroundColor: colors.semantic.success,
    marginBottom: spacing.sm,
  },
  ibuDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  ibuValue: {
    fontSize: 48,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
    lineHeight: 52,
  },
  ibuUnit: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
    paddingBottom: spacing.xs,
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
  hopSelectorStandalone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  hopSelectorArrow: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand.background,
    borderRadius: radius.sm,
  },
  hopSelectorArrowText: {
    fontSize: 24,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  hopSelectorInfo: {
    flex: 1,
    alignItems: "center",
  },
  hopSelectorName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
    textAlign: "center",
  },
  hopSelectorSpecs: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  hopSelectorUse: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    marginTop: spacing.xxs,
    textAlign: "center",
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
  buGuDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  buGuValue: {
    fontSize: 48,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
    lineHeight: 52,
  },
  buGuUnit: {
    fontSize: typography.size.h2,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textSecondary,
    paddingBottom: spacing.xs,
  },
  buGuRating: {
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  buGuRatingLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  buGuRatingDescription: {
    fontSize: typography.size.caption,
    color: colors.neutral.white,
    marginTop: spacing.xxs,
    opacity: 0.9,
    textAlign: "center",
  },
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  refStyle: {
    flex: 1,
  },
  refStyleText: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  refNoteText: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  refRangeText: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.brand.secondary,
  },
});

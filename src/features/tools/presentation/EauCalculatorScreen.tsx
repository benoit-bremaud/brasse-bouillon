import * as Haptics from "expo-haptics";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  calculateResidualAlkalinity,
  calculateSulfateChlorideRatio,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { useCallback, useState } from "react";

import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { Screen } from "@/core/ui/Screen";

type TabName = "profil" | "style" | "sels";

type WaterRating = {
  label: string;
  description: string;
  color: string;
};

type IonRange = { min: number; max: number };

type StylePreset = {
  name: string;
  description: string;
  ca: IonRange;
  mg: IonRange;
  na: IonRange;
  so4: IonRange;
  cl: IonRange;
  hco3: IonRange;
};

type SaltReference = {
  name: string;
  formula: string;
  ca?: number;
  mg?: number;
  na?: number;
  so4?: number;
  cl?: number;
  hco3?: number;
  note: string;
};

const STYLE_PRESETS: StylePreset[] = [
  {
    name: "Pilsner / Lager",
    description: "Eau très douce, bicarbonates très faibles",
    ca: { min: 30, max: 80 },
    mg: { min: 5, max: 20 },
    na: { min: 0, max: 50 },
    so4: { min: 20, max: 80 },
    cl: { min: 20, max: 80 },
    hco3: { min: 0, max: 50 },
  },
  {
    name: "Pale Ale / Blonde",
    description: "Profil équilibré, légèrement houblonné",
    ca: { min: 50, max: 150 },
    mg: { min: 5, max: 25 },
    na: { min: 0, max: 75 },
    so4: { min: 50, max: 150 },
    cl: { min: 30, max: 100 },
    hco3: { min: 0, max: 100 },
  },
  {
    name: "IPA",
    description: "Profil sec, SO₄ élevé, houblon mis en avant",
    ca: { min: 75, max: 150 },
    mg: { min: 5, max: 25 },
    na: { min: 0, max: 50 },
    so4: { min: 100, max: 300 },
    cl: { min: 50, max: 100 },
    hco3: { min: 0, max: 50 },
  },
  {
    name: "Amber / Maltée",
    description: "Cl élevé, profil rond et malté",
    ca: { min: 50, max: 150 },
    mg: { min: 5, max: 20 },
    na: { min: 0, max: 75 },
    so4: { min: 30, max: 100 },
    cl: { min: 50, max: 150 },
    hco3: { min: 50, max: 150 },
  },
  {
    name: "Stout / Porter",
    description: "Bicarbonates élevés, profil foncé et corsé",
    ca: { min: 50, max: 150 },
    mg: { min: 5, max: 25 },
    na: { min: 0, max: 75 },
    so4: { min: 30, max: 100 },
    cl: { min: 50, max: 150 },
    hco3: { min: 100, max: 250 },
  },
];

const SALT_REFERENCES: SaltReference[] = [
  {
    name: "Gypse",
    formula: "CaSO₄·2H₂O",
    ca: 23.3,
    so4: 55.8,
    note: "Augmente sécheresse et perception de l'amertume",
  },
  {
    name: "Chlorure de calcium",
    formula: "CaCl₂ (anhydre)",
    ca: 36.1,
    cl: 63.9,
    note: "Renforce rondeur et expression maltée",
  },
  {
    name: "Sel d'Epsom",
    formula: "MgSO₄·7H₂O",
    mg: 9.9,
    so4: 39.3,
    note: "Nutriment levure, léger goût amer en excès",
  },
  {
    name: "Sel de table",
    formula: "NaCl",
    na: 39.3,
    cl: 60.7,
    note: "Rondeur à petite dose — limiter Na à 75 ppm",
  },
  {
    name: "Bicarbonate de soude",
    formula: "NaHCO₃",
    na: 27.4,
    hco3: 72.6,
    note: "Remonte le pH, utile pour bières foncées",
  },
  {
    name: "Craie",
    formula: "CaCO₃",
    ca: 20.0,
    hco3: 60.0,
    note: "Peu soluble — ajouter directement dans le mash",
  },
];

function getRaRating(ra: number): WaterRating {
  if (ra < -25) {
    return {
      label: "Très douce",
      description: "Idéale pour Pilsner / Lager",
      color: colors.semantic.info,
    };
  }
  if (ra < 25) {
    return {
      label: "Douce",
      description: "Idéale pour styles pâles",
      color: colors.semantic.success,
    };
  }
  if (ra < 75) {
    return {
      label: "Modérée",
      description: "Bières ambrées / équilibrées",
      color: colors.semantic.warning,
    };
  }
  if (ra < 150) {
    return {
      label: "Élevée",
      description: "Bières foncées (Stout, Porter)",
      color: colors.brand.secondary,
    };
  }
  return {
    label: "Très élevée",
    description: "À réduire par dilution/osmose",
    color: colors.semantic.error,
  };
}

function getRatioRating(ratio: number, hasNoChloride: boolean): WaterRating {
  if (hasNoChloride) {
    return {
      label: "Indéfini",
      description: "Chlorures nuls",
      color: colors.neutral.muted,
    };
  }
  if (ratio < 0.5) {
    return {
      label: "Très rond",
      description: "Profil très malté (Stout, Porter)",
      color: colors.brand.primary,
    };
  }
  if (ratio < 1.5) {
    return {
      label: "Rond / Équilibré",
      description: "Profil malté (Amber, Lager)",
      color: colors.semantic.success,
    };
  }
  if (ratio < 3) {
    return {
      label: "Équilibré",
      description: "Profil intermédiaire (Pale Ale)",
      color: colors.semantic.warning,
    };
  }
  if (ratio < 8) {
    return {
      label: "Sec / Houblonné",
      description: "Profil IPA (sec, amer)",
      color: colors.brand.secondary,
    };
  }
  return {
    label: "Très sec",
    description: "Très hop-forward (DIPA, Bitter)",
    color: colors.semantic.error,
  };
}

function isInRange(value: number, range: IonRange): boolean {
  return value >= range.min && value <= range.max;
}

function parseIon(text: string): number {
  const parsed = parseFloat(text);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function EauCalculatorScreen() {
  const [activeTab, setActiveTab] = useState<TabName>("profil");

  // Ion values (in ppm)
  const [caText, setCaText] = useState("75");
  const [mgText, setMgText] = useState("10");
  const [naText, setNaText] = useState("20");
  const [so4Text, setSo4Text] = useState("150");
  const [clText, setClText] = useState("75");
  const [hco3Text, setHco3Text] = useState("50");

  // Style tab
  const [styleIndex, setStyleIndex] = useState(0);

  const handleTabChange = useCallback((tab: TabName) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleStyleChange = useCallback((index: number) => {
    setStyleIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Live calculations
  const ca = parseIon(caText);
  const mg = parseIon(mgText);
  const na = parseIon(naText);
  const so4 = parseIon(so4Text);
  const cl = parseIon(clText);
  const hco3 = parseIon(hco3Text);
  const hasNoChloride = cl === 0;

  const ra = calculateResidualAlkalinity(hco3, ca, mg);
  const ratio = calculateSulfateChlorideRatio(so4, cl);
  const raRating = getRaRating(ra);
  const ratioRating = getRatioRating(ratio, hasNoChloride);

  const currentPreset = STYLE_PRESETS[styleIndex];
  const ionRows = [
    {
      label: "Calcium (Ca²⁺)",
      unit: "ppm",
      value: ca,
      range: currentPreset.ca,
    },
    {
      label: "Magnésium (Mg²⁺)",
      unit: "ppm",
      value: mg,
      range: currentPreset.mg,
    },
    { label: "Sodium (Na⁺)", unit: "ppm", value: na, range: currentPreset.na },
    {
      label: "Sulfates (SO₄²⁻)",
      unit: "ppm",
      value: so4,
      range: currentPreset.so4,
    },
    {
      label: "Chlorures (Cl⁻)",
      unit: "ppm",
      value: cl,
      range: currentPreset.cl,
    },
    {
      label: "Bicarbonates (HCO₃⁻)",
      unit: "ppm",
      value: hco3,
      range: currentPreset.hco3,
    },
  ];

  return (
    <Screen>
      <ListHeader
        title="💧 Calculs Eau de brassage"
        subtitle="Profil ionique et alkalinité résiduelle"
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tab, activeTab === "profil" && styles.tabActive]}
          onPress={() => handleTabChange("profil")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "profil" && styles.tabTextActive,
            ]}
          >
            Profil
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "style" && styles.tabActive]}
          onPress={() => handleTabChange("style")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "style" && styles.tabTextActive,
            ]}
          >
            Style
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "sels" && styles.tabActive]}
          onPress={() => handleTabChange("sels")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "sels" && styles.tabTextActive,
            ]}
          >
            Sels
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── TAB PROFIL ── */}
        {activeTab === "profil" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Profil ionique (ppm)</Text>
              <Text style={styles.cardSubtitle}>
                Saisissez les concentrations de votre eau en mg/L
              </Text>

              <View style={styles.ionGrid}>
                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Calcium (Ca²⁺)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={caText}
                    onChangeText={setCaText}
                    keyboardType="numeric"
                    placeholder="75"
                    accessibilityLabel="Calcium en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Magnésium (Mg²⁺)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={mgText}
                    onChangeText={setMgText}
                    keyboardType="numeric"
                    placeholder="10"
                    accessibilityLabel="Magnésium en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Sodium (Na⁺)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={naText}
                    onChangeText={setNaText}
                    keyboardType="numeric"
                    placeholder="20"
                    accessibilityLabel="Sodium en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Sulfates (SO₄²⁻)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={so4Text}
                    onChangeText={setSo4Text}
                    keyboardType="numeric"
                    placeholder="150"
                    accessibilityLabel="Sulfates en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Chlorures (Cl⁻)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={clText}
                    onChangeText={setClText}
                    keyboardType="numeric"
                    placeholder="75"
                    accessibilityLabel="Chlorures en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>

                <View style={styles.ionField}>
                  <Text style={styles.ionLabel}>Bicarbonates (HCO₃⁻)</Text>
                  <TextInput
                    style={styles.ionInput}
                    value={hco3Text}
                    onChangeText={setHco3Text}
                    keyboardType="numeric"
                    placeholder="50"
                    accessibilityLabel="Bicarbonates en ppm"
                  />
                  <Text style={styles.ionUnit}>ppm</Text>
                </View>
              </View>
            </Card>

            {/* RA Result */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Alkalinité résiduelle (RA)</Text>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: raRating.color },
                ]}
              >
                <Text style={styles.ratingValue}>{ra.toFixed(1)}</Text>
                <Text style={styles.ratingUnit}>ppm</Text>
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingLabel}>{raRating.label}</Text>
                <Text style={styles.ratingDescription}>
                  {raRating.description}
                </Text>
              </View>
              <Text style={styles.formulaHint}>
                RA = HCO₃ − (Ca / 3,5 + Mg / 7)
              </Text>
            </Card>

            {/* SO4/Cl Ratio Result */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Rapport SO₄ / Cl</Text>
              <View
                style={[
                  styles.ratingBadge,
                  { backgroundColor: ratioRating.color },
                ]}
              >
                <Text style={styles.ratingValue}>
                  {hasNoChloride ? "—" : ratio.toFixed(2)}
                </Text>
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingLabel}>{ratioRating.label}</Text>
                <Text style={styles.ratingDescription}>
                  {ratioRating.description}
                </Text>
              </View>
              <Text style={styles.formulaHint}>
                Ratio &gt; 1 → Houblonné · Ratio &lt; 1 → Malté
              </Text>
            </Card>
          </>
        )}

        {/* ── TAB STYLE ── */}
        {activeTab === "style" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Choisir un style</Text>
              <View style={styles.presetList}>
                {STYLE_PRESETS.map((preset, index) => (
                  <Pressable
                    key={preset.name}
                    style={[
                      styles.presetItem,
                      styleIndex === index && styles.presetItemActive,
                    ]}
                    onPress={() => handleStyleChange(index)}
                  >
                    <Text
                      style={[
                        styles.presetName,
                        styleIndex === index && styles.presetNameActive,
                      ]}
                    >
                      {preset.name}
                    </Text>
                    <Text
                      style={[
                        styles.presetDescription,
                        styleIndex === index && styles.presetDescriptionActive,
                      ]}
                    >
                      {preset.description}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>
                Comparaison avec votre profil
              </Text>
              <Text style={styles.cardSubtitle}>
                Valeurs saisies dans l'onglet Profil
              </Text>

              {ionRows.map((row) => {
                const inRange = isInRange(row.value, row.range);
                return (
                  <View key={row.label} style={styles.ionCompareRow}>
                    <View style={styles.ionCompareLabelCol}>
                      <Text style={styles.ionCompareLabel}>{row.label}</Text>
                      <Text style={styles.ionCompareRange}>
                        {row.range.min}–{row.range.max} {row.unit}
                      </Text>
                    </View>
                    <View style={styles.ionCompareValueCol}>
                      <Text
                        style={[
                          styles.ionCompareValue,
                          inRange
                            ? styles.ionCompareValueOk
                            : styles.ionCompareValueOut,
                        ]}
                      >
                        {row.value} {row.unit}
                      </Text>
                      <Text style={styles.ionCompareIndicator}>
                        {inRange ? "✅" : "⚠️"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* ── TAB SELS ── */}
        {activeTab === "sels" && (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Sels de brassage</Text>
              <Text style={styles.cardSubtitle}>
                Contributions ioniques par g/L ajouté (pour 1 L d'eau)
              </Text>
            </Card>

            {SALT_REFERENCES.map((salt) => (
              <Card key={salt.name} style={styles.saltCard}>
                <View style={styles.saltHeader}>
                  <Text style={styles.saltName}>{salt.name}</Text>
                  <Text style={styles.saltFormula}>{salt.formula}</Text>
                </View>

                <View style={styles.saltContributions}>
                  {salt.ca !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Ca²⁺</Text>
                      <Text style={styles.saltIonValue}>+{salt.ca}</Text>
                    </View>
                  )}
                  {salt.mg !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Mg²⁺</Text>
                      <Text style={styles.saltIonValue}>+{salt.mg}</Text>
                    </View>
                  )}
                  {salt.na !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Na⁺</Text>
                      <Text style={styles.saltIonValue}>+{salt.na}</Text>
                    </View>
                  )}
                  {salt.so4 !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>SO₄²⁻</Text>
                      <Text style={styles.saltIonValue}>+{salt.so4}</Text>
                    </View>
                  )}
                  {salt.cl !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>Cl⁻</Text>
                      <Text style={styles.saltIonValue}>+{salt.cl}</Text>
                    </View>
                  )}
                  {salt.hco3 !== undefined && (
                    <View style={styles.saltIonChip}>
                      <Text style={styles.saltIonLabel}>HCO₃⁻</Text>
                      <Text style={styles.saltIonValue}>+{salt.hco3}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.saltNote}>{salt.note}</Text>
              </Card>
            ))}
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
  // Ion grid (Profil tab)
  ionGrid: {
    gap: spacing.sm,
  },
  ionField: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ionLabel: {
    flex: 1,
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  ionInput: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    width: 72,
    textAlign: "center",
    fontSize: typography.size.body,
    color: colors.neutral.textPrimary,
  },
  ionUnit: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    width: 28,
  },
  // Rating badge
  ratingBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    alignSelf: "flex-start",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingValue: {
    fontSize: 28,
    fontWeight: typography.weight.bold,
    color: colors.neutral.white,
  },
  ratingUnit: {
    fontSize: typography.size.label,
    color: colors.neutral.white,
  },
  ratingInfo: {
    marginBottom: spacing.xs,
  },
  ratingLabel: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  ratingDescription: {
    fontSize: typography.size.label,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  formulaHint: {
    fontSize: typography.size.caption,
    color: colors.neutral.muted,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  // Style presets
  presetList: {
    gap: spacing.xs,
  },
  presetItem: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  presetItemActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  presetName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  presetNameActive: {
    color: colors.neutral.white,
  },
  presetDescription: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  presetDescriptionActive: {
    color: colors.neutral.white,
  },
  // Ion comparison rows (Style tab)
  ionCompareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  ionCompareLabelCol: {
    flex: 1,
  },
  ionCompareLabel: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  ionCompareRange: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    marginTop: 2,
  },
  ionCompareValueCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  ionCompareValue: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
  },
  ionCompareValueOk: {
    color: colors.semantic.success,
  },
  ionCompareValueOut: {
    color: colors.semantic.error,
  },
  ionCompareIndicator: {
    fontSize: typography.size.body,
  },
  // Salt cards (Sels tab)
  saltCard: {
    marginBottom: spacing.sm,
  },
  saltHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: spacing.sm,
  },
  saltName: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  saltFormula: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
  saltContributions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  saltIonChip: {
    backgroundColor: colors.brand.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
  },
  saltIonLabel: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontWeight: typography.weight.medium,
  },
  saltIonValue: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.bold,
  },
  saltNote: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
});

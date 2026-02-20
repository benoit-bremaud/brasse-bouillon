import * as Haptics from "expo-haptics";

import {
  calculateResidualAlkalinity,
  calculateSulfateChlorideRatio,
} from "@/core/brewing-calculations";
import { colors, radius, shadows, spacing, typography } from "@/core/theme";
import { useCallback, useState } from "react";
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

// Water profile by city/region (ion concentrations in ppm)
type WaterProfile = {
  name: string;
  region: string;
  ca: number;
  mg: number;
  na: number;
  so4: number;
  cl: number;
  hco3: number;
  description: string;
};

const WATER_PROFILES: WaterProfile[] = [
  {
    name: "Paris",
    region: "France",
    ca: 112,
    mg: 6,
    na: 15,
    so4: 22,
    cl: 17,
    hco3: 306,
    description: "Eau moyennement dure, traditionnelle pour les bières blondes",
  },
  {
    name: "Munich",
    region: "Allemagne",
    ca: 78,
    mg: 17,
    na: 2,
    so4: 10,
    cl: 3,
    hco3: 242,
    description: "Eau douce, idéale pour les Weissbier et Dunkel",
  },
  {
    name: "Dortmund",
    region: "Allemagne",
    ca: 146,
    mg: 23,
    na: 45,
    so4: 33,
    cl: 52,
    hco3: 298,
    description: "Eau dure, traditionnelle pour les Export/Dortmunder",
  },
  {
    name: "Burton-on-Trent",
    region: "Angleterre",
    ca: 275,
    mg: 42,
    na: 25,
    so4: 600,
    cl: 35,
    hco3: 380,
    description: "Eau très sulfatée, incontournable pour IPA anglaise",
  },
  {
    name: "Dublin",
    region: "Irlande",
    ca: 118,
    mg: 4,
    na: 12,
    so4: 53,
    cl: 19,
    hco3: 319,
    description: "Eau moyennement dure, parfaite pour Stout/Porter",
  },
  {
    name: "London",
    region: "Angleterre",
    ca: 100,
    mg: 5,
    na: 40,
    so4: 65,
    cl: 60,
    hco3: 240,
    description: "Eau polyvalente, bonne pour les Bitter et Porter",
  },
  {
    name: "Edinburgh",
    region: "Écosse",
    ca: 78,
    mg: 19,
    na: 70,
    so4: 130,
    cl: 95,
    hco3: 280,
    description: "Eau saline, traditionnelle pour les Scotch Ale",
  },
  {
    name: "Pilsen",
    region: "République Tchèque",
    ca: 7,
    mg: 2,
    na: 2,
    so4: 5,
    cl: 3,
    hco3: 16,
    description: "Eau très douce, indispensable pour Pilsner authentique",
  },
];

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

// Calculate salt corrections to reach target profile
function calculateSaltCorrections(
  currentProfile: {
    ca: number;
    mg: number;
    na: number;
    so4: number;
    cl: number;
    hco3: number;
  },
  targetProfile: {
    ca: number;
    mg: number;
    na: number;
    so4: number;
    cl: number;
    hco3: number;
  },
  salts: SaltReference[],
  volumeLiters: number,
): { salt: SaltReference; gramsNeeded: number }[] {
  const corrections: { salt: SaltReference; gramsNeeded: number }[] = [];

  // Calculate deltas needed for each ion
  const caDelta = Math.max(0, targetProfile.ca - currentProfile.ca);
  const mgDelta = Math.max(0, targetProfile.mg - currentProfile.mg);
  const naDelta = Math.max(0, targetProfile.na - currentProfile.na);
  const so4Delta = Math.max(0, targetProfile.so4 - currentProfile.so4);
  const clDelta = Math.max(0, targetProfile.cl - currentProfile.cl);
  const hco3Delta = Math.max(0, targetProfile.hco3 - currentProfile.hco3);

  // Simple heuristic: prioritize most impactful salts
  // This is a simplified calculation - real brewing software uses linear programming

  // For each ion deficit, find best salt
  // Note: salt values are in % (e.g., 36.1 = 36.1%), need to divide by 10 for correct calculation
  // Formula: grams = (delta_ppm * volume_L) / (percentage * 10)
  if (caDelta > 0) {
    // Use CaCl2
    const cacl2 = salts.find(
      (s) => s.name.includes("Chlorure de calcium") && s.ca,
    );
    if (cacl2 && cacl2.ca) {
      const gramsNeeded = (caDelta * volumeLiters) / (cacl2.ca * 10);
      corrections.push({ salt: cacl2, gramsNeeded });
    }
  }

  if (so4Delta > 0) {
    // Use Gypse (French for gypsum)
    const gypse = salts.find((s) => s.name === "Gypse" && s.so4);
    if (gypse && gypse.so4) {
      const gramsNeeded = (so4Delta * volumeLiters) / (gypse.so4 * 10);
      corrections.push({ salt: gypse, gramsNeeded });
    }
  }

  if (clDelta > 0) {
    // Use CaCl2
    const cacl2 = salts.find(
      (s) => s.name.includes("Chlorure de calcium") && s.cl,
    );
    if (cacl2 && cacl2.cl) {
      const gramsNeeded = (clDelta * volumeLiters) / (cacl2.cl * 10);
      corrections.push({ salt: cacl2, gramsNeeded });
    }
  }

  if (hco3Delta > 0) {
    // Use Bicarbonate de soude
    const bicarbonate = salts.find(
      (s) => s.name.includes("Bicarbonate") && s.hco3,
    );
    if (bicarbonate && bicarbonate.hco3) {
      const gramsNeeded = (hco3Delta * volumeLiters) / (bicarbonate.hco3 * 10);
      corrections.push({ salt: bicarbonate, gramsNeeded });
    }
  }

  if (naDelta > 0) {
    // Use Sel de table
    const sel = salts.find((s) => s.name === "Sel de table" && s.na);
    if (sel && sel.na) {
      const gramsNeeded = (naDelta * volumeLiters) / (sel.na * 10);
      corrections.push({ salt: sel, gramsNeeded });
    }
  }

  if (mgDelta > 0) {
    // Use Sel d'Epsom
    const epsom = salts.find((s) => s.name === "Sel d'Epsom" && s.mg);
    if (epsom && epsom.mg) {
      const gramsNeeded = (mgDelta * volumeLiters) / (epsom.mg * 10);
      corrections.push({ salt: epsom, gramsNeeded });
    }
  }

  return corrections;
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

  // City/water profile selection
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

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

  const handleProfileChange = useCallback((index: number) => {
    const profile = WATER_PROFILES[index];
    setCaText(profile.ca.toString());
    setMgText(profile.mg.toString());
    setNaText(profile.na.toString());
    setSo4Text(profile.so4.toString());
    setClText(profile.cl.toString());
    setHco3Text(profile.hco3.toString());
    setSelectedProfileIndex(index);
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

  // Calculate target profile from style preset (use midpoint of range)
  const targetProfile = {
    ca: (currentPreset.ca.min + currentPreset.ca.max) / 2,
    mg: (currentPreset.mg.min + currentPreset.mg.max) / 2,
    na: (currentPreset.na.min + currentPreset.na.max) / 2,
    so4: (currentPreset.so4.min + currentPreset.so4.max) / 2,
    cl: (currentPreset.cl.min + currentPreset.cl.max) / 2,
    hco3: (currentPreset.hco3.min + currentPreset.hco3.max) / 2,
  };

  const currentProfile = { ca, mg, na, so4, cl, hco3 };
  const saltCorrections = calculateSaltCorrections(
    currentProfile,
    targetProfile,
    SALT_REFERENCES,
    20, // Default 20L batch
  );

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

            {/* Water profile by city selector */}
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Profil d'eau par ville</Text>
              <Text style={styles.cardSubtitle}>
                Sélectionnez une ville pour pré-remplir les valeurs
              </Text>
              <View style={styles.profileList}>
                {WATER_PROFILES.map((profile, index) => (
                  <Pressable
                    key={profile.name}
                    style={[
                      styles.profileItem,
                      selectedProfileIndex === index &&
                        styles.profileItemActive,
                    ]}
                    onPress={() => handleProfileChange(index)}
                  >
                    <View style={styles.profileHeader}>
                      <Text
                        style={[
                          styles.profileName,
                          selectedProfileIndex === index &&
                            styles.profileNameActive,
                        ]}
                      >
                        {profile.name}
                      </Text>
                      <Text
                        style={[
                          styles.profileRegion,
                          selectedProfileIndex === index &&
                            styles.profileRegionActive,
                        ]}
                      >
                        {profile.region}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.profileDescription,
                        selectedProfileIndex === index &&
                          styles.profileDescriptionActive,
                      ]}
                    >
                      {profile.description}
                    </Text>
                  </Pressable>
                ))}
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

            {/* Salt corrections recommendations */}
            {saltCorrections.length > 0 && (
              <Card style={styles.card}>
                <Text style={styles.cardTitle}>Corrections recommandées</Text>
                <Text style={styles.cardSubtitle}>
                  Sels à ajouter pour atteindre le profil cible (pour 20L)
                </Text>

                {saltCorrections.map((correction, index) => (
                  <View key={index} style={styles.correctionRow}>
                    <View style={styles.correctionInfo}>
                      <Text style={styles.correctionSaltName}>
                        {correction.salt.name}
                      </Text>
                      <Text style={styles.correctionFormula}>
                        {correction.salt.formula}
                      </Text>
                    </View>
                    <View style={styles.correctionAmount}>
                      <Text style={styles.correctionGrams}>
                        {correction.gramsNeeded.toFixed(1)} g
                      </Text>
                    </View>
                  </View>
                ))}

                <Text style={styles.correctionNote}>
                  Ajustez selon votre volume de brassin
                </Text>
              </Card>
            )}
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
  // Water profile by city selector
  profileList: {
    gap: spacing.xs,
  },
  profileItem: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
  },
  profileItemActive: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xxs,
  },
  profileName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  profileNameActive: {
    color: colors.neutral.white,
  },
  profileRegion: {
    fontSize: typography.size.caption,
    color: colors.brand.secondary,
    fontWeight: typography.weight.medium,
  },
  profileRegionActive: {
    color: colors.neutral.white,
  },
  profileDescription: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
  },
  profileDescriptionActive: {
    color: colors.neutral.white,
  },
  // Salt corrections recommendations
  correctionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.border,
  },
  correctionInfo: {
    flex: 1,
  },
  correctionSaltName: {
    fontSize: typography.size.label,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  correctionFormula: {
    fontSize: typography.size.caption,
    color: colors.neutral.textSecondary,
    fontStyle: "italic",
  },
  correctionAmount: {
    alignItems: "flex-end",
  },
  correctionGrams: {
    fontSize: typography.size.body,
    fontWeight: typography.weight.bold,
    color: colors.brand.primary,
  },
  correctionNote: {
    fontSize: typography.size.caption,
    color: colors.neutral.muted,
    fontStyle: "italic",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});

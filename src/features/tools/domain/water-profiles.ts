import type { WaterProfile } from "@/core/brewing-calculations";

export type IonRange = {
  min: number;
  max: number;
};

export type WaterLocationProfile = WaterProfile & {
  name: string;
  region: string;
  description: string;
};

export type WaterStylePresetId =
  | "pilsner-lager"
  | "pale-ale"
  | "ipa"
  | "amber-maltee"
  | "stout-porter";

export type WaterStylePreset = {
  id: WaterStylePresetId;
  name: string;
  description: string;
  ca: IonRange;
  mg: IonRange;
  na: IonRange;
  so4: IonRange;
  cl: IonRange;
  hco3: IonRange;
};

export const WATER_LOCATION_PROFILES: WaterLocationProfile[] = [
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

export const WATER_STYLE_PRESETS: WaterStylePreset[] = [
  {
    id: "pilsner-lager",
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
    id: "pale-ale",
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
    id: "ipa",
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
    id: "amber-maltee",
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
    id: "stout-porter",
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

export const DEFAULT_BALANCED_WATER_PROFILE: WaterProfile = {
  ca: 80,
  mg: 10,
  na: 20,
  so4: 90,
  cl: 70,
  hco3: 60,
};

export function getWaterStylePresetById(
  presetId: WaterStylePresetId,
): WaterStylePreset | null {
  return WATER_STYLE_PRESETS.find((preset) => preset.id === presetId) ?? null;
}

export function buildWaterProfileFromStylePreset(
  preset: WaterStylePreset,
): WaterProfile {
  return {
    ca: (preset.ca.min + preset.ca.max) / 2,
    mg: (preset.mg.min + preset.mg.max) / 2,
    na: (preset.na.min + preset.na.max) / 2,
    so4: (preset.so4.min + preset.so4.max) / 2,
    cl: (preset.cl.min + preset.cl.max) / 2,
    hco3: (preset.hco3.min + preset.hco3.max) / 2,
  };
}

export function getWaterLocationProfileByName(
  name: string,
): WaterLocationProfile | null {
  return (
    WATER_LOCATION_PROFILES.find((profile) => profile.name === name) ?? null
  );
}

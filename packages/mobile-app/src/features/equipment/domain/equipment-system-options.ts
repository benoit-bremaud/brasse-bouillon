import { EquipmentSystemType } from "./equipment.types";

/**
 * Novice-facing presentation metadata for the three system types. Pure
 * reference data (labels only) — the hidden brewing constants live server-side.
 */
export interface EquipmentSystemOption {
  value: EquipmentSystemType;
  /** Short label reused in the auto-generated profile name. */
  shortLabel: string;
  /** Full label shown in the Q1 picker. */
  label: string;
  /** One-line beginner explanation. */
  help: string;
}

export const EQUIPMENT_SYSTEM_OPTIONS: readonly EquipmentSystemOption[] = [
  {
    value: "extract",
    shortLabel: "Extrait",
    label: "Extrait de malt",
    help: "Kit ou extrait : pas d'empâtage, on dilue puis on fait bouillir.",
  },
  {
    value: "all-grain",
    shortLabel: "Tout-grain",
    label: "Tout grain",
    help: "Empâtage en cuve séparée, puis ébullition.",
  },
  {
    value: "all-in-one",
    shortLabel: "Tout-en-un",
    label: "Tout-en-un (BIAB)",
    help: "Une seule cuve pour empâter et bouillir (Braumeister, Grainfather…).",
  },
];

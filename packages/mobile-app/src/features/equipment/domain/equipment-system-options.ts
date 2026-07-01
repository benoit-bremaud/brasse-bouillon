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

// Labels are framed on the *equipment* axis (number of vessels), not the
// method — a novice can tell "separate vessels" from "single vessel" more
// easily than "tout-grain" from "BIAB" (F17).
export const EQUIPMENT_SYSTEM_OPTIONS: readonly EquipmentSystemOption[] = [
  {
    // Extract has no vessel-count distinction, so label and shortLabel are
    // intentionally identical (F17 wording).
    value: "extract",
    shortLabel: "Extrait",
    label: "Extrait",
    help: "Kit ou extrait : pas d'empâtage, on dilue puis on fait bouillir.",
  },
  {
    value: "all-grain",
    shortLabel: "Cuves séparées",
    label: "Cuves séparées",
    help: "Empâtage dans une cuve, puis ébullition dans une autre.",
  },
  {
    value: "all-in-one",
    shortLabel: "Cuve unique",
    label: "Cuve unique (BIAB)",
    help: "Une seule cuve pour empâter et bouillir (Braumeister, Grainfather…).",
  },
];

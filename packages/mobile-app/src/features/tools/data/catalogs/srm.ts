// SRM Color palette with hexadecimal values
// Based on standard brewing color references
export const srmColors: Record<number, string> = {
  1: "#FFE699", // Very Light
  2: "#FFD878",
  3: "#FFCA5A",
  4: "#FFBF42",
  5: "#FBB123",
  6: "#F8A600",
  7: "#F39C00",
  8: "#EA8F00",
  9: "#E58500",
  10: "#DE7C00", // Light
  11: "#D77200",
  12: "#CF6900",
  13: "#CB6200",
  14: "#C35900",
  15: "#BB5100",
  16: "#B54C00",
  17: "#B04500",
  18: "#A63E00",
  19: "#A13700",
  20: "#9B3200", // Amber
  21: "#952D00",
  22: "#8E2900",
  23: "#882300",
  24: "#821E00",
  25: "#7C1A00",
  26: "#771600",
  27: "#721200",
  28: "#6D0F00",
  29: "#680B00",
  30: "#640800", // Dark
  31: "#600500",
  32: "#5C0300",
  33: "#590100",
  34: "#560000",
  35: "#530000",
  36: "#500000",
  37: "#4D0000",
  38: "#4A0000",
  39: "#470000",
  40: "#440000", // Very Dark / Black
};

const SRM_MIN = 1;
const SRM_MAX = 40;

export function getSrmColor(srm: number): string {
  const clamped = Math.max(SRM_MIN, Math.min(SRM_MAX, Math.round(srm)));
  return srmColors[clamped] ?? srmColors[SRM_MAX];
}

export function getSrmStyleLabel(srm: number): string {
  if (srm <= 3) return "Très clair";
  if (srm <= 6) return "Paille / Doré clair";
  if (srm <= 10) return "Doré";
  if (srm <= 15) return "Ambré clair";
  if (srm <= 22) return "Ambré";
  if (srm <= 30) return "Brun clair";
  if (srm <= 35) return "Brun";
  return "Très foncé / Noir";
}

import {
  LabelIconId,
  LabelPaletteId,
} from "@/features/labels/domain/label.types";

import { colors } from "@/core/theme";

export interface LabelPaletteOption {
  id: LabelPaletteId;
  label: string;
  backgroundColor: string;
  foregroundColor: string;
}

export interface LabelIconOption {
  id: LabelIconId;
  label: string;
  symbol: string;
}

export const LABEL_PALETTE_OPTIONS: LabelPaletteOption[] = [
  {
    id: "sunset_amber",
    label: "Sunset Amber",
    backgroundColor: colors.brand.primary,
    foregroundColor: colors.neutral.white,
  },
  {
    id: "hop_garden",
    label: "Hop Garden",
    backgroundColor: colors.semantic.success,
    foregroundColor: colors.neutral.white,
  },
  {
    id: "midnight_stout",
    label: "Midnight Stout",
    backgroundColor: colors.neutral.textPrimary,
    foregroundColor: colors.neutral.white,
  },
];

export const LABEL_ICON_OPTIONS: LabelIconOption[] = [
  {
    id: "hop",
    label: "Hop cone",
    symbol: "🌿",
  },
  {
    id: "flask",
    label: "Brewing flask",
    symbol: "🧪",
  },
  {
    id: "barley",
    label: "Barley",
    symbol: "🌾",
  },
];

export function getPaletteOptionById(
  paletteId: LabelPaletteId,
): LabelPaletteOption {
  return (
    LABEL_PALETTE_OPTIONS.find((palette) => palette.id === paletteId) ??
    LABEL_PALETTE_OPTIONS[0]
  );
}

export function getIconOptionById(iconId: LabelIconId): LabelIconOption {
  return (
    LABEL_ICON_OPTIONS.find((iconOption) => iconOption.id === iconId) ??
    LABEL_ICON_OPTIONS[0]
  );
}

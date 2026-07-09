import { dataSource } from "@/core/data/data-source";
import { getEquipmentFit } from "@/features/recipes/data/equipment-fit.api";
import type {
  CapacityFit,
  FermenterReason,
  KettleReason,
} from "@/features/recipes/domain/equipment-fit.types";

/**
 * Curated demo fit — a positive FITS/OK verdict. In demo mode the whole brew-prep
 * flow is served locally, so we never call the live JWT-guarded endpoint (which
 * the demo session cannot reach).
 */
const DEMO_FIT: CapacityFit = {
  fermenter: "FITS",
  fermenterReason: null,
  kettle: "OK",
  kettleReason: null,
  fermenterUsableL: 4.5,
  recipeVolumeL: 4.3,
  preBoilL: 5,
  kettleCapacityL: 10,
  scaleRatio: null,
};

/** Load the advisory capacity fit-check for a recipe (ADR-0026). */
export function loadEquipmentFit(
  recipeId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<CapacityFit> {
  if (dataSource.useDemoData) {
    return Promise.resolve(DEMO_FIT);
  }
  return getEquipmentFit(recipeId, profileId, signal);
}

/** Badge tone for a leg, mapped 1:1 to the UI `Badge` variants. */
export type FitTone = "success" | "warning" | "error" | "neutral";

/** Display model for one leg (fermenter or kettle). */
export interface LegDisplay {
  title: string;
  badgeLabel: string;
  badgeTone: FitTone;
  message: string;
  detail: string | null;
}

/** Display model for the whole panel. */
export interface FitDisplay {
  /** True when no equipment is declared → show the "declare equipment" CTA. */
  showProfileCta: boolean;
  fermenter: LegDisplay;
  kettle: LegDisplay;
}

function litres(value: number | null): string {
  return value === null ? "? L" : `${value} L`;
}

function describeFermenter(fit: CapacityFit): LegDisplay {
  const base = { title: "Fermenteur" } as const;
  switch (fit.fermenter) {
    case "FITS":
      return {
        ...base,
        badgeLabel: "Ça passe",
        badgeTone: "success",
        message: "Ton fermenteur est adapté au volume de cette recette.",
        detail: `${litres(fit.recipeVolumeL)} pour ${litres(fit.fermenterUsableL)} utiles`,
      };
    case "TOO_LARGE":
      return {
        ...base,
        badgeLabel: "Trop grand",
        badgeTone: "error",
        message: `Cette recette vise ${litres(fit.recipeVolumeL)} mais ton fermenteur ne tient que ~${litres(fit.fermenterUsableL)} utiles. Réduis l'échelle d'un facteur ~${fit.scaleRatio ?? "?"}.`,
        detail: null,
      };
    default:
      return describeNotEvaluated(base.title, fit.fermenterReason);
  }
}

function describeKettle(fit: CapacityFit): LegDisplay {
  const base = { title: "Bouilloire" } as const;
  switch (fit.kettle) {
    case "OK":
      return {
        ...base,
        badgeLabel: "Ça passe",
        badgeTone: "success",
        message: "Ta bouilloire peut contenir le volume de pré-ébullition.",
        detail: `~${litres(fit.preBoilL)} pour ${litres(fit.kettleCapacityL)}`,
      };
    case "WARNING":
      return {
        ...base,
        badgeLabel: "Attention",
        badgeTone: "warning",
        message: `Ton volume de pré-ébullition (~${litres(fit.preBoilL)}) dépasse ta bouilloire (${litres(fit.kettleCapacityL)}). Vérifie ta méthode ou réduis le volume.`,
        detail: null,
      };
    case "HARD_STOP":
      // Modelled but not emitted by the backend in v1 (ADR-0026 / ADR-0020 D2);
      // handled here so it never falls through to the generic not-evaluated copy.
      return {
        ...base,
        badgeLabel: "Impossible",
        badgeTone: "error",
        message: `Ta bouilloire (${litres(fit.kettleCapacityL)}) ne peut pas contenir le volume de pré-ébullition (~${litres(fit.preBoilL)}).`,
        detail: null,
      };
    default:
      return describeNotEvaluated(base.title, fit.kettleReason);
  }
}

const NOT_EVALUATED_MESSAGES: Record<FermenterReason | KettleReason, string> = {
  NO_PROFILE: "Déclare ton matériel pour vérifier l'adéquation.",
  NO_RECIPE_VOLUME: "Cette recette n'indique pas de volume cible.",
  NO_FERMENTER_VOLUME:
    "Ton profil n'indique pas de volume de fermenteur exploitable.",
  NO_RECIPE_WATER:
    "Cette recette ne détaille pas ses volumes d'eau — bouilloire non vérifiée.",
  NO_KETTLE_VOLUME:
    "Ton profil n'indique pas de volume de bouilloire exploitable.",
};

function describeNotEvaluated(
  title: string,
  reason: FermenterReason | KettleReason | null,
): LegDisplay {
  return {
    title,
    badgeLabel: "À vérifier",
    badgeTone: "neutral",
    message: reason
      ? NOT_EVALUATED_MESSAGES[reason]
      : "Adéquation non vérifiable.",
    detail: null,
  };
}

/**
 * Map a `CapacityFit` to a display model (ADR-0026). Pure — the panel renders
 * this verbatim. When no profile is declared, both legs read `NO_PROFILE` and
 * `showProfileCta` is set so the panel surfaces the "declare equipment" action.
 */
export function describeFit(fit: CapacityFit): FitDisplay {
  return {
    // Only the whole-screen "declare equipment" CTA when BOTH legs are
    // NO_PROFILE (the backend always sets them together); a hypothetical
    // single-leg NO_PROFILE still renders per-leg guidance instead of hiding it.
    showProfileCta:
      fit.fermenterReason === "NO_PROFILE" && fit.kettleReason === "NO_PROFILE",
    fermenter: describeFermenter(fit),
    kettle: describeKettle(fit),
  };
}

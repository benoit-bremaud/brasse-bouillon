import { request } from "@/core/http/http-client";
import type {
  CapacityFit,
  FermenterReason,
  FermenterVerdict,
  KettleReason,
  KettleVerdict,
} from "@/features/recipes/domain/equipment-fit.types";

/** Raw `CapacityFitDto` as returned by `GET /recipes/:id/equipment-fit`. */
interface CapacityFitApiDto {
  fermenter?: string | null;
  fermenterReason?: string | null;
  kettle?: string | null;
  kettleReason?: string | null;
  fermenterUsableL?: number | null;
  recipeVolumeL?: number | null;
  preBoilL?: number | null;
  kettleCapacityL?: number | null;
  scaleRatio?: number | null;
}

const FERMENTER_VERDICTS: readonly FermenterVerdict[] = [
  "FITS",
  "TOO_LARGE",
  "NOT_EVALUATED",
];
const KETTLE_VERDICTS: readonly KettleVerdict[] = [
  "OK",
  "WARNING",
  "HARD_STOP",
  "NOT_EVALUATED",
];
const FERMENTER_REASONS: readonly FermenterReason[] = [
  "NO_PROFILE",
  "NO_RECIPE_VOLUME",
  "NO_FERMENTER_VOLUME",
];
const KETTLE_REASONS: readonly KettleReason[] = [
  "NO_PROFILE",
  "NO_RECIPE_WATER",
  "NO_KETTLE_VOLUME",
];

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function reason<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Defensively map the raw DTO to the domain profile (unknown enums → safe defaults). */
export function mapCapacityFit(dto: CapacityFitApiDto): CapacityFit {
  const fermenter = oneOf(dto.fermenter, FERMENTER_VERDICTS, "NOT_EVALUATED");
  const kettle = oneOf(dto.kettle, KETTLE_VERDICTS, "NOT_EVALUATED");
  // Invariant: a `reason` is meaningful only for a NOT_EVALUATED leg, so it is
  // dropped on any evaluated verdict (never a FITS-with-NO_PROFILE state).
  return {
    fermenter,
    fermenterReason:
      fermenter === "NOT_EVALUATED"
        ? reason(dto.fermenterReason, FERMENTER_REASONS)
        : null,
    kettle,
    kettleReason:
      kettle === "NOT_EVALUATED"
        ? reason(dto.kettleReason, KETTLE_REASONS)
        : null,
    fermenterUsableL: num(dto.fermenterUsableL),
    recipeVolumeL: num(dto.recipeVolumeL),
    preBoilL: num(dto.preBoilL),
    kettleCapacityL: num(dto.kettleCapacityL),
    scaleRatio: num(dto.scaleRatio),
  };
}

/**
 * Fetch the advisory capacity fit-check for a recipe against the caller's
 * equipment (JWT-authenticated). `profileId` is optional — the backend resolves
 * the default profile when omitted (ADR-0026).
 */
export async function getEquipmentFit(
  recipeId: string,
  profileId?: string,
  signal?: AbortSignal,
): Promise<CapacityFit> {
  const query = profileId ? `?profileId=${encodeURIComponent(profileId)}` : "";
  const dto = await request<CapacityFitApiDto>(
    `/recipes/${encodeURIComponent(recipeId)}/equipment-fit${query}`,
    { signal },
  );
  return mapCapacityFit(dto);
}

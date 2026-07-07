import { request } from "@/core/http/http-client";

import type {
  Commune,
  LiveWaterProfile,
  WaterConformity,
} from "@/features/recipes/domain/water-profile.types";

/**
 * Sovereign French state geo API (DINUM/INSEE) — public, keyless. Fixed
 * national host (not environment-specific), so it is a constant rather than an
 * env var. See ADR-0025 § Where INSEE resolution lives.
 */
const GEO_API_BASE_URL = "https://geo.api.gouv.fr";

interface GeoCommuneDto {
  readonly code: string;
  readonly nom: string;
  readonly codesPostaux?: readonly string[];
}

/** Maps a geo.api.gouv.fr commune to the domain shape (`code` → `codeInsee`). */
export function mapGeoCommune(dto: GeoCommuneDto): Commune {
  return {
    codeInsee: dto.code,
    nom: dto.nom,
    codesPostaux: dto.codesPostaux ?? [],
  };
}

/**
 * Resolves a postal code to its candidate communes (each with its INSEE code).
 * One postal code can map to several communes — the caller must disambiguate.
 */
export async function getCommunesByPostalCode(
  postalCode: string,
  signal?: AbortSignal,
): Promise<Commune[]> {
  const rows = await request<GeoCommuneDto[]>(
    `/communes?codePostal=${encodeURIComponent(postalCode)}&fields=nom,code,codesPostaux`,
    { auth: false, baseUrl: GEO_API_BASE_URL, signal },
  );
  return rows.map(mapGeoCommune);
}

interface WaterMineralsMgLDto {
  readonly ca: number | null;
  readonly mg: number | null;
  readonly cl: number | null;
  readonly so4: number | null;
  readonly hco3: number | null;
}

// Mirrors the backend `WaterProfileDto` (already camelCase). `mineralsMgL` is
// typed nullable here as a defensive client guard only — the server always
// populates the block (individual ions may be null); do NOT design partial-data
// UX around a null block, which never arrives from the API.
interface WaterProfileDto {
  readonly codeInsee: string;
  readonly year: number;
  readonly networkName: string | null;
  readonly sampleCount: number;
  readonly conformity: string;
  readonly mineralsMgL: WaterMineralsMgLDto | null;
  readonly hardnessFrench: number | null;
}

const CONFORMITY_VALUES: readonly WaterConformity[] = [
  "C",
  "N",
  "D",
  "S",
  "UNKNOWN",
];

/** Narrows the backend conformity string to the known enum, else `UNKNOWN`. */
export function mapConformity(raw: string): WaterConformity {
  return (CONFORMITY_VALUES as readonly string[]).includes(raw)
    ? (raw as WaterConformity)
    : "UNKNOWN";
}

/** Maps the backend `/water` DTO to the domain profile (already camelCase). */
export function mapWaterProfile(dto: WaterProfileDto): LiveWaterProfile {
  const minerals = dto.mineralsMgL;
  return {
    codeInsee: dto.codeInsee,
    year: dto.year,
    networkName: dto.networkName,
    sampleCount: dto.sampleCount,
    conformity: mapConformity(dto.conformity),
    mineralsMgL: {
      ca: minerals?.ca ?? null,
      mg: minerals?.mg ?? null,
      cl: minerals?.cl ?? null,
      so4: minerals?.so4 ?? null,
      hco3: minerals?.hco3 ?? null,
    },
    hardnessFrench: dto.hardnessFrench,
  };
}

/**
 * Fetches the aggregated local water profile for a commune from the existing
 * backend `GET /water` (JWT-guarded — the default `auth: true` applies).
 */
export async function getLiveWaterProfile(
  codeInsee: string,
  year: number,
  signal?: AbortSignal,
): Promise<LiveWaterProfile> {
  const dto = await request<WaterProfileDto>(
    `/water?codeInsee=${encodeURIComponent(codeInsee)}&year=${year}`,
    { signal },
  );
  return mapWaterProfile(dto);
}

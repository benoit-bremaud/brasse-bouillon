import { WaterProviderKey } from '../water/domain/enums/water-provider-key.enum';

const DEFAULT_WATER_PROVIDER = WaterProviderKey.HUBEAU;
const DEFAULT_HUBEAU_BASE_URL =
  'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable';
const DEFAULT_HUBEAU_TIMEOUT_MS = 8000;
const DEFAULT_HUBEAU_CACHE_TTL_SECONDS = 3600;
const DEFAULT_HUBEAU_MAX_SAMPLES = 50;
const DEFAULT_HUBEAU_COMMUNES_UDI_SIZE = 10;
const DEFAULT_HUBEAU_RESULTATS_DIS_SIZE = 100;

export interface WaterConfig {
  readonly defaultProvider: WaterProviderKey;
  readonly hubeauBaseUrl: string;
  readonly hubeauTimeoutMs: number;
  readonly hubeauCacheTtlSeconds: number;
  readonly hubeauMaxSamples: number;
  readonly hubeauCommunesUdiSize: number;
  readonly hubeauResultatsDisSize: number;
}

const parsePositiveInteger = (
  raw: string | undefined,
  fallback: number,
): number => {
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const parseProvider = (
  raw: string | undefined,
  fallback: WaterProviderKey,
): WaterProviderKey => {
  if (!raw) {
    return fallback;
  }

  const normalized = raw.trim().toLowerCase();
  return Object.values(WaterProviderKey).includes(
    normalized as WaterProviderKey,
  )
    ? (normalized as WaterProviderKey)
    : fallback;
};

export const waterConfig = (): WaterConfig => ({
  defaultProvider: parseProvider(
    process.env.WATER_PROVIDER_DEFAULT,
    DEFAULT_WATER_PROVIDER,
  ),
  hubeauBaseUrl: process.env.HUBEAU_BASE_URL?.trim() || DEFAULT_HUBEAU_BASE_URL,
  hubeauTimeoutMs: parsePositiveInteger(
    process.env.HUBEAU_TIMEOUT_MS,
    DEFAULT_HUBEAU_TIMEOUT_MS,
  ),
  hubeauCacheTtlSeconds: parsePositiveInteger(
    process.env.HUBEAU_CACHE_TTL_SECONDS,
    DEFAULT_HUBEAU_CACHE_TTL_SECONDS,
  ),
  hubeauMaxSamples: parsePositiveInteger(
    process.env.HUBEAU_MAX_SAMPLES,
    DEFAULT_HUBEAU_MAX_SAMPLES,
  ),
  hubeauCommunesUdiSize: parsePositiveInteger(
    process.env.HUBEAU_COMMUNES_UDI_SIZE,
    DEFAULT_HUBEAU_COMMUNES_UDI_SIZE,
  ),
  hubeauResultatsDisSize: parsePositiveInteger(
    process.env.HUBEAU_RESULTATS_DIS_SIZE,
    DEFAULT_HUBEAU_RESULTATS_DIS_SIZE,
  ),
});

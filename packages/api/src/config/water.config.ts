import { WaterProviderKey } from '../water/domain/enums/water-provider-key.enum';

const HUBEAU_BASE_URL =
  'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable';
const DEFAULT_HUBEAU_TIMEOUT_MS = 8000;
const DEFAULT_HUBEAU_CACHE_TTL_SECONDS = 3600;
const HUBEAU_MAX_SAMPLES = 50;
const HUBEAU_COMMUNES_UDI_SIZE = 10;
const HUBEAU_RESULTATS_DIS_SIZE = 100;

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

export const waterConfig = (): WaterConfig => ({
  defaultProvider: WaterProviderKey.HUBEAU,
  hubeauBaseUrl: HUBEAU_BASE_URL,
  hubeauTimeoutMs: parsePositiveInteger(
    process.env.HUBEAU_TIMEOUT_MS,
    DEFAULT_HUBEAU_TIMEOUT_MS,
  ),
  hubeauCacheTtlSeconds: parsePositiveInteger(
    process.env.HUBEAU_CACHE_TTL_SECONDS,
    DEFAULT_HUBEAU_CACHE_TTL_SECONDS,
  ),
  hubeauMaxSamples: HUBEAU_MAX_SAMPLES,
  hubeauCommunesUdiSize: HUBEAU_COMMUNES_UDI_SIZE,
  hubeauResultatsDisSize: HUBEAU_RESULTATS_DIS_SIZE,
});

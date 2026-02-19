import { WaterProviderKey } from './domain/enums/water-provider-key.enum';

export const WATER_PROVIDERS = Symbol('WATER_PROVIDERS');
export const EAU_CONFIG = Symbol('EAU_CONFIG');

export const DEFAULT_WATER_PROVIDER = WaterProviderKey.HUBEAU;

export const DEFAULT_HUBEAU_BASE_URL =
  'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable';

export const DEFAULT_HUBEAU_TIMEOUT_MS = 8000;
export const DEFAULT_HUBEAU_CACHE_TTL_SECONDS = 3600;
export const DEFAULT_HUBEAU_MAX_SAMPLES = 50;
export const DEFAULT_HUBEAU_COMMUNES_UDI_SIZE = 10;
export const DEFAULT_HUBEAU_RESULTATS_DIS_SIZE = 100;

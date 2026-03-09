import { WaterProviderKey } from '../water/domain/enums/water-provider-key.enum';
import { waterConfig } from './water.config';

describe('waterConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.WATER_PROVIDER_DEFAULT;
    delete process.env.HUBEAU_BASE_URL;
    delete process.env.HUBEAU_TIMEOUT_MS;
    delete process.env.HUBEAU_CACHE_TTL_SECONDS;
    delete process.env.HUBEAU_MAX_SAMPLES;
    delete process.env.HUBEAU_COMMUNES_UDI_SIZE;
    delete process.env.HUBEAU_RESULTATS_DIS_SIZE;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default values when env is missing', () => {
    const config = waterConfig();

    expect(config.defaultProvider).toBe(WaterProviderKey.HUBEAU);
    expect(config.hubeauBaseUrl).toBe(
      'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable',
    );
    expect(config.hubeauTimeoutMs).toBe(8000);
    expect(config.hubeauCacheTtlSeconds).toBe(3600);
    expect(config.hubeauMaxSamples).toBe(50);
    expect(config.hubeauCommunesUdiSize).toBe(10);
    expect(config.hubeauResultatsDisSize).toBe(100);
  });

  it('should parse valid env values', () => {
    process.env.WATER_PROVIDER_DEFAULT = 'hubeau';
    process.env.HUBEAU_BASE_URL = 'https://example.test/water';
    process.env.HUBEAU_TIMEOUT_MS = '15000';
    process.env.HUBEAU_CACHE_TTL_SECONDS = '7200';
    process.env.HUBEAU_MAX_SAMPLES = '80';
    process.env.HUBEAU_COMMUNES_UDI_SIZE = '22';
    process.env.HUBEAU_RESULTATS_DIS_SIZE = '230';

    const config = waterConfig();

    expect(config.defaultProvider).toBe(WaterProviderKey.HUBEAU);
    expect(config.hubeauBaseUrl).toBe('https://example.test/water');
    expect(config.hubeauTimeoutMs).toBe(15000);
    expect(config.hubeauCacheTtlSeconds).toBe(7200);
    expect(config.hubeauMaxSamples).toBe(80);
    expect(config.hubeauCommunesUdiSize).toBe(22);
    expect(config.hubeauResultatsDisSize).toBe(230);
  });

  it('should fallback to defaults on invalid values', () => {
    process.env.WATER_PROVIDER_DEFAULT = 'invalid-provider';
    process.env.HUBEAU_TIMEOUT_MS = '-42';
    process.env.HUBEAU_CACHE_TTL_SECONDS = 'abc';
    process.env.HUBEAU_MAX_SAMPLES = '0';
    process.env.HUBEAU_COMMUNES_UDI_SIZE = '-3';
    process.env.HUBEAU_RESULTATS_DIS_SIZE = '';

    const config = waterConfig();

    expect(config.defaultProvider).toBe(WaterProviderKey.HUBEAU);
    expect(config.hubeauTimeoutMs).toBe(8000);
    expect(config.hubeauCacheTtlSeconds).toBe(3600);
    expect(config.hubeauMaxSamples).toBe(50);
    expect(config.hubeauCommunesUdiSize).toBe(10);
    expect(config.hubeauResultatsDisSize).toBe(100);
  });
});

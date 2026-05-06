import { WaterProviderKey } from '../water/domain/enums/water-provider-key.enum';
import { waterConfig } from './water.config';

describe('waterConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.HUBEAU_TIMEOUT_MS;
    delete process.env.HUBEAU_CACHE_TTL_SECONDS;
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

  it('should parse valid env values for tunables (timeout, cache TTL)', () => {
    process.env.HUBEAU_TIMEOUT_MS = '15000';
    process.env.HUBEAU_CACHE_TTL_SECONDS = '7200';

    const config = waterConfig();

    expect(config.hubeauTimeoutMs).toBe(15000);
    expect(config.hubeauCacheTtlSeconds).toBe(7200);
  });

  it('should fallback to defaults on invalid env values', () => {
    process.env.HUBEAU_TIMEOUT_MS = '-42';
    process.env.HUBEAU_CACHE_TTL_SECONDS = 'abc';

    const config = waterConfig();

    expect(config.hubeauTimeoutMs).toBe(8000);
    expect(config.hubeauCacheTtlSeconds).toBe(3600);
  });
});

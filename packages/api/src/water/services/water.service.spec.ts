import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WATER_CONFIG, WATER_PROVIDERS } from '../water.constants';

import type { WaterConfig } from '../../config/water.config';
import { WaterConformity } from '../domain/enums/water-conformity.enum';
import { WaterMeasurementCacheService } from './water-measurement-cache.service';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';
import type {
  WaterQualityProviderPort,
  WaterSample,
} from '../domain/ports/water-quality-provider.port';
import { WaterService } from './water.service';

const waterConfigFixture: WaterConfig = {
  defaultProvider: WaterProviderKey.HUBEAU,
  hubeauBaseUrl: 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable',
  hubeauTimeoutMs: 8000,
  hubeauCacheTtlSeconds: 3600,
  hubeauMaxSamples: 50,
  hubeauCommunesUdiSize: 10,
  hubeauResultatsDisSize: 100,
};

const sample = (overrides: Partial<WaterSample> = {}): WaterSample => ({
  parameterLabel: 'Calcium',
  numericResult: 50,
  conformity: 'C',
  parameterCode: '1374',
  datePrelevement: '2024-03-15',
  codePrelevement: 'P-1',
  ...overrides,
});

describe('WaterService (slice-2 cache-backed)', () => {
  let module: TestingModule;
  let service: WaterService;

  const findDominantNetworkByInsee = jest.fn();
  const getNetworkSamples = jest.fn();
  const getNetworkLatestSampleDate = jest.fn();

  const getStoredMaxDate = jest.fn();
  const appendMeasurements = jest.fn();
  const readSamples = jest.fn();

  const providerMock: WaterQualityProviderPort = {
    key: WaterProviderKey.HUBEAU,
    findDominantNetworkByInsee,
    getNetworkSamples,
    getNetworkLatestSampleDate,
  };

  const cacheMock: Pick<
    WaterMeasurementCacheService,
    'getStoredMaxDate' | 'appendMeasurements' | 'readSamples'
  > = {
    getStoredMaxDate,
    appendMeasurements,
    readSamples,
  };

  beforeEach(async () => {
    [
      findDominantNetworkByInsee,
      getNetworkSamples,
      getNetworkLatestSampleDate,
      getStoredMaxDate,
      appendMeasurements,
      readSamples,
    ].forEach((fn) => fn.mockReset());

    // Sensible defaults; individual tests override.
    findDominantNetworkByInsee.mockResolvedValue({
      code: 'UDI-001',
      name: 'NANTES SUD',
    });
    getNetworkLatestSampleDate.mockResolvedValue('2024-03-15');
    getStoredMaxDate.mockResolvedValue(null);
    getNetworkSamples.mockResolvedValue([sample()]);
    appendMeasurements.mockResolvedValue(undefined);
    readSamples.mockResolvedValue([sample()]);

    module = await Test.createTestingModule({
      providers: [
        WaterService,
        { provide: WATER_CONFIG, useValue: waterConfigFixture },
        { provide: WATER_PROVIDERS, useValue: [providerMock] },
        { provide: WaterMeasurementCacheService, useValue: cacheMock },
      ],
    }).compile();

    service = module.get(WaterService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('happy: syncs when Hub’Eau is newer, appends, and serves the profile from the DB', async () => {
    getStoredMaxDate.mockResolvedValue(null); // empty cache → stale
    readSamples.mockResolvedValue([
      sample({ parameterLabel: 'Calcium', numericResult: 50 }),
      sample({
        parameterLabel: 'Magnesium',
        numericResult: 8,
        parameterCode: '1372',
        codePrelevement: 'P-2',
      }),
    ]);

    const profile = await service.getWaterProfile({
      codeInsee: '44109',
      year: 2024,
    });

    expect(getNetworkLatestSampleDate).toHaveBeenCalledWith({
      networkCode: 'UDI-001',
      year: 2024,
    });
    expect(getNetworkSamples).toHaveBeenCalledWith({
      networkCode: 'UDI-001',
      year: 2024,
      size: 100,
    });
    // The fetched samples flow through to the cache verbatim (not just "an array").
    expect(appendMeasurements).toHaveBeenCalledWith('UDI-001', [
      expect.objectContaining({
        parameterCode: '1374',
        codePrelevement: 'P-1',
      }),
    ]);
    expect(readSamples).toHaveBeenCalledWith({
      networkCode: 'UDI-001',
      year: 2024,
      limit: 100,
    });
    expect(profile.networkName).toBe('NANTES SUD');
    expect(profile.conformity).toBe(WaterConformity.C);
    expect(profile.mineralsMgL.ca).toBe(50);
    expect(profile.freshnessDate).toBe('2024-03-15');
  });

  it('edge: syncs incrementally when the cache is non-empty but older than Hub’Eau', async () => {
    getStoredMaxDate.mockResolvedValue('2024-01-05'); // we hold data …
    getNetworkLatestSampleDate.mockResolvedValue('2024-03-15'); // … but Hub’Eau is newer

    await service.getWaterProfile({ codeInsee: '44109', year: 2024 });

    expect(getNetworkSamples).toHaveBeenCalledTimes(1);
    expect(appendMeasurements).toHaveBeenCalledTimes(1);
  });

  it('edge: end-to-end freshness reflects the newest date across the read samples', async () => {
    readSamples.mockResolvedValue([
      sample({ datePrelevement: '2024-02-01', codePrelevement: 'A' }),
      sample({ datePrelevement: '2024-11-20', codePrelevement: 'B' }),
      sample({ datePrelevement: '2024-06-10', codePrelevement: 'C' }),
    ]);

    const profile = await service.getWaterProfile({
      codeInsee: '44109',
      year: 2024,
    });

    expect(profile.freshnessDate).toBe('2024-11-20');
  });

  it('edge: skips the full fetch when the DB is already current', async () => {
    getStoredMaxDate.mockResolvedValue('2024-03-15'); // == Hub’Eau latest

    await service.getWaterProfile({ codeInsee: '44109', year: 2024 });

    expect(getNetworkSamples).not.toHaveBeenCalled();
    expect(appendMeasurements).not.toHaveBeenCalled();
    expect(readSamples).toHaveBeenCalled();
  });

  it('edge: serves the in-memory cache on a repeated identical request', async () => {
    await service.getWaterProfile({ codeInsee: '44109', year: 2024 });
    await service.getWaterProfile({ codeInsee: '44109', year: 2024 });

    expect(findDominantNetworkByInsee).toHaveBeenCalledTimes(1);
    expect(getNetworkLatestSampleDate).toHaveBeenCalledTimes(1);
    expect(readSamples).toHaveBeenCalledTimes(1);
  });

  it('resilience: falls back to the DB when the Hub’Eau date-check fails', async () => {
    getNetworkLatestSampleDate.mockRejectedValue(
      new BadGatewayException("Hub'Eau request failed"),
    );
    readSamples.mockResolvedValue([sample()]);

    const profile = await service.getWaterProfile({
      codeInsee: '44109',
      year: 2024,
    });

    expect(getNetworkSamples).not.toHaveBeenCalled();
    expect(appendMeasurements).not.toHaveBeenCalled();
    expect(profile.mineralsMgL.ca).toBe(50);
  });

  it('resilience: falls back to the DB when the full fetch fails after a positive date-check', async () => {
    getStoredMaxDate.mockResolvedValue(null); // stale → would fetch
    getNetworkSamples.mockRejectedValue(
      new BadGatewayException("Hub'Eau request timed out"),
    );
    readSamples.mockResolvedValue([sample()]);

    const profile = await service.getWaterProfile({
      codeInsee: '44109',
      year: 2024,
    });

    expect(appendMeasurements).not.toHaveBeenCalled();
    expect(profile.mineralsMgL.ca).toBe(50);
  });

  it('sad: throws NotFound when neither Hub’Eau nor the DB has data', async () => {
    getNetworkLatestSampleDate.mockResolvedValue(null); // Hub’Eau empty
    readSamples.mockResolvedValue([]); // DB empty

    await expect(
      service.getWaterProfile({ codeInsee: '44109', year: 2024 }),
    ).rejects.toThrow(NotFoundException);
    expect(getNetworkSamples).not.toHaveBeenCalled();
  });

  it('sad: surfaces the Hub’Eau outage (not 404) when the date-check fails and nothing is cached', async () => {
    getNetworkLatestSampleDate.mockRejectedValue(
      new BadGatewayException("Hub'Eau request failed"),
    );
    readSamples.mockResolvedValue([]); // empty cache → no fallback

    await expect(
      service.getWaterProfile({ codeInsee: '44109', year: 2024 }),
    ).rejects.toThrow(BadGatewayException);
  });

  it('sad: surfaces the Hub’Eau outage when the full fetch fails and nothing is cached', async () => {
    getStoredMaxDate.mockResolvedValue(null); // stale → would fetch
    getNetworkSamples.mockRejectedValue(
      new BadGatewayException("Hub'Eau request timed out"),
    );
    readSamples.mockResolvedValue([]); // empty cache → no fallback

    await expect(
      service.getWaterProfile({ codeInsee: '44109', year: 2024 }),
    ).rejects.toThrow(BadGatewayException);
  });

  it('sad: throws NotFound when no network is found', async () => {
    findDominantNetworkByInsee.mockResolvedValue(null);

    await expect(
      service.getWaterProfile({ codeInsee: '44109', year: 2024 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('sad: throws BadGateway when the provider key is unsupported', async () => {
    await expect(
      service.getWaterProfile({
        codeInsee: '44109',
        year: 2024,
        provider: 'unknown' as WaterProviderKey,
      }),
    ).rejects.toThrow(BadGatewayException);
  });
});

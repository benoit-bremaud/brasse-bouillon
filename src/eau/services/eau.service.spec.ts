import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { EAU_CONFIG, WATER_PROVIDERS } from '../eau.constants';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@nestjs/config';
import type { EauConfig } from '../../config/eau.config';
import { EauService } from './eau.service';
import { WaterConformity } from '../domain/enums/water-conformity.enum';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';
import type { WaterQualityProviderPort } from '../domain/ports/water-quality-provider.port';

const eauConfigFixture: EauConfig = {
  defaultProvider: WaterProviderKey.HUBEAU,
  hubeauBaseUrl: 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable',
  hubeauTimeoutMs: 8000,
  hubeauCacheTtlSeconds: 3600,
  hubeauMaxSamples: 50,
  hubeauCommunesUdiSize: 10,
  hubeauResultatsDisSize: 100,
};

describe('EauService', () => {
  let module: TestingModule;
  let service: EauService;

  const findDominantNetworkByInsee = jest.fn();
  const getNetworkSamples = jest.fn();

  const providerMock: WaterQualityProviderPort = {
    key: WaterProviderKey.HUBEAU,
    findDominantNetworkByInsee,
    getNetworkSamples,
  };

  beforeEach(async () => {
    findDominantNetworkByInsee.mockReset();
    getNetworkSamples.mockReset();

    module = await Test.createTestingModule({
      providers: [
        EauService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
        {
          provide: EAU_CONFIG,
          useValue: eauConfigFixture,
        },
        {
          provide: WATER_PROVIDERS,
          useValue: [providerMock],
        },
      ],
    }).compile();

    service = module.get(EauService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should build a water profile from provider data', async () => {
    findDominantNetworkByInsee.mockResolvedValue({
      code: 'UDI-001',
      name: 'NANTES SUD',
    });
    getNetworkSamples.mockResolvedValue([
      {
        parameterLabel: 'Calcium',
        numericResult: 50,
        conformity: 'C',
      },
      {
        parameterLabel: 'Magnésium',
        numericResult: 8,
        conformity: 'C',
      },
    ]);

    const profile = await service.getWaterProfile({
      codeInsee: '44109',
      annee: 2024,
    });

    expect(findDominantNetworkByInsee).toHaveBeenCalledWith('44109');
    expect(getNetworkSamples).toHaveBeenCalledWith({
      networkCode: 'UDI-001',
      year: 2024,
      size: 100,
    });

    expect(profile.provider).toBe(WaterProviderKey.HUBEAU);
    expect(profile.codeInsee).toBe('44109');
    expect(profile.annee).toBe(2024);
    expect(profile.nomReseau).toBe('NANTES SUD');
    expect(profile.conformite).toBe(WaterConformity.C);
  });

  it('should cache results for identical requests', async () => {
    findDominantNetworkByInsee.mockResolvedValue({
      code: 'UDI-001',
      name: 'NANTES SUD',
    });
    getNetworkSamples.mockResolvedValue([
      {
        parameterLabel: 'Calcium',
        numericResult: 50,
        conformity: 'C',
      },
    ]);

    await service.getWaterProfile({
      codeInsee: '44109',
      annee: 2024,
    });
    await service.getWaterProfile({
      codeInsee: '44109',
      annee: 2024,
    });

    expect(findDominantNetworkByInsee).toHaveBeenCalledTimes(1);
    expect(getNetworkSamples).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFound when no network is found', async () => {
    findDominantNetworkByInsee.mockResolvedValue(null);

    await expect(
      service.getWaterProfile({ codeInsee: '44109', annee: 2024 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFound when no sample is available', async () => {
    findDominantNetworkByInsee.mockResolvedValue({
      code: 'UDI-001',
      name: 'NANTES SUD',
    });
    getNetworkSamples.mockResolvedValue([]);

    await expect(
      service.getWaterProfile({ codeInsee: '44109', annee: 2024 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadGateway when provider key is unsupported', async () => {
    await expect(
      service.getWaterProfile({
        codeInsee: '44109',
        annee: 2024,
        provider: 'unknown' as WaterProviderKey,
      }),
    ).rejects.toThrow(BadGatewayException);
  });
});

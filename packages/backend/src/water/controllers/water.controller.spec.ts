import { Test, TestingModule } from '@nestjs/testing';

import { WaterConformity } from '../domain/enums/water-conformity.enum';
import { WaterController } from './water.controller';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';
import { WaterService } from '../services/water.service';

describe('WaterController', () => {
  let controller: WaterController;
  const getWaterProfile = jest.fn();

  beforeEach(async () => {
    getWaterProfile.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterController],
      providers: [
        {
          provide: WaterService,
          useValue: {
            getWaterProfile,
          },
        },
      ],
    }).compile();

    controller = module.get(WaterController);
  });

  it('should map query params to service input and return DTO', async () => {
    getWaterProfile.mockResolvedValue({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '44109',
      year: 2024,
      networkName: 'NANTES SUD',
      sampleCount: 15,
      conformity: WaterConformity.C,
      mineralsMgL: {
        ca: 52,
        mg: 8,
        cl: 31,
        so4: 27,
        hco3: 141,
      },
      hardnessFrench: 55.3,
    });

    const result = await controller.getWaterProfile(
      {
        id: 'user-1',
      } as never,
      {
        codeInsee: '44109',
        year: 2024,
        provider: WaterProviderKey.HUBEAU,
      },
    );

    expect(getWaterProfile).toHaveBeenCalledWith({
      codeInsee: '44109',
      year: 2024,
      provider: WaterProviderKey.HUBEAU,
    });
    expect(result).toEqual({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '44109',
      year: 2024,
      networkName: 'NANTES SUD',
      sampleCount: 15,
      conformity: WaterConformity.C,
      mineralsMgL: {
        ca: 52,
        mg: 8,
        cl: 31,
        so4: 27,
        hco3: 141,
      },
      hardnessFrench: 55.3,
    });
  });
});

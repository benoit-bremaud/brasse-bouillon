import { Test, TestingModule } from '@nestjs/testing';

import { EauController } from './eau.controller';
import { EauService } from '../services/eau.service';
import { WaterConformity } from '../domain/enums/water-conformity.enum';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';

describe('EauController', () => {
  let controller: EauController;
  const getWaterProfile = jest.fn();

  beforeEach(async () => {
    getWaterProfile.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EauController],
      providers: [
        {
          provide: EauService,
          useValue: {
            getWaterProfile,
          },
        },
      ],
    }).compile();

    controller = module.get(EauController);
  });

  it('should map query params to service input and return DTO', async () => {
    getWaterProfile.mockResolvedValue({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '44109',
      annee: 2024,
      nomReseau: 'NANTES SUD',
      nbPrelevements: 15,
      conformite: WaterConformity.C,
      minerauxMgL: {
        ca: 52,
        mg: 8,
        cl: 31,
        so4: 27,
        hco3: 141,
      },
      dureteFrancais: 55.3,
    });

    const result = await controller.getWaterProfile(
      {
        id: 'user-1',
      } as never,
      {
        codeInsee: '44109',
        annee: 2024,
        provider: WaterProviderKey.HUBEAU,
      },
    );

    expect(getWaterProfile).toHaveBeenCalledWith({
      codeInsee: '44109',
      annee: 2024,
      provider: WaterProviderKey.HUBEAU,
    });
    expect(result).toEqual({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '44109',
      annee: 2024,
      nomReseau: 'NANTES SUD',
      nbPrelevements: 15,
      conformite: WaterConformity.C,
      minerauxMgL: {
        ca: 52,
        mg: 8,
        cl: 31,
        so4: 27,
        hco3: 141,
      },
      dureteFrancais: 55.3,
    });
  });
});

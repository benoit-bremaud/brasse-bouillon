import { MiscType, MiscUseAt } from '../../domain/misc-template.types';
import { Test, TestingModule } from '@nestjs/testing';

import { MiscCatalogController } from '../misc-catalog.controller';
import { MiscCatalogService } from '../../services/misc-catalog.service';
import { MiscTemplateOrmEntity } from '../../entities/misc-template.orm.entity';
import { NotFoundException } from '@nestjs/common';

describe('MiscCatalogController', () => {
  let controller: MiscCatalogController;
  let service: MiscCatalogService;

  const ID_CORIANDER = '00000000-0000-4000-9000-700000000005';

  function buildEntity(
    overrides: Partial<MiscTemplateOrmEntity> = {},
  ): MiscTemplateOrmEntity {
    return {
      id: ID_CORIANDER,
      name: 'Coriandre (graines)',
      type: MiscType.Spice,
      use_at: MiscUseAt.Boil,
      amount: 0.02,
      amount_is_weight: true,
      time_min: 10,
      use_for: 'Belgian Wit',
      notes: "Compagnon obligatoire de l'Orange amère pour la Witbier.",
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MiscCatalogController],
      providers: [
        {
          provide: MiscCatalogService,
          useValue: { list: jest.fn(), getById: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(MiscCatalogController);
    service = module.get(MiscCatalogService);
  });

  describe('GET /catalog/misc-templates', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ name: 'Coriandre (graines)' }),
        buildEntity({
          id: '00000000-0000-4000-9000-700000000006',
          name: 'Lactose',
          type: MiscType.Other,
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith();
      expect(result.map((r) => r.name)).toEqual([
        'Coriandre (graines)',
        'Lactose',
      ]);
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);
      const result = await controller.list();
      expect(result).toEqual([]);
    });
  });

  describe('GET /catalog/misc-templates/:id', () => {
    it('happy: returns the DTO for the matching template', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_CORIANDER);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_CORIANDER);
      expect(result.id).toBe(ID_CORIANDER);
      expect(result.type).toBe(MiscType.Spice);
      expect(result.use_at).toBe(MiscUseAt.Boil);
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Misc template catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-7000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_CORIANDER);
      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('MiscTemplateDto');
    });
  });
});

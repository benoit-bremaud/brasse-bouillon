import { Test, TestingModule } from '@nestjs/testing';

import { EquipmentCatalogController } from '../equipment-catalog.controller';
import { EquipmentCatalogService } from '../../services/equipment-catalog.service';
import { EquipmentTemplateOrmEntity } from '../../entities/equipment-template.orm.entity';
import { NotFoundException } from '@nestjs/common';

describe('EquipmentCatalogController', () => {
  let controller: EquipmentCatalogController;
  let service: EquipmentCatalogService;

  const ID_GRAINFATHER = '00000000-0000-4000-9000-600000000005';

  function buildEntity(
    overrides: Partial<EquipmentTemplateOrmEntity> = {},
  ): EquipmentTemplateOrmEntity {
    return {
      id: ID_GRAINFATHER,
      name: 'Grainfather G30 (electric all-in-one)',
      boil_size_l: 30,
      batch_size_l: 23,
      tun_volume_l: 30,
      tun_weight_kg: 4,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 1,
      evap_rate_percent: 9,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 1,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes: 'Système électrique tout-en-un néo-zélandais.',
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentCatalogController],
      providers: [
        {
          provide: EquipmentCatalogService,
          useValue: { list: jest.fn(), getById: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(EquipmentCatalogController);
    service = module.get(EquipmentCatalogService);
  });

  describe('GET /catalog/equipment-templates', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ name: 'Grainfather G30 (electric all-in-one)' }),
        buildEntity({
          id: '00000000-0000-4000-9000-600000000003',
          name: 'BIAB 20L (Brew In A Bag, entry-level)',
          batch_size_l: 19,
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith();
      expect(result.map((r) => r.name)).toEqual([
        'Grainfather G30 (electric all-in-one)',
        'BIAB 20L (Brew In A Bag, entry-level)',
      ]);
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);
      const result = await controller.list();
      expect(result).toEqual([]);
    });
  });

  describe('GET /catalog/equipment-templates/:id', () => {
    it('happy: returns the DTO for the matching template', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_GRAINFATHER);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_GRAINFATHER);
      expect(result.id).toBe(ID_GRAINFATHER);
      expect(result.batch_size_l).toBe(23);
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Equipment template catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-6000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_GRAINFATHER);
      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('EquipmentTemplateDto');
    });
  });
});

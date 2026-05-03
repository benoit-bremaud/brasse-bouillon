import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { YeastCatalogController } from '../yeast-catalog.controller';
import { YeastCatalogService } from '../../services/yeast-catalog.service';
import { YeastFlocculation } from '../../domain/enums/yeast-flocculation.enum';
import { YeastForm } from '../../domain/enums/yeast-form.enum';
import { YeastOrmEntity } from '../../entities/yeast.orm.entity';
import { YeastType } from '../../domain/enums/yeast-type.enum';

/**
 * Controller spec for the yeast catalogue. Mocks the service
 * layer so the test isolates the HTTP-shape mapping (URL → service
 * call → DTO transform) from the service's database concerns
 * covered in `yeast-catalog.service.spec.ts`. Service methods are
 * spied via `jest.spyOn` so eslint's
 * `@typescript-eslint/unbound-method` rule does not fire.
 */
describe('YeastCatalogController', () => {
  let controller: YeastCatalogController;
  let service: YeastCatalogService;

  const ID_US05 = '00000000-0000-4000-9000-200000000006';

  function buildEntity(
    overrides: Partial<YeastOrmEntity> = {},
  ): YeastOrmEntity {
    return {
      id: ID_US05,
      name: 'Safale US-05',
      type: YeastType.ALE,
      form: YeastForm.DRY,
      producer_id: '00000000-0000-4000-9000-800000000002',
      product_code: 'US-05',
      min_temperature_c: 15,
      max_temperature_c: 22,
      flocculation: YeastFlocculation.MEDIUM,
      attenuation_percent_typical: 81,
      notes: 'Levure sèche neutre par excellence.',
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YeastCatalogController],
      providers: [
        {
          provide: YeastCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(YeastCatalogController);
    service = module.get(YeastCatalogService);
  });

  describe('GET /catalog/yeasts', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ id: ID_US05, name: 'Safale US-05' }),
        buildEntity({
          id: '00000000-0000-4000-9000-200000000008',
          name: 'Saflager W-34/70',
          type: YeastType.LAGER,
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith({
        type: undefined,
        form: undefined,
      });
      expect(result.map((r) => r.name)).toEqual([
        'Safale US-05',
        'Saflager W-34/70',
      ]);
      // DTO must serialise dates to ISO strings — never raw Date.
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);

      const result = await controller.list();
      expect(result).toEqual([]);
    });

    it('edge: forwards the type and form query filters to the service', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([]);

      await controller.list(YeastType.LAGER, YeastForm.DRY);

      expect(listSpy).toHaveBeenCalledWith({
        type: YeastType.LAGER,
        form: YeastForm.DRY,
      });
    });
  });

  describe('GET /catalog/yeasts/:id', () => {
    it('happy: returns the DTO for the matching yeast', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_US05);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_US05);
      expect(result.id).toBe(ID_US05);
      expect(result.name).toBe('Safale US-05');
    });

    it('sad: lets a NotFoundException from the service propagate to the HTTP layer', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Yeast catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-2000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_US05);

      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('YeastDto');
    });
  });
});

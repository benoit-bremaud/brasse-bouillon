import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { WaterCatalogController } from '../water-catalog.controller';
import { WaterCatalogService } from '../../services/water-catalog.service';
import { WaterOrmEntity } from '../../entities/water.orm.entity';

/**
 * Controller spec for the brewing water catalogue. Mocks the
 * service layer so the test isolates the HTTP-shape mapping
 * (URL → service call → DTO transform) from the database concerns
 * covered in `water-catalog.service.spec.ts`.
 */
describe('WaterCatalogController', () => {
  let controller: WaterCatalogController;
  let service: WaterCatalogService;

  const ID_BURTON = '00000000-0000-4000-9000-500000000001';

  function buildEntity(
    overrides: Partial<WaterOrmEntity> = {},
  ): WaterOrmEntity {
    return {
      id: ID_BURTON,
      name: 'Burton on Trent, UK',
      origin: 'United Kingdom',
      calcium_ppm: 295,
      bicarbonate_ppm: 300,
      sulfate_ppm: 725,
      chloride_ppm: 25,
      sodium_ppm: 55,
      magnesium_ppm: 45,
      ph: 8,
      notes: "Eau historique de Burton-on-Trent, berceau de l'IPA.",
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaterCatalogController],
      providers: [
        {
          provide: WaterCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(WaterCatalogController);
    service = module.get(WaterCatalogService);
  });

  describe('GET /catalog/waters', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ id: ID_BURTON, name: 'Burton on Trent, UK' }),
        buildEntity({
          id: '00000000-0000-4000-9000-500000000005',
          name: 'Pilsen, Czech Republic',
          sulfate_ppm: 5,
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith();
      expect(result.map((r) => r.name)).toEqual([
        'Burton on Trent, UK',
        'Pilsen, Czech Republic',
      ]);
      // DTO must serialise dates to ISO strings — never raw Date.
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);
      const result = await controller.list();
      expect(result).toEqual([]);
    });
  });

  describe('GET /catalog/waters/:id', () => {
    it('happy: returns the DTO for the matching water', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_BURTON);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_BURTON);
      expect(result.id).toBe(ID_BURTON);
      expect(result.sulfate_ppm).toBe(725);
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new NotFoundException('Water profile not found'));

      await expect(
        controller.getById('00000000-0000-4000-9000-5000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_BURTON);
      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('WaterDto');
    });
  });
});

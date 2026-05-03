import { Test, TestingModule } from '@nestjs/testing';

import { HopCatalogController } from '../hop-catalog.controller';
import { HopCatalogService } from '../../services/hop-catalog.service';
import { HopForm } from '../../domain/enums/hop-form.enum';
import { HopOrmEntity } from '../../entities/hop.orm.entity';
import { HopUsageType } from '../../domain/enums/hop-usage-type.enum';
import { NotFoundException } from '@nestjs/common';

/**
 * Controller spec for the hop catalogue. Mocks the service layer so
 * the test isolates the HTTP-shape mapping (URL → service call →
 * DTO transform) from the service's database concerns covered in
 * `hop-catalog.service.spec.ts`. Service methods are spied via
 * `jest.spyOn` so eslint's `@typescript-eslint/unbound-method` rule
 * does not fire on the assertions (matches the convention used by
 * `recipe-ingredients.controller.spec.ts`).
 */
describe('HopCatalogController', () => {
  let controller: HopCatalogController;
  let service: HopCatalogService;

  const ID_CASCADE = '00000000-0000-4000-9000-000000000001';

  function buildEntity(overrides: Partial<HopOrmEntity> = {}): HopOrmEntity {
    return {
      id: ID_CASCADE,
      name: 'Cascade',
      origin: 'United States',
      alpha_acid_typical: 5.5,
      beta_acid_typical: 6,
      hop_stability_index: 50,
      usage_type: HopUsageType.BOTH,
      form: HopForm.PELLET,
      notes: "Houblon emblématique de l'IPA américaine.",
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HopCatalogController],
      providers: [
        {
          provide: HopCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(HopCatalogController);
    service = module.get(HopCatalogService);
  });

  describe('GET /catalog/hops', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ id: ID_CASCADE, name: 'Cascade' }),
        buildEntity({
          id: '00000000-0000-4000-9000-000000000002',
          name: 'Galena',
          usage_type: HopUsageType.BITTERING,
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith({
        usage_type: undefined,
        form: undefined,
      });
      expect(result.map((r) => r.name)).toEqual(['Cascade', 'Galena']);
      // DTO must serialise dates to ISO strings — never raw Date.
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);

      const result = await controller.list();
      expect(result).toEqual([]);
    });

    it('edge: forwards the usage_type and form query filters to the service', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([]);

      await controller.list(HopUsageType.AROMA, HopForm.LEAF);

      expect(listSpy).toHaveBeenCalledWith({
        usage_type: HopUsageType.AROMA,
        form: HopForm.LEAF,
      });
    });
  });

  describe('GET /catalog/hops/:id', () => {
    it('happy: returns the DTO for the matching hop', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_CASCADE);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_CASCADE);
      expect(result.id).toBe(ID_CASCADE);
      expect(result.name).toBe('Cascade');
    });

    it('sad: lets a NotFoundException from the service propagate to the HTTP layer', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Hop catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-0000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_CASCADE);

      // The DTO is a separate object — never the entity itself.
      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('HopDto');
    });
  });
});

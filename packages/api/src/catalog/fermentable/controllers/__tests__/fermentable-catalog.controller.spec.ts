import { Test, TestingModule } from '@nestjs/testing';

import { DistributorOrmEntity } from '../../../distributor/entities/distributor.orm.entity';
import { FermentableCatalogController } from '../fermentable-catalog.controller';
import { FermentableCatalogService } from '../../services/fermentable-catalog.service';
import { FermentableDistributorOrmEntity } from '../../entities/fermentable-distributor.orm.entity';
import { FermentableOrmEntity } from '../../entities/fermentable.orm.entity';
import { FermentableType } from '../../domain/enums/fermentable-type.enum';
import { NotFoundException } from '@nestjs/common';

/**
 * Controller spec for the fermentable catalogue. Mocks the service
 * layer so the test isolates the HTTP-shape mapping (URL → service
 * call → DTO transform) from the service's database concerns
 * covered in `fermentable-catalog.service.spec.ts`. Service methods
 * are spied via `jest.spyOn` so eslint's
 * `@typescript-eslint/unbound-method` rule does not fire.
 */
describe('FermentableCatalogController', () => {
  let controller: FermentableCatalogController;
  let service: FermentableCatalogService;

  const ID_PALE = '00000000-0000-4000-9000-100000000005';

  function buildEntity(
    overrides: Partial<FermentableOrmEntity> = {},
  ): FermentableOrmEntity {
    return {
      id: ID_PALE,
      name: 'Pale Ale Malt (US 2-Row)',
      type: FermentableType.GRAIN,
      origin: 'United States',
      color_ebc_typical: 5.9,
      potential_gravity_typical: 1.037,
      yield_percent_typical: 80,
      diastatic_power_lintner: 100,
      max_in_batch_percent: 100,
      recommend_mash: true,
      notes: 'Malt de base américain à 2 rangs.',
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  function buildDistributor(
    overrides: Partial<DistributorOrmEntity> = {},
  ): DistributorOrmEntity {
    return {
      id: '00000000-0000-4000-9000-900000000003',
      name: 'Brouwland',
      country: 'BE',
      website: 'https://www.brouwland.com',
      ships_to: JSON.stringify(['BE', 'FR', 'NL']),
      currency_default: 'EUR',
      notes: null,
      created_at: new Date('2026-05-04T00:00:00.000Z'),
      updated_at: new Date('2026-05-04T00:00:00.000Z'),
      ...overrides,
    };
  }

  function buildJunction(
    overrides: Partial<FermentableDistributorOrmEntity> = {},
  ): FermentableDistributorOrmEntity {
    return {
      fermentable_id: ID_PALE,
      distributor_id: '00000000-0000-4000-9000-900000000003',
      product_url: 'https://www.brouwland.com/pale-ale-malt-25kg',
      sku: 'BRW-PALE-25',
      notes_per_distributor: null,
      created_at: new Date('2026-05-04T00:00:00.000Z'),
      updated_at: new Date('2026-05-04T00:00:00.000Z'),
      fermentable: buildEntity(),
      distributor: buildDistributor(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FermentableCatalogController],
      providers: [
        {
          provide: FermentableCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
            getDistributors: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(FermentableCatalogController);
    service = module.get(FermentableCatalogService);
  });

  describe('GET /catalog/fermentables', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ id: ID_PALE, name: 'Pale Ale Malt (US 2-Row)' }),
        buildEntity({
          id: '00000000-0000-4000-9000-100000000011',
          name: 'Sucrose',
          type: FermentableType.SUGAR,
          recommend_mash: false,
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith({ type: undefined });
      expect(result.map((r) => r.name)).toEqual([
        'Pale Ale Malt (US 2-Row)',
        'Sucrose',
      ]);
      // DTO must serialise dates to ISO strings — never raw Date.
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);

      const result = await controller.list();
      expect(result).toEqual([]);
    });

    it('edge: forwards the type query filter to the service', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([]);

      await controller.list(FermentableType.SUGAR);

      expect(listSpy).toHaveBeenCalledWith({ type: FermentableType.SUGAR });
    });
  });

  describe('GET /catalog/fermentables/:id', () => {
    it('happy: returns the DTO for the matching fermentable', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_PALE);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_PALE);
      expect(result.id).toBe(ID_PALE);
      expect(result.name).toBe('Pale Ale Malt (US 2-Row)');
    });

    it('sad: lets a NotFoundException from the service propagate to the HTTP layer', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Fermentable catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-1000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_PALE);

      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('FermentableDto');
    });
  });

  describe('GET /catalog/fermentables/:id/distributors (Issue #901)', () => {
    it('happy: maps junction rows to CatalogDistributorLinkDto with distributor nested', async () => {
      const getDistributorsSpy = jest
        .spyOn(service, 'getDistributors')
        .mockResolvedValue([buildJunction()]);

      const result = await controller.getDistributors(ID_PALE);

      expect(getDistributorsSpy).toHaveBeenCalledWith(ID_PALE);
      expect(result).toHaveLength(1);
      expect(result[0].product_url).toBe(
        'https://www.brouwland.com/pale-ale-malt-25kg',
      );
      expect(result[0].sku).toBe('BRW-PALE-25');
      expect(result[0].distributor.name).toBe('Brouwland');
      expect(result[0].distributor.ships_to).toEqual(['BE', 'FR', 'NL']);
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getDistributors')
        .mockRejectedValue(
          new NotFoundException('Fermentable catalogue entry not found'),
        );

      await expect(
        controller.getDistributors('00000000-0000-4000-9000-1000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

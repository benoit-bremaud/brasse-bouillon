import { MiscType, MiscUseAt } from '../../domain/misc-template.types';
import { Test, TestingModule } from '@nestjs/testing';

import { DistributorOrmEntity } from '../../../distributor/entities/distributor.orm.entity';
import { MiscCatalogController } from '../misc-catalog.controller';
import { MiscCatalogService } from '../../services/misc-catalog.service';
import { MiscTemplateDistributorOrmEntity } from '../../entities/misc-template-distributor.orm.entity';
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
    overrides: Partial<MiscTemplateDistributorOrmEntity> = {},
  ): MiscTemplateDistributorOrmEntity {
    return {
      misc_template_id: ID_CORIANDER,
      distributor_id: '00000000-0000-4000-9000-900000000003',
      product_url: 'https://www.brouwland.com/coriandre-100g',
      sku: 'BRW-COR-100',
      notes_per_distributor: null,
      created_at: new Date('2026-05-04T00:00:00.000Z'),
      updated_at: new Date('2026-05-04T00:00:00.000Z'),
      misc_template: buildEntity(),
      distributor: buildDistributor(),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MiscCatalogController],
      providers: [
        {
          provide: MiscCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
            getDistributors: jest.fn(),
          },
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

  describe('GET /catalog/misc-templates/:id/distributors (Issue #901)', () => {
    it('happy: maps junction rows to CatalogDistributorLinkDto with distributor nested', async () => {
      const getDistributorsSpy = jest
        .spyOn(service, 'getDistributors')
        .mockResolvedValue([buildJunction()]);

      const result = await controller.getDistributors(ID_CORIANDER);

      expect(getDistributorsSpy).toHaveBeenCalledWith(ID_CORIANDER);
      expect(result).toHaveLength(1);
      expect(result[0].product_url).toBe(
        'https://www.brouwland.com/coriandre-100g',
      );
      expect(result[0].distributor.name).toBe('Brouwland');
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getDistributors')
        .mockRejectedValue(
          new NotFoundException('Misc template catalogue entry not found'),
        );

      await expect(
        controller.getDistributors('00000000-0000-4000-9000-7000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

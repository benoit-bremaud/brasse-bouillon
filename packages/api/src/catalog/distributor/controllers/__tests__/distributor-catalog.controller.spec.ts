import { Test, TestingModule } from '@nestjs/testing';

import { DistributorCatalogController } from '../distributor-catalog.controller';
import { DistributorCatalogService } from '../../services/distributor-catalog.service';
import { DistributorOrmEntity } from '../../entities/distributor.orm.entity';
import { NotFoundException } from '@nestjs/common';

describe('DistributorCatalogController', () => {
  let controller: DistributorCatalogController;
  let service: DistributorCatalogService;

  const ID_BROUWLAND = '00000000-0000-4000-9000-900000000000';

  function buildEntity(
    overrides: Partial<DistributorOrmEntity> = {},
  ): DistributorOrmEntity {
    return {
      id: ID_BROUWLAND,
      name: 'Brouwland',
      country: 'BE',
      website: 'https://www.brouwland.com',
      ships_to: JSON.stringify(['BE', 'FR', 'LU', 'NL']),
      currency_default: 'EUR',
      notes: 'Distributeur belge historique (Beverlo, fondé 1976).',
      created_at: new Date('2026-05-04T00:00:00.000Z'),
      updated_at: new Date('2026-05-04T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DistributorCatalogController],
      providers: [
        {
          provide: DistributorCatalogService,
          useValue: { list: jest.fn(), getById: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(DistributorCatalogController);
    service = module.get(DistributorCatalogService);
  });

  describe('GET /catalog/distributors', () => {
    it('happy: returns the full list mapped to DTOs with ships_to decoded', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ name: 'Brouwland' }),
        buildEntity({
          id: '00000000-0000-4000-9000-900000000001',
          name: 'Hopt',
          country: 'FR',
          ships_to: JSON.stringify(['FR']),
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith();
      expect(result.map((r) => r.name)).toEqual(['Brouwland', 'Hopt']);
      // ships_to is decoded from JSON string to string[] on the wire
      expect(result[0].ships_to).toEqual(['BE', 'FR', 'LU', 'NL']);
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);
      const result = await controller.list();
      expect(result).toEqual([]);
    });
  });

  describe('GET /catalog/distributors/:id', () => {
    it('happy: returns the DTO for the matching distributor', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_BROUWLAND);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_BROUWLAND);
      expect(result.id).toBe(ID_BROUWLAND);
      expect(result.country).toBe('BE');
      expect(result.currency_default).toBe('EUR');
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Distributor catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-9000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_BROUWLAND);
      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('DistributorDto');
    });

    it('edge: ships_to falls back to [] when the stored JSON is corrupted', async () => {
      jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity({ ships_to: 'NOT_VALID_JSON' }));

      const result = await controller.getById(ID_BROUWLAND);
      expect(result.ships_to).toEqual([]);
    });
  });
});

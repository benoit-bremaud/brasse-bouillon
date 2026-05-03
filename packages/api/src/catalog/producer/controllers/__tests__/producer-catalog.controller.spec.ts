import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { ProducerCatalogController } from '../producer-catalog.controller';
import { ProducerOrmEntity } from '../../entities/producer.orm.entity';
import { ProducerCatalogService } from '../../services/producer-catalog.service';
import { ProducerType } from '../../domain/producer.types';

describe('ProducerCatalogController', () => {
  let controller: ProducerCatalogController;
  let service: ProducerCatalogService;

  const ID_WYEAST = '00000000-0000-4000-9000-800000000000';

  function buildEntity(
    overrides: Partial<ProducerOrmEntity> = {},
  ): ProducerOrmEntity {
    return {
      id: ID_WYEAST,
      name: 'Wyeast Labs',
      type: ProducerType.Laboratory,
      country: 'US',
      website: 'https://wyeastlab.com',
      notes: 'Laboratoire américain pionnier des levures liquides.',
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducerCatalogController],
      providers: [
        {
          provide: ProducerCatalogService,
          useValue: { list: jest.fn(), getById: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get(ProducerCatalogController);
    service = module.get(ProducerCatalogService);
  });

  describe('GET /catalog/producers', () => {
    it('happy: returns the full list mapped to DTOs', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildEntity({ name: 'Wyeast Labs' }),
        buildEntity({
          id: '00000000-0000-4000-9000-800000000002',
          name: 'Fermentis',
          country: 'FR',
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith();
      expect(result.map((r) => r.name)).toEqual(['Wyeast Labs', 'Fermentis']);
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);
      const result = await controller.list();
      expect(result).toEqual([]);
    });
  });

  describe('GET /catalog/producers/:id', () => {
    it('happy: returns the DTO for the matching producer', async () => {
      const getByIdSpy = jest
        .spyOn(service, 'getById')
        .mockResolvedValue(buildEntity());

      const result = await controller.getById(ID_WYEAST);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_WYEAST);
      expect(result.id).toBe(ID_WYEAST);
      expect(result.type).toBe(ProducerType.Laboratory);
      expect(result.country).toBe('US');
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(
          new NotFoundException('Producer catalogue entry not found'),
        );

      await expect(
        controller.getById('00000000-0000-4000-9000-8000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildEntity();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_WYEAST);
      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('ProducerDto');
    });
  });
});

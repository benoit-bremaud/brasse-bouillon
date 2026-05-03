jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';
import { ProducerOrmEntity } from '../../entities/producer.orm.entity';
import { ProducerService } from '../producer.service';
import { ProducerType } from '../../domain/producer.types';
import { Repository } from 'typeorm';

describe('ProducerService', () => {
  let module: TestingModule;
  let service: ProducerService;
  let repository: Repository<ProducerOrmEntity>;

  const ID_WYEAST = '00000000-0000-4000-9000-800000000000';
  const ID_FERMENTIS = '00000000-0000-4000-9000-800000000002';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [ProducerOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([ProducerOrmEntity]),
      ],
      providers: [ProducerService],
    }).compile();

    service = module.get(ProducerService);
    repository = module.get(getRepositoryToken(ProducerOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  async function seedProducer(
    id: string,
    name: string,
    type: ProducerType,
    country: string | null,
  ): Promise<ProducerOrmEntity> {
    const entity = repository.create({
      id,
      name,
      type,
      country,
      website: null,
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every producer ordered alphabetically by name', async () => {
      await seedProducer(
        ID_WYEAST,
        'Wyeast Labs',
        ProducerType.Laboratory,
        'US',
      );
      await seedProducer(
        ID_FERMENTIS,
        'Fermentis',
        ProducerType.Laboratory,
        'FR',
      );

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual(['Fermentis', 'Wyeast Labs']);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('happy: returns the producer matching the UUID', async () => {
      await seedProducer(
        ID_WYEAST,
        'Wyeast Labs',
        ProducerType.Laboratory,
        'US',
      );

      const producer = await service.getById(ID_WYEAST);
      expect(producer.name).toBe('Wyeast Labs');
      expect(producer.type).toBe(ProducerType.Laboratory);
      expect(producer.country).toBe('US');
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-8000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedProducer(
        ID_WYEAST,
        'Wyeast Labs',
        ProducerType.Laboratory,
        'US',
      );
      await expect(service.getById('wyeast-labs')).rejects.toThrow();
    });
  });
});

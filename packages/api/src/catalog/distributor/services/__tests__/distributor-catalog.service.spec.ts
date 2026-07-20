jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { DistributorCatalogService } from '../distributor-catalog.service';
import { DistributorOrmEntity } from '../../entities/distributor.orm.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('DistributorCatalogService', () => {
  let module: TestingModule;
  let service: DistributorCatalogService;
  let repository: Repository<DistributorOrmEntity>;

  const ID_BROUWLAND = '00000000-0000-4000-9000-900000000000';
  const ID_HOPT = '00000000-0000-4000-9000-900000000001';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [DistributorOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([DistributorOrmEntity]),
      ],
      providers: [DistributorCatalogService],
    }).compile();

    service = module.get(DistributorCatalogService);
    repository = module.get(getRepositoryToken(DistributorOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  async function seedDistributor(
    id: string,
    name: string,
    country: string,
  ): Promise<DistributorOrmEntity> {
    const entity = repository.create({
      id,
      name,
      country,
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.test`,
      ships_to: JSON.stringify([country]),
      currency_default: 'EUR',
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every distributor ordered alphabetically by name', async () => {
      await seedDistributor(ID_HOPT, 'Hopt', 'FR');
      await seedDistributor(ID_BROUWLAND, 'Brouwland', 'BE');

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual(['Brouwland', 'Hopt']);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('happy: returns the distributor matching the UUID', async () => {
      await seedDistributor(ID_BROUWLAND, 'Brouwland', 'BE');

      const distributor = await service.getById(ID_BROUWLAND);
      expect(distributor.name).toBe('Brouwland');
      expect(distributor.country).toBe('BE');
      expect(distributor.currency_default).toBe('EUR');
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-9000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedDistributor(ID_BROUWLAND, 'Brouwland', 'BE');
      await expect(service.getById('brouwland')).rejects.toThrow();
    });
  });
});

jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { DistributorOrmEntity } from '../../../distributor/entities/distributor.orm.entity';
import { FermentableCatalogService } from '../fermentable-catalog.service';
import { FermentableDistributorOrmEntity } from '../../entities/fermentable-distributor.orm.entity';
import { FermentableOrmEntity } from '../../entities/fermentable.orm.entity';
import { FermentableType } from '../../domain/enums/fermentable-type.enum';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

/**
 * Service spec for the fermentable catalogue (Issue #708 / #869,
 * Phase 1 PR #2). Wires the real ORM entity against an in-memory
 * SQLite so every where-clause and order-clause is exercised
 * end-to-end — mocked repositories would not catch a typo in the
 * column name or a wrong filter combinator.
 */
describe('FermentableCatalogService', () => {
  let module: TestingModule;
  let service: FermentableCatalogService;
  let repository: Repository<FermentableOrmEntity>;
  let distributorRepository: Repository<DistributorOrmEntity>;
  let fermentableDistributorRepository: Repository<FermentableDistributorOrmEntity>;

  const ID_ACID = '00000000-0000-4000-9000-100000000001';
  const ID_PILSNER = '00000000-0000-4000-9000-100000000006';
  const ID_SUCROSE = '00000000-0000-4000-9000-100000000011';
  const ID_BROUWLAND = '00000000-0000-4000-9000-900000000003';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            FermentableOrmEntity,
            DistributorOrmEntity,
            FermentableDistributorOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          FermentableOrmEntity,
          DistributorOrmEntity,
          FermentableDistributorOrmEntity,
        ]),
      ],
      providers: [FermentableCatalogService],
    }).compile();

    service = module.get(FermentableCatalogService);
    repository = module.get(getRepositoryToken(FermentableOrmEntity));
    distributorRepository = module.get(
      getRepositoryToken(DistributorOrmEntity),
    );
    fermentableDistributorRepository = module.get(
      getRepositoryToken(FermentableDistributorOrmEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await fermentableDistributorRepository.clear();
    await repository.clear();
    await distributorRepository.clear();
  });

  async function seedDistributor(
    id: string,
    name: string,
  ): Promise<DistributorOrmEntity> {
    const entity = distributorRepository.create({
      id,
      name,
      country: 'BE',
      website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.test`,
      ships_to: JSON.stringify(['BE']),
      currency_default: 'EUR',
      notes: null,
    });
    return distributorRepository.save(entity);
  }

  async function linkFermentableToDistributor(
    fermentableId: string,
    distributorId: string,
    productUrl: string,
  ): Promise<void> {
    await fermentableDistributorRepository.save(
      fermentableDistributorRepository.create({
        fermentable_id: fermentableId,
        distributor_id: distributorId,
        product_url: productUrl,
        sku: null,
        notes_per_distributor: null,
      }),
    );
  }

  async function seedFermentable(
    id: string,
    name: string,
    type: FermentableType,
  ): Promise<FermentableOrmEntity> {
    const entity = repository.create({
      id,
      name,
      type,
      origin: 'United States',
      color_ebc_typical: 5.9,
      potential_gravity_typical: 1.037,
      yield_percent_typical: 80,
      diastatic_power_lintner: 100,
      max_in_batch_percent: 100,
      recommend_mash: type === FermentableType.GRAIN,
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every fermentable ordered alphabetically by name', async () => {
      await seedFermentable(ID_ACID, 'Acid Malt', FermentableType.GRAIN);
      await seedFermentable(ID_PILSNER, 'Pilsner Malt', FermentableType.GRAIN);
      await seedFermentable(ID_SUCROSE, 'Sucrose', FermentableType.SUGAR);

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual([
        'Acid Malt',
        'Pilsner Malt',
        'Sucrose',
      ]);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });

    it('edge: filters by type when provided', async () => {
      await seedFermentable(ID_ACID, 'Acid Malt', FermentableType.GRAIN);
      await seedFermentable(ID_PILSNER, 'Pilsner Malt', FermentableType.GRAIN);
      await seedFermentable(ID_SUCROSE, 'Sucrose', FermentableType.SUGAR);

      const rows = await service.list({ type: FermentableType.SUGAR });
      expect(rows.map((r) => r.name)).toEqual(['Sucrose']);
    });
  });

  describe('getById()', () => {
    it('happy: returns the fermentable matching the UUID', async () => {
      await seedFermentable(ID_ACID, 'Acid Malt', FermentableType.GRAIN);

      const fermentable = await service.getById(ID_ACID);
      expect(fermentable.name).toBe('Acid Malt');
      expect(fermentable.type).toBe(FermentableType.GRAIN);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-1000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedFermentable(ID_ACID, 'Acid Malt', FermentableType.GRAIN);

      // Strict UUID PK lookup — name-shaped strings still 404.
      await expect(service.getById('acid-malt')).rejects.toThrow();
    });
  });

  describe('getDistributors() — boutique foundation (Issue #901)', () => {
    it('happy: returns the junction rows with the distributor relation eagerly loaded', async () => {
      await seedFermentable(ID_PILSNER, 'Pilsner Malt', FermentableType.GRAIN);
      await seedDistributor(ID_BROUWLAND, 'Brouwland');
      await linkFermentableToDistributor(
        ID_PILSNER,
        ID_BROUWLAND,
        'https://www.brouwland.com/pilsner-malt-25kg',
      );

      const rows = await service.getDistributors(ID_PILSNER);
      expect(rows).toHaveLength(1);
      expect(rows[0].distributor.name).toBe('Brouwland');
      expect(rows[0].product_url).toBe(
        'https://www.brouwland.com/pilsner-malt-25kg',
      );
    });

    it('sad: throws NotFoundException when the fermentable UUID is unknown', async () => {
      await expect(
        service.getDistributors('00000000-0000-4000-9000-1000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: returns [] when the fermentable exists but has no distributors yet', async () => {
      await seedFermentable(ID_PILSNER, 'Pilsner Malt', FermentableType.GRAIN);
      const rows = await service.getDistributors(ID_PILSNER);
      expect(rows).toEqual([]);
    });
  });
});

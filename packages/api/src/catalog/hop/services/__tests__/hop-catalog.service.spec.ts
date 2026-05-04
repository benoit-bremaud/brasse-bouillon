jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { DistributorOrmEntity } from '../../../distributor/entities/distributor.orm.entity';
import { HopCatalogService } from '../hop-catalog.service';
import { HopDistributorOrmEntity } from '../../entities/hop-distributor.orm.entity';
import { HopForm } from '../../domain/enums/hop-form.enum';
import { HopOrmEntity } from '../../entities/hop.orm.entity';
import { HopUsageType } from '../../domain/enums/hop-usage-type.enum';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

/**
 * Service spec for the hop catalogue (Issue #708 / #869, Phase 1
 * PR #1). Wires the real ORM entity against an in-memory SQLite so
 * every where-clause and order-clause is exercised end-to-end —
 * mocked repositories would not catch a typo in the column name or
 * a wrong filter combinator.
 */
describe('HopCatalogService', () => {
  let module: TestingModule;
  let service: HopCatalogService;
  let repository: Repository<HopOrmEntity>;
  let distributorRepository: Repository<DistributorOrmEntity>;
  let hopDistributorRepository: Repository<HopDistributorOrmEntity>;

  const ID_CASCADE = '00000000-0000-4000-9000-000000000001';
  const ID_GALENA = '00000000-0000-4000-9000-000000000002';
  const ID_TETTNANG = '00000000-0000-4000-9000-000000000005';
  const ID_BROUWLAND = '00000000-0000-4000-9000-900000000003';
  const ID_HOPT = '00000000-0000-4000-9000-900000000001';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            HopOrmEntity,
            DistributorOrmEntity,
            HopDistributorOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          HopOrmEntity,
          DistributorOrmEntity,
          HopDistributorOrmEntity,
        ]),
      ],
      providers: [HopCatalogService],
    }).compile();

    service = module.get(HopCatalogService);
    repository = module.get(getRepositoryToken(HopOrmEntity));
    distributorRepository = module.get(getRepositoryToken(DistributorOrmEntity));
    hopDistributorRepository = module.get(
      getRepositoryToken(HopDistributorOrmEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await hopDistributorRepository.clear();
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

  async function linkHopToDistributor(
    hopId: string,
    distributorId: string,
    productUrl: string,
  ): Promise<void> {
    await hopDistributorRepository.save(
      hopDistributorRepository.create({
        hop_id: hopId,
        distributor_id: distributorId,
        product_url: productUrl,
        sku: null,
        notes_per_distributor: null,
      }),
    );
  }

  async function seedHop(
    id: string,
    name: string,
    usageType: HopUsageType,
    form: HopForm = HopForm.PELLET,
  ): Promise<HopOrmEntity> {
    const entity = repository.create({
      id,
      name,
      origin: 'United States',
      alpha_acid_typical: 5.5,
      beta_acid_typical: 6.0,
      hop_stability_index: 50,
      usage_type: usageType,
      form,
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every hop ordered alphabetically by name', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH);
      await seedHop(ID_GALENA, 'Galena', HopUsageType.BITTERING);
      await seedHop(ID_TETTNANG, 'Tettnang', HopUsageType.AROMA);

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual([
        'Cascade',
        'Galena',
        'Tettnang',
      ]);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });

    it('edge: filters by usage_type when provided', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH);
      await seedHop(ID_GALENA, 'Galena', HopUsageType.BITTERING);
      await seedHop(ID_TETTNANG, 'Tettnang', HopUsageType.AROMA);

      const rows = await service.list({ usage_type: HopUsageType.BITTERING });
      expect(rows.map((r) => r.name)).toEqual(['Galena']);
    });

    it('edge: filters by form when provided', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH, HopForm.PELLET);
      await seedHop(ID_GALENA, 'Galena', HopUsageType.BITTERING, HopForm.LEAF);

      const rows = await service.list({ form: HopForm.LEAF });
      expect(rows.map((r) => r.name)).toEqual(['Galena']);
    });

    it('edge: AND-combines usage_type and form filters', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH, HopForm.PELLET);
      await seedHop(ID_GALENA, 'Galena', HopUsageType.BITTERING, HopForm.LEAF);
      // A bittering pellet — should NOT match a "bittering AND leaf" filter.
      await seedHop(
        '00000000-0000-4000-9000-000000000099',
        'Magnum',
        HopUsageType.BITTERING,
        HopForm.PELLET,
      );

      const rows = await service.list({
        usage_type: HopUsageType.BITTERING,
        form: HopForm.LEAF,
      });
      expect(rows.map((r) => r.name)).toEqual(['Galena']);
    });
  });

  describe('getById()', () => {
    it('happy: returns the hop matching the UUID', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH);

      const hop = await service.getById(ID_CASCADE);
      expect(hop.name).toBe('Cascade');
      expect(hop.usage_type).toBe(HopUsageType.BOTH);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-0000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH);

      // Try to fetch by name-shaped string — strict UUID PK lookup
      // means this still 404s. Catalog name lookups must go through
      // list(), not getById().
      await expect(service.getById('cascade')).rejects.toThrow();
    });
  });

  describe('getDistributors() — boutique foundation (Issue #901)', () => {
    it('happy: returns the junction rows with the distributor relation eagerly loaded', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH);
      await seedDistributor(ID_BROUWLAND, 'Brouwland');
      await seedDistributor(ID_HOPT, 'Hopt');
      await linkHopToDistributor(
        ID_CASCADE,
        ID_BROUWLAND,
        'https://www.brouwland.com/cascade-100g',
      );
      await linkHopToDistributor(
        ID_CASCADE,
        ID_HOPT,
        'https://www.hopt.fr/cascade',
      );

      const rows = await service.getDistributors(ID_CASCADE);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.distributor.name).sort()).toEqual([
        'Brouwland',
        'Hopt',
      ]);
      expect(
        rows.find((r) => r.distributor.name === 'Brouwland')?.product_url,
      ).toBe('https://www.brouwland.com/cascade-100g');
    });

    it('sad: throws NotFoundException when the hop UUID is unknown', async () => {
      await expect(
        service.getDistributors('00000000-0000-4000-9000-0000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: returns [] when the hop exists but has no distributors yet', async () => {
      await seedHop(ID_CASCADE, 'Cascade', HopUsageType.BOTH);
      const rows = await service.getDistributors(ID_CASCADE);
      expect(rows).toEqual([]);
    });
  });
});

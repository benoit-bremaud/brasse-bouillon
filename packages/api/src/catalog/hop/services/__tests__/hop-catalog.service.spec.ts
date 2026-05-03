jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { HopCatalogService } from '../hop-catalog.service';
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

  const ID_CASCADE = '00000000-0000-4000-9000-000000000001';
  const ID_GALENA = '00000000-0000-4000-9000-000000000002';
  const ID_TETTNANG = '00000000-0000-4000-9000-000000000005';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [HopOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([HopOrmEntity]),
      ],
      providers: [HopCatalogService],
    }).compile();

    service = module.get(HopCatalogService);
    repository = module.get(getRepositoryToken(HopOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

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
});

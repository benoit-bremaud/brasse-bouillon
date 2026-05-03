jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { YeastCatalogService } from '../yeast-catalog.service';
import { YeastFlocculation } from '../../domain/enums/yeast-flocculation.enum';
import { YeastForm } from '../../domain/enums/yeast-form.enum';
import { YeastOrmEntity } from '../../entities/yeast.orm.entity';
import { YeastType } from '../../domain/enums/yeast-type.enum';

/**
 * Service spec for the yeast catalogue (Issue #708 / #869, Phase 1
 * PR #3). Wires the real ORM entity against an in-memory SQLite so
 * every where-clause and order-clause is exercised end-to-end —
 * mocked repositories would not catch a typo in the column name
 * or a wrong filter combinator.
 */
describe('YeastCatalogService', () => {
  let module: TestingModule;
  let service: YeastCatalogService;
  let repository: Repository<YeastOrmEntity>;

  const ID_WLP002 = '00000000-0000-4000-9000-200000000001';
  const ID_US05 = '00000000-0000-4000-9000-200000000006';
  const ID_W3470 = '00000000-0000-4000-9000-200000000008';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [YeastOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([YeastOrmEntity]),
      ],
      providers: [YeastCatalogService],
    }).compile();

    service = module.get(YeastCatalogService);
    repository = module.get(getRepositoryToken(YeastOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  async function seedYeast(
    id: string,
    name: string,
    type: YeastType,
    form: YeastForm = YeastForm.LIQUID,
  ): Promise<YeastOrmEntity> {
    const entity = repository.create({
      id,
      name,
      type,
      form,
      producer_id: '00000000-0000-4000-9000-800000000001',
      product_code: 'WLP000',
      min_temperature_c: 18,
      max_temperature_c: 22,
      flocculation: YeastFlocculation.MEDIUM,
      attenuation_percent_typical: 75,
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every yeast ordered alphabetically by name', async () => {
      await seedYeast(ID_WLP002, 'English Ale', YeastType.ALE);
      await seedYeast(ID_US05, 'Safale US-05', YeastType.ALE, YeastForm.DRY);
      await seedYeast(
        ID_W3470,
        'Saflager W-34/70',
        YeastType.LAGER,
        YeastForm.DRY,
      );

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual([
        'English Ale',
        'Safale US-05',
        'Saflager W-34/70',
      ]);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });

    it('edge: filters by type when provided', async () => {
      await seedYeast(ID_WLP002, 'English Ale', YeastType.ALE);
      await seedYeast(
        ID_W3470,
        'Saflager W-34/70',
        YeastType.LAGER,
        YeastForm.DRY,
      );

      const rows = await service.list({ type: YeastType.LAGER });
      expect(rows.map((r) => r.name)).toEqual(['Saflager W-34/70']);
    });

    it('edge: filters by form when provided', async () => {
      await seedYeast(
        ID_WLP002,
        'English Ale',
        YeastType.ALE,
        YeastForm.LIQUID,
      );
      await seedYeast(ID_US05, 'Safale US-05', YeastType.ALE, YeastForm.DRY);

      const rows = await service.list({ form: YeastForm.DRY });
      expect(rows.map((r) => r.name)).toEqual(['Safale US-05']);
    });

    it('edge: AND-combines type and form filters', async () => {
      await seedYeast(
        ID_WLP002,
        'English Ale',
        YeastType.ALE,
        YeastForm.LIQUID,
      );
      await seedYeast(ID_US05, 'Safale US-05', YeastType.ALE, YeastForm.DRY);
      await seedYeast(
        ID_W3470,
        'Saflager W-34/70',
        YeastType.LAGER,
        YeastForm.DRY,
      );

      const rows = await service.list({
        type: YeastType.ALE,
        form: YeastForm.DRY,
      });
      expect(rows.map((r) => r.name)).toEqual(['Safale US-05']);
    });
  });

  describe('getById()', () => {
    it('happy: returns the yeast matching the UUID', async () => {
      await seedYeast(ID_US05, 'Safale US-05', YeastType.ALE, YeastForm.DRY);

      const yeast = await service.getById(ID_US05);
      expect(yeast.name).toBe('Safale US-05');
      expect(yeast.form).toBe(YeastForm.DRY);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-2000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedYeast(ID_US05, 'Safale US-05', YeastType.ALE, YeastForm.DRY);

      // Strict UUID PK lookup — name-shaped strings still 404.
      await expect(service.getById('safale-us-05')).rejects.toThrow();
    });
  });
});

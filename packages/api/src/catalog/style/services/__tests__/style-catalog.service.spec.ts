jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StyleCatalogService } from '../style-catalog.service';
import { StyleOrmEntity } from '../../entities/style.orm.entity';
import { StyleType } from '../../domain/enums/style-type.enum';

/**
 * Service spec for the BJCP style catalogue (Issue #708 / #869,
 * Phase 2 PR #4). Wires the real ORM entity against an in-memory
 * SQLite so every where-clause and order-clause is exercised
 * end-to-end — mocked repositories would not catch a typo in the
 * column name or a wrong filter combinator.
 */
describe('StyleCatalogService', () => {
  let module: TestingModule;
  let service: StyleCatalogService;
  let repository: Repository<StyleOrmEntity>;

  const ID_AMERICAN_WHEAT = '00000000-0000-4000-9000-300000000001';
  const ID_BOHEMIAN_PILSNER = '00000000-0000-4000-9000-300000000002';
  const ID_AMERICAN_IPA = '00000000-0000-4000-9000-300000000006';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [StyleOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([StyleOrmEntity]),
      ],
      providers: [StyleCatalogService],
    }).compile();

    service = module.get(StyleCatalogService);
    repository = module.get(getRepositoryToken(StyleOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  async function seedStyle(
    id: string,
    name: string,
    categoryNumber: number,
    styleLetter: string,
    styleGuide: string,
    type: StyleType,
  ): Promise<StyleOrmEntity> {
    const entity = repository.create({
      id,
      name,
      category: 'Test Category',
      category_number: categoryNumber,
      style_letter: styleLetter,
      style_guide: styleGuide,
      type,
      og_min: 1.04,
      og_max: 1.06,
      fg_min: 1.008,
      fg_max: 1.014,
      ibu_min: 20,
      ibu_max: 40,
      color_ebc_min: 6,
      color_ebc_max: 16,
      carb_min: 2.3,
      carb_max: 2.6,
      abv_min: 4,
      abv_max: 6,
      notes: null,
      profile: null,
      ingredients: null,
      examples: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every style ordered by category_number then style_letter', async () => {
      // Insert in random order, expect canonical BJCP order.
      await seedStyle(
        ID_AMERICAN_IPA,
        'American IPA',
        21,
        'A',
        'BJCP 2021',
        StyleType.ALE,
      );
      await seedStyle(
        ID_BOHEMIAN_PILSNER,
        'Bohemian Pilsner',
        2,
        'A',
        'BJCP 1999',
        StyleType.LAGER,
      );
      await seedStyle(
        ID_AMERICAN_WHEAT,
        'American Wheat',
        3,
        'B',
        'BJCP 1999',
        StyleType.MIXED,
      );

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual([
        'Bohemian Pilsner',
        'American Wheat',
        'American IPA',
      ]);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });

    it('edge: filters by type when provided', async () => {
      await seedStyle(
        ID_AMERICAN_IPA,
        'American IPA',
        21,
        'A',
        'BJCP 2021',
        StyleType.ALE,
      );
      await seedStyle(
        ID_BOHEMIAN_PILSNER,
        'Bohemian Pilsner',
        2,
        'A',
        'BJCP 1999',
        StyleType.LAGER,
      );

      const rows = await service.list({ type: StyleType.LAGER });
      expect(rows.map((r) => r.name)).toEqual(['Bohemian Pilsner']);
    });

    it('edge: filters by style_guide when provided', async () => {
      await seedStyle(
        ID_AMERICAN_IPA,
        'American IPA',
        21,
        'A',
        'BJCP 2021',
        StyleType.ALE,
      );
      await seedStyle(
        ID_BOHEMIAN_PILSNER,
        'Bohemian Pilsner',
        2,
        'A',
        'BJCP 1999',
        StyleType.LAGER,
      );

      const rows = await service.list({ style_guide: 'BJCP 1999' });
      expect(rows.map((r) => r.name)).toEqual(['Bohemian Pilsner']);
    });

    it('edge: AND-combines type and style_guide filters', async () => {
      await seedStyle(
        ID_AMERICAN_IPA,
        'American IPA',
        21,
        'A',
        'BJCP 2021',
        StyleType.ALE,
      );
      await seedStyle(
        ID_BOHEMIAN_PILSNER,
        'Bohemian Pilsner',
        2,
        'A',
        'BJCP 1999',
        StyleType.LAGER,
      );
      await seedStyle(
        ID_AMERICAN_WHEAT,
        'American Wheat',
        3,
        'B',
        'BJCP 1999',
        StyleType.MIXED,
      );

      const rows = await service.list({
        type: StyleType.LAGER,
        style_guide: 'BJCP 1999',
      });
      expect(rows.map((r) => r.name)).toEqual(['Bohemian Pilsner']);
    });
  });

  describe('getById()', () => {
    it('happy: returns the style matching the UUID', async () => {
      await seedStyle(
        ID_AMERICAN_IPA,
        'American IPA',
        21,
        'A',
        'BJCP 2021',
        StyleType.ALE,
      );

      const style = await service.getById(ID_AMERICAN_IPA);
      expect(style.name).toBe('American IPA');
      expect(style.style_guide).toBe('BJCP 2021');
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-3000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedStyle(
        ID_AMERICAN_IPA,
        'American IPA',
        21,
        'A',
        'BJCP 2021',
        StyleType.ALE,
      );

      // Strict UUID PK lookup — name-shaped strings still 404.
      await expect(service.getById('american-ipa')).rejects.toThrow();
    });
  });
});

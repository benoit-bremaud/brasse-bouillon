jest.setTimeout(20000);

import { MiscType, MiscUseAt } from '../../domain/misc-template.types';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { DistributorOrmEntity } from '../../../distributor/entities/distributor.orm.entity';
import { MiscCatalogService } from '../misc-catalog.service';
import { MiscTemplateDistributorOrmEntity } from '../../entities/misc-template-distributor.orm.entity';
import { MiscTemplateOrmEntity } from '../../entities/misc-template.orm.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('MiscCatalogService', () => {
  let module: TestingModule;
  let service: MiscCatalogService;
  let repository: Repository<MiscTemplateOrmEntity>;
  let distributorRepository: Repository<DistributorOrmEntity>;
  let miscDistributorRepository: Repository<MiscTemplateDistributorOrmEntity>;

  const ID_CORIANDER = '00000000-0000-4000-9000-700000000005';
  const ID_LACTOSE = '00000000-0000-4000-9000-700000000006';
  const ID_BROUWLAND = '00000000-0000-4000-9000-900000000003';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [
            MiscTemplateOrmEntity,
            DistributorOrmEntity,
            MiscTemplateDistributorOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          MiscTemplateOrmEntity,
          DistributorOrmEntity,
          MiscTemplateDistributorOrmEntity,
        ]),
      ],
      providers: [MiscCatalogService],
    }).compile();

    service = module.get(MiscCatalogService);
    repository = module.get(getRepositoryToken(MiscTemplateOrmEntity));
    distributorRepository = module.get(
      getRepositoryToken(DistributorOrmEntity),
    );
    miscDistributorRepository = module.get(
      getRepositoryToken(MiscTemplateDistributorOrmEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await miscDistributorRepository.clear();
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

  async function linkMiscToDistributor(
    miscTemplateId: string,
    distributorId: string,
    productUrl: string,
  ): Promise<void> {
    await miscDistributorRepository.save(
      miscDistributorRepository.create({
        misc_template_id: miscTemplateId,
        distributor_id: distributorId,
        product_url: productUrl,
        sku: null,
        notes_per_distributor: null,
      }),
    );
  }

  async function seedTemplate(
    id: string,
    name: string,
    type: MiscType,
    use_at: MiscUseAt,
  ): Promise<MiscTemplateOrmEntity> {
    const entity = repository.create({
      id,
      name,
      type,
      use_at,
      amount: 0.02,
      amount_is_weight: true,
      time_min: 10,
      use_for: 'Test',
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every template ordered alphabetically by name', async () => {
      await seedTemplate(ID_LACTOSE, 'Lactose', MiscType.Other, MiscUseAt.Boil);
      await seedTemplate(
        ID_CORIANDER,
        'Coriandre (graines)',
        MiscType.Spice,
        MiscUseAt.Boil,
      );

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual([
        'Coriandre (graines)',
        'Lactose',
      ]);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('happy: returns the template matching the UUID', async () => {
      await seedTemplate(
        ID_CORIANDER,
        'Coriandre (graines)',
        MiscType.Spice,
        MiscUseAt.Boil,
      );

      const template = await service.getById(ID_CORIANDER);
      expect(template.name).toBe('Coriandre (graines)');
      expect(template.type).toBe(MiscType.Spice);
      expect(template.use_at).toBe(MiscUseAt.Boil);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-7000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedTemplate(
        ID_CORIANDER,
        'Coriandre (graines)',
        MiscType.Spice,
        MiscUseAt.Boil,
      );
      await expect(service.getById('coriandre')).rejects.toThrow();
    });
  });

  describe('getDistributors() — boutique foundation (Issue #901)', () => {
    it('happy: returns the junction rows with the distributor relation eagerly loaded', async () => {
      await seedTemplate(
        ID_CORIANDER,
        'Coriandre (graines)',
        MiscType.Spice,
        MiscUseAt.Boil,
      );
      await seedDistributor(ID_BROUWLAND, 'Brouwland');
      await linkMiscToDistributor(
        ID_CORIANDER,
        ID_BROUWLAND,
        'https://www.brouwland.com/coriandre-100g',
      );

      const rows = await service.getDistributors(ID_CORIANDER);
      expect(rows).toHaveLength(1);
      expect(rows[0].distributor.name).toBe('Brouwland');
      expect(rows[0].product_url).toBe(
        'https://www.brouwland.com/coriandre-100g',
      );
    });

    it('sad: throws NotFoundException when the misc UUID is unknown', async () => {
      await expect(
        service.getDistributors('00000000-0000-4000-9000-7000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: returns [] when the misc exists but has no distributors yet', async () => {
      await seedTemplate(
        ID_CORIANDER,
        'Coriandre (graines)',
        MiscType.Spice,
        MiscUseAt.Boil,
      );
      const rows = await service.getDistributors(ID_CORIANDER);
      expect(rows).toEqual([]);
    });
  });
});

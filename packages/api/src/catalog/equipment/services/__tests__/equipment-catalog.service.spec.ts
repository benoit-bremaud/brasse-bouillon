jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { DistributorOrmEntity } from '../../../distributor/entities/distributor.orm.entity';
import { EquipmentCatalogService } from '../equipment-catalog.service';
import { EquipmentTemplateDistributorOrmEntity } from '../../entities/equipment-template-distributor.orm.entity';
import { EquipmentTemplateOrmEntity } from '../../entities/equipment-template.orm.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('EquipmentCatalogService', () => {
  let module: TestingModule;
  let service: EquipmentCatalogService;
  let repository: Repository<EquipmentTemplateOrmEntity>;
  let distributorRepository: Repository<DistributorOrmEntity>;
  let equipmentDistributorRepository: Repository<EquipmentTemplateDistributorOrmEntity>;

  const ID_KITCHEN = '00000000-0000-4000-9000-600000000000';
  const ID_GRAINFATHER = '00000000-0000-4000-9000-600000000005';
  const ID_BROUWLAND = '00000000-0000-4000-9000-900000000003';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            EquipmentTemplateOrmEntity,
            DistributorOrmEntity,
            EquipmentTemplateDistributorOrmEntity,
          ],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([
          EquipmentTemplateOrmEntity,
          DistributorOrmEntity,
          EquipmentTemplateDistributorOrmEntity,
        ]),
      ],
      providers: [EquipmentCatalogService],
    }).compile();

    service = module.get(EquipmentCatalogService);
    repository = module.get(getRepositoryToken(EquipmentTemplateOrmEntity));
    distributorRepository = module.get(
      getRepositoryToken(DistributorOrmEntity),
    );
    equipmentDistributorRepository = module.get(
      getRepositoryToken(EquipmentTemplateDistributorOrmEntity),
    );
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await equipmentDistributorRepository.clear();
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

  async function linkEquipmentToDistributor(
    equipmentTemplateId: string,
    distributorId: string,
    productUrl: string,
  ): Promise<void> {
    await equipmentDistributorRepository.save(
      equipmentDistributorRepository.create({
        equipment_template_id: equipmentTemplateId,
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
    batchSize: number,
  ): Promise<EquipmentTemplateOrmEntity> {
    const entity = repository.create({
      id,
      name,
      boil_size_l: batchSize + 4,
      batch_size_l: batchSize,
      tun_volume_l: batchSize + 5,
      tun_weight_kg: 3,
      tun_specific_heat: 0.12,
      top_up_water_l: 0,
      trub_chiller_loss_l: 1,
      evap_rate_percent: 9,
      boil_time_min: 60,
      calc_boil_volume: true,
      lauter_deadspace_l: 1,
      top_up_kettle_l: 0,
      hop_utilization_percent: 100,
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every template ordered alphabetically by name', async () => {
      await seedTemplate(ID_KITCHEN, 'Casserole cuisine 5L', 5);
      await seedTemplate(ID_GRAINFATHER, 'Grainfather G30', 23);

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual([
        'Casserole cuisine 5L',
        'Grainfather G30',
      ]);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('happy: returns the template matching the UUID', async () => {
      await seedTemplate(ID_GRAINFATHER, 'Grainfather G30', 23);

      const template = await service.getById(ID_GRAINFATHER);
      expect(template.name).toBe('Grainfather G30');
      expect(template.batch_size_l).toBe(23);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-6000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedTemplate(ID_GRAINFATHER, 'Grainfather G30', 23);
      await expect(service.getById('grainfather-g30')).rejects.toThrow();
    });
  });

  describe('getDistributors() — boutique foundation (Issue #901)', () => {
    it('happy: returns the junction rows with the distributor relation eagerly loaded', async () => {
      await seedTemplate(ID_GRAINFATHER, 'Grainfather G30', 23);
      await seedDistributor(ID_BROUWLAND, 'Brouwland');
      await linkEquipmentToDistributor(
        ID_GRAINFATHER,
        ID_BROUWLAND,
        'https://www.brouwland.com/grainfather-g30',
      );

      const rows = await service.getDistributors(ID_GRAINFATHER);
      expect(rows).toHaveLength(1);
      expect(rows[0].distributor.name).toBe('Brouwland');
      expect(rows[0].product_url).toBe(
        'https://www.brouwland.com/grainfather-g30',
      );
    });

    it('sad: throws NotFoundException when the equipment UUID is unknown', async () => {
      await expect(
        service.getDistributors('00000000-0000-4000-9000-6000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: returns [] when the equipment exists but has no distributors yet', async () => {
      await seedTemplate(ID_GRAINFATHER, 'Grainfather G30', 23);
      const rows = await service.getDistributors(ID_GRAINFATHER);
      expect(rows).toEqual([]);
    });
  });
});

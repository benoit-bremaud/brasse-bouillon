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

  const ID_KITCHEN = '00000000-0000-4000-9000-600000000000';
  const ID_GRAINFATHER = '00000000-0000-4000-9000-600000000005';

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
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

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
});

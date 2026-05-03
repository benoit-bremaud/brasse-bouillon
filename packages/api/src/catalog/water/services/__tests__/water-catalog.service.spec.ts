jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { WaterCatalogService } from '../water-catalog.service';
import { WaterOrmEntity } from '../../entities/water.orm.entity';

/**
 * Service spec for the brewing water catalogue (Issue #708 / #869,
 * Phase 3 PR #6). Wires the real ORM entity against an in-memory
 * SQLite so every where-clause and order-clause is exercised
 * end-to-end.
 */
describe('WaterCatalogService', () => {
  let module: TestingModule;
  let service: WaterCatalogService;
  let repository: Repository<WaterOrmEntity>;

  const ID_BURTON = '00000000-0000-4000-9000-500000000001';
  const ID_PILSEN = '00000000-0000-4000-9000-500000000005';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [WaterOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([WaterOrmEntity]),
      ],
      providers: [WaterCatalogService],
    }).compile();

    service = module.get(WaterCatalogService);
    repository = module.get(getRepositoryToken(WaterOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await repository.clear();
  });

  async function seedWater(
    id: string,
    name: string,
    sulfate: number,
  ): Promise<WaterOrmEntity> {
    const entity = repository.create({
      id,
      name,
      origin: 'Test',
      calcium_ppm: 100,
      bicarbonate_ppm: 100,
      sulfate_ppm: sulfate,
      chloride_ppm: 50,
      sodium_ppm: 10,
      magnesium_ppm: 10,
      ph: 7.5,
      notes: null,
    });
    return repository.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every water profile ordered alphabetically by name', async () => {
      await seedWater(ID_BURTON, 'Burton on Trent', 725);
      await seedWater(ID_PILSEN, 'Pilsen', 5);

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual(['Burton on Trent', 'Pilsen']);
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('happy: returns the water profile matching the UUID', async () => {
      await seedWater(ID_BURTON, 'Burton on Trent', 725);

      const water = await service.getById(ID_BURTON);
      expect(water.name).toBe('Burton on Trent');
      expect(water.sulfate_ppm).toBe(725);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-5000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: does not match by name even if a row with that name exists', async () => {
      await seedWater(ID_BURTON, 'Burton on Trent', 725);
      // Strict UUID PK lookup — name-shaped strings still 404.
      await expect(service.getById('burton-on-trent')).rejects.toThrow();
    });
  });
});

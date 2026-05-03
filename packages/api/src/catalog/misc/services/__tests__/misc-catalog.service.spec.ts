jest.setTimeout(20000);

import { MiscType, MiscUseAt } from '../../domain/misc-template.types';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { MiscCatalogService } from '../misc-catalog.service';
import { MiscTemplateOrmEntity } from '../../entities/misc-template.orm.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('MiscCatalogService', () => {
  let module: TestingModule;
  let service: MiscCatalogService;
  let repository: Repository<MiscTemplateOrmEntity>;

  const ID_CORIANDER = '00000000-0000-4000-9000-700000000005';
  const ID_LACTOSE = '00000000-0000-4000-9000-700000000006';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [MiscTemplateOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([MiscTemplateOrmEntity]),
      ],
      providers: [MiscCatalogService],
    }).compile();

    service = module.get(MiscCatalogService);
    repository = module.get(getRepositoryToken(MiscTemplateOrmEntity));
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
});

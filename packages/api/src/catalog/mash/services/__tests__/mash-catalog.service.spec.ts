jest.setTimeout(20000);

import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { MashCatalogService } from '../mash-catalog.service';
import { MashProfileOrmEntity } from '../../entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from '../../entities/mash-step.orm.entity';
import { MashStepType } from '../../domain/enums/mash-step-type.enum';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

/**
 * Service spec for the mash catalogue (Issue #708 / #869, Phase 2
 * PR #5). Wires the real ORM entities (parent + child via 1:N FK)
 * against an in-memory SQLite so the OneToMany eager-load and the
 * cascade-delete are exercised end-to-end. Mocked repositories
 * would not catch a wrong relation name or a missing JoinColumn.
 */
describe('MashCatalogService', () => {
  let module: TestingModule;
  let service: MashCatalogService;
  let profileRepo: Repository<MashProfileOrmEntity>;
  let stepRepo: Repository<MashStepOrmEntity>;

  const ID_SINGLE_INFUSION = '00000000-0000-4000-9000-400000000002';
  const ID_FULL_BODY = '00000000-0000-4000-9000-400000000003';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [MashProfileOrmEntity, MashStepOrmEntity],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([MashProfileOrmEntity, MashStepOrmEntity]),
      ],
      providers: [MashCatalogService],
    }).compile();

    service = module.get(MashCatalogService);
    profileRepo = module.get(getRepositoryToken(MashProfileOrmEntity));
    stepRepo = module.get(getRepositoryToken(MashStepOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // Order matters: delete children before parents to avoid the
    // FK constraint blocking the cleanup when CASCADE is not yet
    // exercised by the test.
    await stepRepo.clear();
    await profileRepo.clear();
  });

  async function seedProfile(
    id: string,
    name: string,
  ): Promise<MashProfileOrmEntity> {
    const entity = profileRepo.create({
      id,
      name,
      grain_temp_c: 22,
      tun_temp_c: 22,
      sparge_temp_c: 76,
      ph: 5.4,
      tun_weight_kg: 3,
      tun_specific_heat: 0.12,
      equip_adjust: false,
      notes: null,
    });
    return profileRepo.save(entity);
  }

  async function seedStep(
    id: string,
    profileId: string,
    stepIndex: number,
    name: string,
    type: MashStepType,
  ): Promise<MashStepOrmEntity> {
    const entity = stepRepo.create({
      id,
      mash_profile_id: profileId,
      step_index: stepIndex,
      name,
      type,
      step_time_min: 60,
      step_temp_c: 65,
      ramp_time_min: 2,
      end_temp_c: 65,
      infuse_amount_l: 15,
      infuse_temp_c: 71,
      decoction_amount_l: null,
      water_grain_ratio: 3,
      description: null,
    });
    return stepRepo.save(entity);
  }

  describe('list()', () => {
    it('happy: returns every profile ordered alphabetically by name (steps omitted)', async () => {
      await seedProfile(ID_FULL_BODY, 'Full Body');
      await seedProfile(ID_SINGLE_INFUSION, 'Single Infusion');

      const rows = await service.list();
      expect(rows.map((r) => r.name)).toEqual(['Full Body', 'Single Infusion']);
      // Steps relation is not loaded by list() — leaner payload.
      expect(rows[0].steps).toBeUndefined();
    });

    it('sad: returns [] when the catalogue is empty', async () => {
      const rows = await service.list();
      expect(rows).toEqual([]);
    });
  });

  describe('getById()', () => {
    it('happy: returns the profile with its steps eager-loaded', async () => {
      await seedProfile(ID_SINGLE_INFUSION, 'Single Infusion');
      await seedStep(
        '00000000-0000-4000-9000-400200000001',
        ID_SINGLE_INFUSION,
        1,
        'Mash In',
        MashStepType.INFUSION,
      );
      await seedStep(
        '00000000-0000-4000-9000-400200000002',
        ID_SINGLE_INFUSION,
        2,
        'Mash Out',
        MashStepType.TEMPERATURE,
      );

      const profile = await service.getById(ID_SINGLE_INFUSION);
      expect(profile.name).toBe('Single Infusion');
      expect(profile.steps).toHaveLength(2);
      const stepNames = profile.steps.map((s) => s.name).sort();
      expect(stepNames).toEqual(['Mash In', 'Mash Out']);
    });

    it('sad: throws NotFoundException when the UUID is unknown', async () => {
      await expect(
        service.getById('00000000-0000-4000-9000-4000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: returns a profile with empty steps array when no steps exist', async () => {
      await seedProfile(ID_SINGLE_INFUSION, 'Single Infusion');

      const profile = await service.getById(ID_SINGLE_INFUSION);
      expect(profile.name).toBe('Single Infusion');
      expect(profile.steps).toEqual([]);
    });

    it('edge: cascade-deletes steps when the parent profile is removed', async () => {
      await seedProfile(ID_SINGLE_INFUSION, 'Single Infusion');
      await seedStep(
        '00000000-0000-4000-9000-400200000001',
        ID_SINGLE_INFUSION,
        1,
        'Mash In',
        MashStepType.INFUSION,
      );

      await profileRepo.delete({ id: ID_SINGLE_INFUSION });

      const remainingSteps = await stepRepo.find({
        where: { mash_profile_id: ID_SINGLE_INFUSION },
      });
      expect(remainingSteps).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';

import { MashCatalogController } from '../mash-catalog.controller';
import { MashCatalogService } from '../../services/mash-catalog.service';
import { MashProfileOrmEntity } from '../../entities/mash-profile.orm.entity';
import { MashStepOrmEntity } from '../../entities/mash-step.orm.entity';
import { MashStepType } from '../../domain/enums/mash-step-type.enum';
import { NotFoundException } from '@nestjs/common';

/**
 * Controller spec for the mash catalogue. Mocks the service layer
 * so the test isolates the HTTP-shape mapping (URL → service call
 * → DTO transform) from the database concerns covered in
 * `mash-catalog.service.spec.ts`. Service methods are spied via
 * `jest.spyOn` so eslint's `@typescript-eslint/unbound-method` rule
 * does not fire.
 */
describe('MashCatalogController', () => {
  let controller: MashCatalogController;
  let service: MashCatalogService;

  const ID_SINGLE_INFUSION = '00000000-0000-4000-9000-400000000002';

  function buildStep(
    overrides: Partial<MashStepOrmEntity> = {},
  ): MashStepOrmEntity {
    return {
      id: '00000000-0000-4000-9000-400200000001',
      mash_profile_id: ID_SINGLE_INFUSION,
      step_index: 1,
      name: 'Mash In',
      type: MashStepType.INFUSION,
      step_time_min: 60,
      step_temp_c: 65,
      ramp_time_min: 2,
      end_temp_c: 65,
      infuse_amount_l: 15,
      infuse_temp_c: 71,
      decoction_amount_l: null,
      water_grain_ratio: 3,
      description: null,
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      mash_profile: undefined as never,
      ...overrides,
    };
  }

  function buildProfile(
    overrides: Partial<MashProfileOrmEntity> = {},
  ): MashProfileOrmEntity {
    return {
      id: ID_SINGLE_INFUSION,
      name: 'Single Infusion',
      grain_temp_c: 22,
      tun_temp_c: 22,
      sparge_temp_c: 76,
      ph: 5.4,
      tun_weight_kg: 3,
      tun_specific_heat: 0.12,
      equip_adjust: false,
      notes: 'Empâtage simple',
      steps: [],
      created_at: new Date('2026-05-03T00:00:00.000Z'),
      updated_at: new Date('2026-05-03T00:00:00.000Z'),
      ...overrides,
    };
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MashCatalogController],
      providers: [
        {
          provide: MashCatalogService,
          useValue: {
            list: jest.fn(),
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(MashCatalogController);
    service = module.get(MashCatalogService);
  });

  describe('GET /catalog/mash-profiles', () => {
    it('happy: returns the list mapped to MashProfileSummaryDto (no steps field)', async () => {
      const listSpy = jest.spyOn(service, 'list').mockResolvedValue([
        buildProfile({ id: ID_SINGLE_INFUSION, name: 'Single Infusion' }),
        buildProfile({
          id: '00000000-0000-4000-9000-400000000003',
          name: 'Full Body',
        }),
      ]);

      const result = await controller.list();

      expect(listSpy).toHaveBeenCalledWith();
      expect(result.map((r) => r.name)).toEqual([
        'Single Infusion',
        'Full Body',
      ]);
      // List endpoint returns the lean SummaryDto — no `steps`
      // field at all (the property doesn't exist on the type).
      expect(
        (result[0] as unknown as Record<string, unknown>).steps,
      ).toBeUndefined();
      expect(result[0].constructor.name).toBe('MashProfileSummaryDto');
      expect(typeof result[0].created_at).toBe('string');
    });

    it('sad: returns [] when the service yields no rows', async () => {
      jest.spyOn(service, 'list').mockResolvedValue([]);

      const result = await controller.list();
      expect(result).toEqual([]);
    });
  });

  describe('GET /catalog/mash-profiles/:id', () => {
    it('happy: returns the DTO with steps sorted by step_index', async () => {
      const getByIdSpy = jest.spyOn(service, 'getById').mockResolvedValue(
        buildProfile({
          steps: [
            // Intentionally out-of-order to verify the DTO sorts.
            buildStep({ step_index: 2, name: 'Mash Out' }),
            buildStep({ step_index: 1, name: 'Mash In' }),
          ],
        }),
      );

      const result = await controller.getById(ID_SINGLE_INFUSION);

      expect(getByIdSpy).toHaveBeenCalledWith(ID_SINGLE_INFUSION);
      expect(result.id).toBe(ID_SINGLE_INFUSION);
      expect(result.steps.map((s) => s.name)).toEqual(['Mash In', 'Mash Out']);
    });

    it('sad: lets a NotFoundException from the service propagate', async () => {
      jest
        .spyOn(service, 'getById')
        .mockRejectedValue(new NotFoundException('Mash profile not found'));

      await expect(
        controller.getById('00000000-0000-4000-9000-4000000000ff'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: never leaks the raw ORM entity (always wraps in DTO)', async () => {
      const entity = buildProfile();
      jest.spyOn(service, 'getById').mockResolvedValue(entity);

      const result = await controller.getById(ID_SINGLE_INFUSION);

      expect(result).not.toBe(entity);
      expect(result.constructor.name).toBe('MashProfileDto');
    });
  });
});

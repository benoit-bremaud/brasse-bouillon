import { DeleteResult, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';

import { CreateEquipmentProfileDto } from '../dtos/create-equipment-profile.dto';
import { EquipmentProfileOrmEntity } from '../entities/equipment-profile.orm.entity';
import { EquipmentProfileService } from './equipment-profile.service';
import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateEquipmentProfileDto } from '../dtos/update-equipment-profile.dto';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('EquipmentProfileService', () => {
  let service: EquipmentProfileService;
  let repo: Repository<EquipmentProfileOrmEntity>;

  const ownerId = '550e8400-e29b-41d4-a716-446655440400';

  const makeEntity = (
    overrides: Partial<EquipmentProfileOrmEntity> = {},
  ): EquipmentProfileOrmEntity => {
    return {
      id: '550e8400-e29b-41d4-a716-446655440401',
      owner_id: ownerId,
      name: 'My Brewing Setup',
      mash_tun_volume_l: 30,
      boil_kettle_volume_l: 40,
      fermenter_volume_l: 30,
      trub_loss_l: 2,
      dead_space_loss_l: 1,
      transfer_loss_l: 1,
      evaporation_rate_l_per_hour: 4,
      efficiency_estimated_percent: 75,
      efficiency_measured_percent: null,
      cooling_time_minutes: null,
      cooling_flow_rate_l_per_minute: null,
      system_type: EquipmentSystemType.ALL_GRAIN,
      created_at: new Date('2026-02-01T10:00:00.000Z'),
      updated_at: new Date('2026-02-01T10:00:00.000Z'),
      ...overrides,
    };
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentProfileService,
        {
          provide: getRepositoryToken(EquipmentProfileOrmEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EquipmentProfileService>(EquipmentProfileService);
    repo = module.get<Repository<EquipmentProfileOrmEntity>>(
      getRepositoryToken(EquipmentProfileOrmEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ping()', () => {
    it('should return ok payload', () => {
      expect(service.ping()).toEqual({ ok: true });
    });
  });

  describe('create()', () => {
    it('should create profile with default optional values when omitted', async () => {
      const dto: CreateEquipmentProfileDto = {
        name: 'All Grain 30L',
        mash_tun_volume_l: 30,
        boil_kettle_volume_l: 40,
        fermenter_volume_l: 30,
        evaporation_rate_l_per_hour: 4,
        efficiency_estimated_percent: 75,
        system_type: EquipmentSystemType.ALL_GRAIN,
      };

      const createdEntity = makeEntity({
        trub_loss_l: 0,
        dead_space_loss_l: 0,
        transfer_loss_l: 0,
      });

      const createSpy = jest
        .spyOn(repo, 'create')
        .mockReturnValue(createdEntity);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(createdEntity);

      const result = await service.create(ownerId, dto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          owner_id: ownerId,
          name: dto.name,
          mash_tun_volume_l: dto.mash_tun_volume_l,
          boil_kettle_volume_l: dto.boil_kettle_volume_l,
          fermenter_volume_l: dto.fermenter_volume_l,
          trub_loss_l: 0,
          dead_space_loss_l: 0,
          transfer_loss_l: 0,
          evaporation_rate_l_per_hour: dto.evaporation_rate_l_per_hour,
          efficiency_estimated_percent: dto.efficiency_estimated_percent,
          efficiency_measured_percent: null,
          cooling_time_minutes: null,
          cooling_flow_rate_l_per_minute: null,
          system_type: dto.system_type,
        }),
      );
      expect(saveSpy).toHaveBeenCalledWith(createdEntity);
      expect(result).toBe(createdEntity);
    });

    it('should keep optional values when provided', async () => {
      const dto: CreateEquipmentProfileDto = {
        name: 'All-In-One 20L',
        mash_tun_volume_l: 22,
        boil_kettle_volume_l: 25,
        fermenter_volume_l: 21,
        trub_loss_l: 1.2,
        dead_space_loss_l: 0.4,
        transfer_loss_l: 0.3,
        evaporation_rate_l_per_hour: 3.2,
        efficiency_estimated_percent: 78,
        efficiency_measured_percent: 74,
        cooling_time_minutes: 25,
        cooling_flow_rate_l_per_minute: 6.5,
        system_type: EquipmentSystemType.ALL_IN_ONE,
      };

      const createdEntity = makeEntity({
        name: dto.name,
        mash_tun_volume_l: dto.mash_tun_volume_l,
        boil_kettle_volume_l: dto.boil_kettle_volume_l,
        fermenter_volume_l: dto.fermenter_volume_l,
        trub_loss_l: dto.trub_loss_l,
        dead_space_loss_l: dto.dead_space_loss_l,
        transfer_loss_l: dto.transfer_loss_l,
        evaporation_rate_l_per_hour: dto.evaporation_rate_l_per_hour,
        efficiency_estimated_percent: dto.efficiency_estimated_percent,
        efficiency_measured_percent: dto.efficiency_measured_percent,
        cooling_time_minutes: dto.cooling_time_minutes,
        cooling_flow_rate_l_per_minute: dto.cooling_flow_rate_l_per_minute,
        system_type: dto.system_type,
      });

      const createSpy = jest
        .spyOn(repo, 'create')
        .mockReturnValue(createdEntity);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(createdEntity);

      await service.create(ownerId, dto);

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          trub_loss_l: dto.trub_loss_l,
          dead_space_loss_l: dto.dead_space_loss_l,
          transfer_loss_l: dto.transfer_loss_l,
          efficiency_measured_percent: dto.efficiency_measured_percent,
          cooling_time_minutes: dto.cooling_time_minutes,
          cooling_flow_rate_l_per_minute: dto.cooling_flow_rate_l_per_minute,
          system_type: EquipmentSystemType.ALL_IN_ONE,
        }),
      );
      expect(saveSpy).toHaveBeenCalledWith(createdEntity);
    });

    it('should throw when domain invariants are violated at creation', async () => {
      const dto: CreateEquipmentProfileDto = {
        name: 'Invalid Setup',
        mash_tun_volume_l: -1,
        boil_kettle_volume_l: 25,
        fermenter_volume_l: 20,
        evaporation_rate_l_per_hour: 3,
        efficiency_estimated_percent: 75,
        system_type: EquipmentSystemType.EXTRACT,
      };

      const invalidEntity = makeEntity({
        mash_tun_volume_l: -1,
      });

      const createSpy = jest
        .spyOn(repo, 'create')
        .mockReturnValue(invalidEntity);
      const saveSpy = jest.spyOn(repo, 'save');

      await expect(service.create(ownerId, dto)).rejects.toThrow(
        'Field "mashTunVolumeL" must be >= 0',
      );
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('listMine()', () => {
    it('should return owner profiles ordered by created_at desc', async () => {
      const entities: EquipmentProfileOrmEntity[] = [
        makeEntity({ id: '550e8400-e29b-41d4-a716-446655440402' }),
        makeEntity({ id: '550e8400-e29b-41d4-a716-446655440403' }),
      ];

      const findSpy = jest.spyOn(repo, 'find').mockResolvedValue(entities);

      const result = await service.listMine(ownerId);

      expect(findSpy).toHaveBeenCalledWith({
        where: { owner_id: ownerId },
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual(entities);
    });
  });

  describe('getMineById()', () => {
    it('should return profile when it exists for owner', async () => {
      const entity = makeEntity();
      const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(entity);

      const result = await service.getMineById(ownerId, entity.id);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { id: entity.id, owner_id: ownerId },
      });
      expect(result).toBe(entity);
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      const findOneSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(
        service.getMineById(ownerId, '550e8400-e29b-41d4-a716-446655440499'),
      ).rejects.toThrow(NotFoundException);
      expect(findOneSpy).toHaveBeenCalledWith({
        where: {
          id: '550e8400-e29b-41d4-a716-446655440499',
          owner_id: ownerId,
        },
      });
    });
  });

  describe('updateMine()', () => {
    it('should update all fields when dto provides values', async () => {
      const entity = makeEntity();
      const dto: UpdateEquipmentProfileDto = {
        name: 'Updated Setup',
        mash_tun_volume_l: 35,
        boil_kettle_volume_l: 45,
        fermenter_volume_l: 32,
        trub_loss_l: 2.5,
        dead_space_loss_l: 1.2,
        transfer_loss_l: 1.1,
        evaporation_rate_l_per_hour: 4.5,
        efficiency_estimated_percent: 80,
        efficiency_measured_percent: 76,
        cooling_time_minutes: 30,
        cooling_flow_rate_l_per_minute: 7,
        system_type: EquipmentSystemType.ALL_IN_ONE,
      };

      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(entity);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(entity);

      const result = await service.updateMine(ownerId, entity.id, dto);

      expect(getMineByIdSpy).toHaveBeenCalledWith(ownerId, entity.id);
      expect(saveSpy).toHaveBeenCalledWith(entity);
      expect(result.name).toBe('Updated Setup');
      expect(result.mash_tun_volume_l).toBe(35);
      expect(result.boil_kettle_volume_l).toBe(45);
      expect(result.fermenter_volume_l).toBe(32);
      expect(result.trub_loss_l).toBe(2.5);
      expect(result.dead_space_loss_l).toBe(1.2);
      expect(result.transfer_loss_l).toBe(1.1);
      expect(result.evaporation_rate_l_per_hour).toBe(4.5);
      expect(result.efficiency_estimated_percent).toBe(80);
      expect(result.efficiency_measured_percent).toBe(76);
      expect(result.cooling_time_minutes).toBe(30);
      expect(result.cooling_flow_rate_l_per_minute).toBe(7);
      expect(result.system_type).toBe(EquipmentSystemType.ALL_IN_ONE);
    });

    it('should keep existing values when dto fields are undefined', async () => {
      const entity = makeEntity({
        name: 'Original Setup',
        mash_tun_volume_l: 30,
        boil_kettle_volume_l: 40,
        fermenter_volume_l: 30,
        trub_loss_l: 2,
        dead_space_loss_l: 1,
        transfer_loss_l: 1,
        evaporation_rate_l_per_hour: 4,
        efficiency_estimated_percent: 75,
        efficiency_measured_percent: 71,
        cooling_time_minutes: 28,
        cooling_flow_rate_l_per_minute: 6,
        system_type: EquipmentSystemType.ALL_GRAIN,
      });

      const dto: UpdateEquipmentProfileDto = {};

      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(entity);
      const saveSpy = jest.spyOn(repo, 'save').mockResolvedValue(entity);

      const result = await service.updateMine(ownerId, entity.id, dto);

      expect(getMineByIdSpy).toHaveBeenCalledWith(ownerId, entity.id);
      expect(saveSpy).toHaveBeenCalledWith(entity);
      expect(result.name).toBe('Original Setup');
      expect(result.mash_tun_volume_l).toBe(30);
      expect(result.boil_kettle_volume_l).toBe(40);
      expect(result.fermenter_volume_l).toBe(30);
      expect(result.trub_loss_l).toBe(2);
      expect(result.dead_space_loss_l).toBe(1);
      expect(result.transfer_loss_l).toBe(1);
      expect(result.evaporation_rate_l_per_hour).toBe(4);
      expect(result.efficiency_estimated_percent).toBe(75);
      expect(result.efficiency_measured_percent).toBe(71);
      expect(result.cooling_time_minutes).toBe(28);
      expect(result.cooling_flow_rate_l_per_minute).toBe(6);
      expect(result.system_type).toBe(EquipmentSystemType.ALL_GRAIN);
    });

    it('should throw when updated values violate domain invariants', async () => {
      const entity = makeEntity();
      const dto: UpdateEquipmentProfileDto = {
        efficiency_estimated_percent: 101,
      };

      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(entity);
      const saveSpy = jest.spyOn(repo, 'save');

      await expect(service.updateMine(ownerId, entity.id, dto)).rejects.toThrow(
        'Field "efficiencyEstimatedPercent" must be between 0 and 100',
      );
      expect(getMineByIdSpy).toHaveBeenCalledWith(ownerId, entity.id);
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteMine()', () => {
    it('should return deleted true when row exists', async () => {
      const deleteResult: DeleteResult = {
        raw: [],
        affected: 1,
      };

      const deleteSpy = jest
        .spyOn(repo, 'delete')
        .mockResolvedValue(deleteResult);

      const result = await service.deleteMine(
        ownerId,
        '550e8400-e29b-41d4-a716-446655440401',
      );

      expect(deleteSpy).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440401',
        owner_id: ownerId,
      });
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when no row is deleted', async () => {
      const deleteResult: DeleteResult = {
        raw: [],
        affected: 0,
      };

      const deleteSpy = jest
        .spyOn(repo, 'delete')
        .mockResolvedValue(deleteResult);

      await expect(
        service.deleteMine(ownerId, '550e8400-e29b-41d4-a716-446655440499'),
      ).rejects.toThrow(NotFoundException);
      expect(deleteSpy).toHaveBeenCalledWith({
        id: '550e8400-e29b-41d4-a716-446655440499',
        owner_id: ownerId,
      });
    });
  });
});

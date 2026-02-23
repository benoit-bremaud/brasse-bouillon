import { Test, TestingModule } from '@nestjs/testing';

import { CreateEquipmentProfileDto } from '../dtos/create-equipment-profile.dto';
import { EquipmentProfileController } from './equipment-profile.controller';
import { EquipmentProfileOrmEntity } from '../entities/equipment-profile.orm.entity';
import { EquipmentProfileService } from '../services/equipment-profile.service';
import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';
import { NotFoundException } from '@nestjs/common';
import { UpdateEquipmentProfileDto } from '../dtos/update-equipment-profile.dto';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

describe('EquipmentProfileController', () => {
  let controller: EquipmentProfileController;
  let service: EquipmentProfileService;

  const mockProfileOrm: EquipmentProfileOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
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
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockUser: User = Object.assign(new User(), {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    username: 'john',
    password_hash: 'hashed-password',
    first_name: 'John',
    last_name: 'Doe',
    role: UserRole.USER,
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EquipmentProfileController],
      providers: [
        {
          provide: EquipmentProfileService,
          useValue: {
            ping: jest.fn(),
            create: jest.fn(),
            listMine: jest.fn(),
            getMineById: jest.fn(),
            updateMine: jest.fn(),
            deleteMine: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EquipmentProfileController>(
      EquipmentProfileController,
    );
    service = module.get<EquipmentProfileService>(EquipmentProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listMine() - GET /equipment-profiles', () => {
    it('should list all equipment profiles for current user', async () => {
      const listMineSpy = jest
        .spyOn(service, 'listMine')
        .mockResolvedValue([mockProfileOrm]);

      const result = await controller.listMine(mockUser);

      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no profiles', async () => {
      const listMineSpy = jest.spyOn(service, 'listMine').mockResolvedValue([]);

      const result = await controller.listMine(mockUser);

      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([]);
    });
  });

  describe('getMineById() - GET /equipment-profiles/:id', () => {
    it('should return an equipment profile by ID', async () => {
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(mockProfileOrm);

      const result = await controller.getMineById(mockUser, mockProfileOrm.id);

      expect(getMineByIdSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockProfileOrm.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when profile not found', async () => {
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockRejectedValue(
          new NotFoundException('Equipment profile not found'),
        );

      await expect(
        controller.getMineById(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      expect(getMineByIdSpy).toHaveBeenCalledWith(mockUser.id, 'invalid-id');
    });
  });

  describe('create() - POST /equipment-profiles', () => {
    it('should create a new equipment profile', async () => {
      const dto: CreateEquipmentProfileDto = {
        name: 'My Brewing Setup',
        mash_tun_volume_l: 30,
        boil_kettle_volume_l: 40,
        fermenter_volume_l: 30,
        evaporation_rate_l_per_hour: 4,
        efficiency_estimated_percent: 75,
        system_type: EquipmentSystemType.ALL_GRAIN,
      };
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockProfileOrm);

      const result = await controller.create(mockUser, dto);

      expect(createSpy).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toBeDefined();
    });

    it('should propagate errors when creation fails', async () => {
      const dto: CreateEquipmentProfileDto = {
        name: 'Invalid',
        mash_tun_volume_l: -10,
        boil_kettle_volume_l: 40,
        fermenter_volume_l: 30,
        evaporation_rate_l_per_hour: 4,
        efficiency_estimated_percent: 75,
        system_type: EquipmentSystemType.ALL_GRAIN,
      };
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Invalid profile'));

      await expect(controller.create(mockUser, dto)).rejects.toThrow(
        'Invalid profile',
      );
      expect(createSpy).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('updateMine() - PATCH /equipment-profiles/:id', () => {
    it('should update an equipment profile', async () => {
      const dto: UpdateEquipmentProfileDto = { name: 'Updated Name' };
      const updatedProfile: EquipmentProfileOrmEntity = {
        ...mockProfileOrm,
        name: dto.name,
      };
      const updateMineSpy = jest
        .spyOn(service, 'updateMine')
        .mockResolvedValue(updatedProfile);

      const result = await controller.updateMine(
        mockUser,
        mockProfileOrm.id,
        dto,
      );

      expect(updateMineSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockProfileOrm.id,
        dto,
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when profile not found', async () => {
      const dto: UpdateEquipmentProfileDto = { name: 'Updated Name' };
      const updateMineSpy = jest
        .spyOn(service, 'updateMine')
        .mockRejectedValue(
          new NotFoundException('Equipment profile not found'),
        );

      await expect(
        controller.updateMine(mockUser, 'invalid-id', dto),
      ).rejects.toThrow(NotFoundException);
      expect(updateMineSpy).toHaveBeenCalledWith(
        mockUser.id,
        'invalid-id',
        dto,
      );
    });
  });

  describe('deleteMine() - DELETE /equipment-profiles/:id', () => {
    it('should delete an equipment profile', async () => {
      const deleteMineSpy = jest
        .spyOn(service, 'deleteMine')
        .mockResolvedValue({ deleted: true });

      const result = await controller.deleteMine(mockUser, mockProfileOrm.id);

      expect(deleteMineSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockProfileOrm.id,
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when profile not found', async () => {
      const deleteMineSpy = jest
        .spyOn(service, 'deleteMine')
        .mockRejectedValue(
          new NotFoundException('Equipment profile not found'),
        );

      await expect(
        controller.deleteMine(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      expect(deleteMineSpy).toHaveBeenCalledWith(mockUser.id, 'invalid-id');
    });
  });
});

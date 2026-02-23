import { Test, TestingModule } from '@nestjs/testing';

import { EquipmentProfileController } from './equipment-profile.controller';
import { EquipmentProfileService } from '../services/equipment-profile.service';
import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';
import { NotFoundException } from '@nestjs/common';

/**
 * EquipmentProfile Controller Test Suite
 *
 * Tests HTTP request/response handling for equipment profile operations.
 *
 * @test EquipmentProfileController
 * @requires EquipmentProfileService
 */
describe('EquipmentProfileController', () => {
  let controller: EquipmentProfileController;
  let service: EquipmentProfileService;

  /**
   * Mock equipment profile ORM entity
   */
  const mockProfileOrm = {
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

  /**
   * Mock current user
   */
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
  };

  /**
   * Setup: Initialize testing module
   */
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

  /**
   * Cleanup
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * GET /equipment-profiles - List profiles
   */
  describe('listMine() - GET /equipment-profiles', () => {
    it('should list all equipment profiles for current user', async () => {
      // Setup
      jest
        .spyOn(service, 'listMine')
        .mockResolvedValue([mockProfileOrm] as any);

      // Execute
      const result = await controller.listMine(mockUser as any);

      // Verify
      expect(service.listMine).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no profiles', async () => {
      // Setup
      jest.spyOn(service, 'listMine').mockResolvedValue([]);

      // Execute
      const result = await controller.listMine(mockUser as any);

      // Verify
      expect(result).toEqual([]);
    });
  });

  /**
   * GET /equipment-profiles/:id - Get profile by ID
   */
  describe('getMineById() - GET /equipment-profiles/:id', () => {
    it('should return an equipment profile by ID', async () => {
      // Setup
      jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(mockProfileOrm as any);

      // Execute
      const result = await controller.getMineById(
        mockUser as any,
        mockProfileOrm.id,
      );

      // Verify
      expect(service.getMineById).toHaveBeenCalledWith(
        mockUser.id,
        mockProfileOrm.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Setup
      jest
        .spyOn(service, 'getMineById')
        .mockRejectedValue(
          new NotFoundException('Equipment profile not found'),
        );

      // Execute & Verify
      await expect(
        controller.getMineById(mockUser as any, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * POST /equipment-profiles - Create profile
   */
  describe('create() - POST /equipment-profiles', () => {
    it('should create a new equipment profile', async () => {
      // Setup
      const dto = {
        name: 'My Brewing Setup',
        mash_tun_volume_l: 30,
        boil_kettle_volume_l: 40,
        fermenter_volume_l: 30,
        evaporation_rate_l_per_hour: 4,
        efficiency_estimated_percent: 75,
        system_type: EquipmentSystemType.ALL_GRAIN,
      };
      jest.spyOn(service, 'create').mockResolvedValue(mockProfileOrm as any);

      // Execute
      const result = await controller.create(mockUser as any, dto as any);

      // Verify
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toBeDefined();
    });

    it('should propagate errors when creation fails', async () => {
      // Setup
      const dto = {
        name: 'Invalid',
        mash_tun_volume_l: -10,
        boil_kettle_volume_l: 40,
        fermenter_volume_l: 30,
        evaporation_rate_l_per_hour: 4,
        efficiency_estimated_percent: 75,
        system_type: EquipmentSystemType.ALL_GRAIN,
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Invalid profile'));

      // Execute & Verify
      await expect(
        controller.create(mockUser as any, dto as any),
      ).rejects.toThrow('Invalid profile');
    });
  });

  /**
   * PATCH /equipment-profiles/:id - Update profile
   */
  describe('updateMine() - PATCH /equipment-profiles/:id', () => {
    it('should update an equipment profile', async () => {
      // Setup
      const dto = { name: 'Updated Name' };
      const updatedProfile = { ...mockProfileOrm, ...dto };
      jest
        .spyOn(service, 'updateMine')
        .mockResolvedValue(updatedProfile as any);

      // Execute
      const result = await controller.updateMine(
        mockUser as any,
        mockProfileOrm.id,
        dto as any,
      );

      // Verify
      expect(service.updateMine).toHaveBeenCalledWith(
        mockUser.id,
        mockProfileOrm.id,
        dto,
      );
      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Setup
      const dto = { name: 'Updated Name' };
      jest
        .spyOn(service, 'updateMine')
        .mockRejectedValue(
          new NotFoundException('Equipment profile not found'),
        );

      // Execute & Verify
      await expect(
        controller.updateMine(mockUser as any, 'invalid-id', dto as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * DELETE /equipment-profiles/:id - Delete profile
   */
  describe('deleteMine() - DELETE /equipment-profiles/:id', () => {
    it('should delete an equipment profile', async () => {
      // Setup
      jest.spyOn(service, 'deleteMine').mockResolvedValue({ deleted: true });

      // Execute
      const result = await controller.deleteMine(
        mockUser as any,
        mockProfileOrm.id,
      );

      // Verify
      expect(service.deleteMine).toHaveBeenCalledWith(
        mockUser.id,
        mockProfileOrm.id,
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Setup
      jest
        .spyOn(service, 'deleteMine')
        .mockRejectedValue(
          new NotFoundException('Equipment profile not found'),
        );

      // Execute & Verify
      await expect(
        controller.deleteMine(mockUser as any, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

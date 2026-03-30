import { Test, TestingModule } from '@nestjs/testing';

import { BatchController } from './batch.controller';
import { BatchOrmEntity } from '../entities/batch.orm.entity';
import { BatchReminderOrmEntity } from '../entities/batch-reminder.orm.entity';
import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';
import { BatchService } from '../services/batch.service';
import { BatchStatus } from '../domain/enums/batch-status.enum';
import { BatchStepOrmEntity } from '../entities/batch-step.orm.entity';
import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import { CreateBatchReminderDto } from '../dtos/create-batch-reminder.dto';
import { NotFoundException } from '@nestjs/common';
import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';
import { StartBatchDto } from '../dtos/start-batch.dto';
import { UpdateBatchReminderDto } from '../dtos/update-batch-reminder.dto';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

/**
 * Batch Controller Test Suite
 *
 * Tests HTTP request/response handling for batch operations.
 *
 * @test BatchController
 * @requires BatchService
 */
describe('BatchController', () => {
  let controller: BatchController;
  let service: BatchService;

  /**
   * Mock batch ORM entity
   */
  const mockBatchOrm: BatchOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
    recipe_id: '550e8400-e29b-41d4-a716-446655440002',
    status: BatchStatus.IN_PROGRESS,
    current_step_order: 1,
    started_at: new Date(),
    fermentation_started_at: null,
    fermentation_completed_at: null,
    completed_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  /**
   * Mock steps
   */
  const mockSteps: BatchStepOrmEntity[] = [
    {
      batch_id: '550e8400-e29b-41d4-a716-446655440001',
      step_order: 1,
      type: RecipeStepType.MASH,
      label: 'Mash',
      description: 'Mashing process',
      status: BatchStepStatus.IN_PROGRESS,
      started_at: new Date(),
      completed_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  /**
   * Mock reminder
   */
  const mockReminder: BatchReminderOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440020',
    batch_id: '550e8400-e29b-41d4-a716-446655440001',
    label: 'Check gravity',
    due_at: new Date('2026-03-01'),
    status: BatchReminderStatus.PENDING,
    created_at: new Date(),
    updated_at: new Date(),
  };

  /**
   * Mock current user
   */
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

  /**
   * Setup: Initialize testing module
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        {
          provide: BatchService,
          useValue: {
            startMine: jest.fn(),
            listMine: jest.fn(),
            getMineById: jest.fn(),
            deleteMine: jest.fn(),
            startFermentationMine: jest.fn(),
            completeFermentationMine: jest.fn(),
            listMineReminders: jest.fn(),
            createMineReminder: jest.fn(),
            updateMineReminder: jest.fn(),
            completeMineCurrentStep: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
    service = module.get<BatchService>(BatchService);
  });

  /**
   * Cleanup
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * POST /batches - Start a batch
   */
  describe('startMine() - POST /batches', () => {
    it('should start a new batch from recipe', async () => {
      // Setup
      const dto: StartBatchDto = {
        recipeId: '550e8400-e29b-41d4-a716-446655440002',
      };
      const startMineSpy = jest.spyOn(service, 'startMine').mockResolvedValue({
        batch: mockBatchOrm,
        steps: mockSteps,
      });

      // Execute
      const result = await controller.startMine(mockUser, dto);

      // Verify
      expect(startMineSpy).toHaveBeenCalledWith(mockUser.id, dto.recipeId);
      expect(result).toBeDefined();
    });

    it('should propagate errors when starting batch fails', async () => {
      // Setup
      const dto: StartBatchDto = { recipeId: 'invalid' };
      const startMineSpy = jest
        .spyOn(service, 'startMine')
        .mockRejectedValue(new NotFoundException('Recipe not found'));

      // Execute & Verify
      await expect(controller.startMine(mockUser, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(startMineSpy).toHaveBeenCalledWith(mockUser.id, dto.recipeId);
    });
  });

  /**
   * GET /batches - List batches
   */
  describe('listMine() - GET /batches', () => {
    it('should list all batches for current user', async () => {
      // Setup
      const listMineSpy = jest
        .spyOn(service, 'listMine')
        .mockResolvedValue([mockBatchOrm]);

      // Execute
      const result = await controller.listMine(mockUser);

      // Verify
      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no batches', async () => {
      // Setup
      const listMineSpy = jest.spyOn(service, 'listMine').mockResolvedValue([]);

      // Execute
      const result = await controller.listMine(mockUser);

      // Verify
      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([]);
    });
  });

  /**
   * GET /batches/:id - Get batch by ID
   */
  describe('getMineById() - GET /batches/:id', () => {
    it('should return a batch by ID', async () => {
      // Setup
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue({
          batch: mockBatchOrm,
          steps: mockSteps,
        });

      // Execute
      const result = await controller.getMineById(mockUser, mockBatchOrm.id);

      // Verify
      expect(getMineByIdSpy).toHaveBeenCalledWith(mockUser.id, mockBatchOrm.id);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when batch not found', async () => {
      // Setup
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockRejectedValue(new NotFoundException('Batch not found'));

      // Execute & Verify
      await expect(
        controller.getMineById(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      expect(getMineByIdSpy).toHaveBeenCalledWith(mockUser.id, 'invalid-id');
    });
  });

  /**
   * DELETE /batches/:id - Delete batch by ID
   */
  describe('deleteMine() - DELETE /batches/:id', () => {
    it('should delete a batch by ID', async () => {
      // Setup
      const deleteMineSpy = jest
        .spyOn(service, 'deleteMine')
        .mockResolvedValue(undefined);

      // Execute
      const result = await controller.deleteMine(mockUser, mockBatchOrm.id);

      // Verify
      expect(deleteMineSpy).toHaveBeenCalledWith(mockUser.id, mockBatchOrm.id);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException when deleting unknown batch', async () => {
      // Setup
      const deleteMineSpy = jest
        .spyOn(service, 'deleteMine')
        .mockRejectedValue(new NotFoundException('Batch not found'));

      // Execute & Verify
      await expect(
        controller.deleteMine(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      expect(deleteMineSpy).toHaveBeenCalledWith(mockUser.id, 'invalid-id');
    });
  });

  /**
   * POST /batches/:id/steps/current/complete - Complete current step
   */
  describe('completeMineCurrentStep() - POST /batches/:id/steps/current/complete', () => {
    it('should complete current step', async () => {
      // Setup
      const completeMineCurrentStepSpy = jest
        .spyOn(service, 'completeMineCurrentStep')
        .mockResolvedValue({
          batch: mockBatchOrm,
          steps: mockSteps,
        });

      // Execute
      const result = await controller.completeMineCurrentStep(
        mockUser,
        mockBatchOrm.id,
      );

      // Verify
      expect(completeMineCurrentStepSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
      );
      expect(result).toBeDefined();
    });
  });

  /**
   * POST /batches/:id/fermentation/start - Start fermentation
   */
  describe('startFermentationMine() - POST /batches/:id/fermentation/start', () => {
    it('should start fermentation', async () => {
      // Setup
      const batchWithFermentation: BatchOrmEntity = {
        ...mockBatchOrm,
        fermentation_started_at: new Date(),
      };
      const startFermentationMineSpy = jest
        .spyOn(service, 'startFermentationMine')
        .mockResolvedValue(batchWithFermentation);

      // Execute
      const result = await controller.startFermentationMine(
        mockUser,
        mockBatchOrm.id,
      );

      // Verify
      expect(startFermentationMineSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
      );
      expect(result).toBeDefined();
    });
  });

  /**
   * POST /batches/:id/fermentation/complete - Complete fermentation
   */
  describe('completeFermentationMine() - POST /batches/:id/fermentation/complete', () => {
    it('should complete fermentation', async () => {
      // Setup
      const completedBatch: BatchOrmEntity = {
        ...mockBatchOrm,
        fermentation_started_at: new Date(),
        fermentation_completed_at: new Date(),
      };
      const completeFermentationMineSpy = jest
        .spyOn(service, 'completeFermentationMine')
        .mockResolvedValue(completedBatch);

      // Execute
      const result = await controller.completeFermentationMine(
        mockUser,
        mockBatchOrm.id,
      );

      // Verify
      expect(completeFermentationMineSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
      );
      expect(result).toBeDefined();
    });
  });

  /**
   * GET /batches/:id/reminders - List reminders
   */
  describe('listMineReminders() - GET /batches/:id/reminders', () => {
    it('should list all reminders for a batch', async () => {
      // Setup
      const listMineRemindersSpy = jest
        .spyOn(service, 'listMineReminders')
        .mockResolvedValue([mockReminder]);

      // Execute
      const result = await controller.listMineReminders(
        mockUser,
        mockBatchOrm.id,
      );

      // Verify
      expect(listMineRemindersSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
      );
      expect(result).toHaveLength(1);
    });
  });

  /**
   * POST /batches/:id/reminders - Create reminder
   */
  describe('createMineReminder() - POST /batches/:id/reminders', () => {
    it('should create a reminder', async () => {
      // Setup
      const dto: CreateBatchReminderDto = {
        label: 'Check gravity',
        dueAt: '2026-03-01T00:00:00.000Z',
      };
      const createMineReminderSpy = jest
        .spyOn(service, 'createMineReminder')
        .mockResolvedValue(mockReminder);

      // Execute
      const result = await controller.createMineReminder(
        mockUser,
        mockBatchOrm.id,
        dto,
      );

      // Verify
      expect(createMineReminderSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
        {
          label: dto.label,
          dueAt: new Date(dto.dueAt),
        },
      );
      expect(result).toBeDefined();
    });
  });

  /**
   * PATCH /batches/:id/reminders/:reminderId - Update reminder
   */
  describe('updateMineReminder() - PATCH /batches/:id/reminders/:reminderId', () => {
    it('should update a reminder', async () => {
      // Setup
      const dto = {
        label: 'Updated label',
        status: BatchReminderStatus.DONE,
      } satisfies UpdateBatchReminderDto;
      const updatedReminder: BatchReminderOrmEntity = {
        ...mockReminder,
        label: dto.label,
        status: dto.status,
      };
      const updateMineReminderSpy = jest
        .spyOn(service, 'updateMineReminder')
        .mockResolvedValue(updatedReminder);

      // Execute
      const result = await controller.updateMineReminder(
        mockUser,
        mockBatchOrm.id,
        mockReminder.id,
        dto,
      );

      // Verify
      expect(updateMineReminderSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
        mockReminder.id,
        expect.objectContaining({
          label: dto.label,
          status: dto.status,
        }),
      );
      expect(result).toBeDefined();
    });

    it('should update reminder with partial data', async () => {
      // Setup
      const dto = {
        status: BatchReminderStatus.DONE,
      } satisfies UpdateBatchReminderDto;
      const partiallyUpdatedReminder: BatchReminderOrmEntity = {
        ...mockReminder,
        status: dto.status,
      };
      const updateMineReminderSpy = jest
        .spyOn(service, 'updateMineReminder')
        .mockResolvedValue(partiallyUpdatedReminder);

      // Execute
      const result = await controller.updateMineReminder(
        mockUser,
        mockBatchOrm.id,
        mockReminder.id,
        dto,
      );

      // Verify
      expect(updateMineReminderSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
        mockReminder.id,
        expect.objectContaining({ status: dto.status }),
      );
      expect(result).toBeDefined();
    });
  });
});

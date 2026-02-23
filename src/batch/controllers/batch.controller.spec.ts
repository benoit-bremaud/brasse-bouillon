import { Test, TestingModule } from '@nestjs/testing';

import { BatchController } from './batch.controller';
import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';
import { BatchService } from '../services/batch.service';
import { BatchStatus } from '../domain/enums/batch-status.enum';
import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import { NotFoundException } from '@nestjs/common';

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
   * Mock batch object
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockBatch: Batch = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    ownerId: '550e8400-e29b-41d4-a716-446655440000',
    recipeId: '550e8400-e29b-41d4-a716-446655440002',
    status: BatchStatus.IN_PROGRESS,
    currentStepOrder: 1,
    steps: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    startedAt: new Date(),
  };

  /**
   * Mock batch ORM entity
   */
  const mockBatchOrm = {
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
  const mockSteps = [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      batch_id: '550e8400-e29b-41d4-a716-446655440001',
      step_order: 1,
      type: 'MASH' as const,
      label: 'Mash',
      description: 'Mashing process',
      status: BatchStepStatus.IN_PROGRESS as const,
      started_at: new Date(),
      completed_at: null,
    },
  ];

  /**
   * Mock reminder
   */
  const mockReminder = {
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
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
  };

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
      const dto = { recipeId: '550e8400-e29b-41d4-a716-446655440002' };
      jest.spyOn(service, 'startMine').mockResolvedValue({
        batch: mockBatchOrm,
        steps: mockSteps,
      });

      // Execute
      const result = await controller.startMine(mockUser as any, dto);

      // Verify
      expect(service.startMine).toHaveBeenCalledWith(mockUser.id, dto.recipeId);
      expect(result).toBeDefined();
    });

    it('should propagate errors when starting batch fails', async () => {
      // Setup
      const dto = { recipeId: 'invalid' };
      jest
        .spyOn(service, 'startMine')
        .mockRejectedValue(new NotFoundException('Recipe not found'));

      // Execute & Verify
      await expect(controller.startMine(mockUser as any, dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  /**
   * GET /batches - List batches
   */
  describe('listMine() - GET /batches', () => {
    it('should list all batches for current user', async () => {
      // Setup
      jest.spyOn(service, 'listMine').mockResolvedValue([mockBatchOrm]);

      // Execute
      const result = await controller.listMine(mockUser as any);

      // Verify
      expect(service.listMine).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no batches', async () => {
      // Setup
      jest.spyOn(service, 'listMine').mockResolvedValue([]);

      // Execute
      const result = await controller.listMine(mockUser as any);

      // Verify
      expect(result).toEqual([]);
    });
  });

  /**
   * GET /batches/:id - Get batch by ID
   */
  describe('getMineById() - GET /batches/:id', () => {
    it('should return a batch by ID', async () => {
      // Setup
      jest.spyOn(service, 'getMineById').mockResolvedValue({
        batch: mockBatchOrm,
        steps: mockSteps,
      });

      // Execute
      const result = await controller.getMineById(
        mockUser as any,
        mockBatchOrm.id,
      );

      // Verify
      expect(service.getMineById).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when batch not found', async () => {
      // Setup
      jest
        .spyOn(service, 'getMineById')
        .mockRejectedValue(new NotFoundException('Batch not found'));

      // Execute & Verify
      await expect(
        controller.getMineById(mockUser as any, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * POST /batches/:id/steps/current/complete - Complete current step
   */
  describe('completeMineCurrentStep() - POST /batches/:id/steps/current/complete', () => {
    it('should complete current step', async () => {
      // Setup
      jest.spyOn(service, 'completeMineCurrentStep').mockResolvedValue({
        batch: mockBatchOrm,
        steps: mockSteps,
      });

      // Execute
      const result = await controller.completeMineCurrentStep(
        mockUser as any,
        mockBatchOrm.id,
      );

      // Verify
      expect(service.completeMineCurrentStep).toHaveBeenCalledWith(
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
      const batchWithFermentation = {
        ...mockBatchOrm,
        fermentation_started_at: new Date(),
      };
      jest
        .spyOn(service, 'startFermentationMine')
        .mockResolvedValue(batchWithFermentation as any);

      // Execute
      const result = await controller.startFermentationMine(
        mockUser as any,
        mockBatchOrm.id,
      );

      // Verify
      expect(service.startFermentationMine).toHaveBeenCalledWith(
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
      const completedBatch = {
        ...mockBatchOrm,
        fermentation_started_at: new Date(),
        fermentation_completed_at: new Date(),
      };
      jest
        .spyOn(service, 'completeFermentationMine')
        .mockResolvedValue(completedBatch as any);

      // Execute
      const result = await controller.completeFermentationMine(
        mockUser as any,
        mockBatchOrm.id,
      );

      // Verify
      expect(service.completeFermentationMine).toHaveBeenCalledWith(
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
      jest
        .spyOn(service, 'listMineReminders')
        .mockResolvedValue([mockReminder] as any);

      // Execute
      const result = await controller.listMineReminders(
        mockUser as any,
        mockBatchOrm.id,
      );

      // Verify
      expect(service.listMineReminders).toHaveBeenCalledWith(
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
      const dto = {
        label: 'Check gravity',
        dueAt: '2026-03-01T00:00:00.000Z',
      };
      jest
        .spyOn(service, 'createMineReminder')
        .mockResolvedValue(mockReminder as any);

      // Execute
      const result = await controller.createMineReminder(
        mockUser as any,
        mockBatchOrm.id,
        dto as any,
      );

      // Verify
      expect(service.createMineReminder).toHaveBeenCalledWith(
        mockUser.id,
        mockBatchOrm.id,
        expect.objectContaining({
          label: dto.label,
          dueAt: expect.any(Date),
        }),
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
        status: BatchReminderStatus.COMPLETED,
      };
      const updatedReminder = { ...mockReminder, ...dto };
      jest
        .spyOn(service, 'updateMineReminder')
        .mockResolvedValue(updatedReminder as any);

      // Execute
      const result = await controller.updateMineReminder(
        mockUser as any,
        mockBatchOrm.id,
        mockReminder.id,
        dto as any,
      );

      // Verify
      expect(service.updateMineReminder).toHaveBeenCalledWith(
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
      const dto = { status: BatchReminderStatus.COMPLETED };
      jest
        .spyOn(service, 'updateMineReminder')
        .mockResolvedValue({ ...mockReminder, ...dto } as any);

      // Execute
      const result = await controller.updateMineReminder(
        mockUser as any,
        mockBatchOrm.id,
        mockReminder.id,
        dto as any,
      );

      // Verify
      expect(result).toBeDefined();
    });
  });
});

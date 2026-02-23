import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from '../services/recipe.service';
import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';

/**
 * Recipe Controller Test Suite
 *
 * Tests HTTP request/response handling for recipe operations.
 *
 * @test RecipeController
 * @requires RecipeService
 */
describe('RecipeController', () => {
  let controller: RecipeController;
  let service: RecipeService;

  /**
   * Mock recipe ORM entity
   */
  const mockRecipeOrm = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'My IPA Recipe',
    description: 'A delicious IPA',
    visibility: RecipeVisibility.PRIVATE,

    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.065,
    fg_target: 1.015,
    abv_estimated: 6.5,
    ibu_target: 50,
    ebc_target: 15,
    efficiency_target: 75,

    created_at: new Date(),
    updated_at: new Date(),
  };

  /**
   * Mock recipe step
   */
  const mockRecipeStep = {
    id: '550e8400-e29b-41d4-a716-446655440010',
    recipe_id: '550e8400-e29b-41d4-a716-446655440001',
    step_order: 1,
    type: RecipeStepType.MASH,
    label: 'Mash',
    description: 'Mash at 68°C for 60 min',
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
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeService,
          useValue: {
            create: jest.fn(),
            listMine: jest.fn(),
            getMineById: jest.fn(),
            updateMine: jest.fn(),
            deleteMine: jest.fn(),
            listMineSteps: jest.fn(),
            updateMineStep: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecipeController>(RecipeController);
    service = module.get<RecipeService>(RecipeService);
  });

  /**
   * Cleanup
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * POST /recipes - Create recipe
   */
  describe('create() - POST /recipes', () => {
    it('should create a new recipe', async () => {
      // Setup
      const dto = {
        name: 'My IPA Recipe',
        visibility: RecipeVisibility.PRIVATE,
        batch_size_l: 20,
        boil_time_min: 60,
      };
      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockRecipeOrm as any);

      // Execute
      const result = await controller.create(mockUser as any, dto as any);

      // Verify
      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toBeDefined();
    });

    it('should propagate errors when creation fails', async () => {
      // Setup
      const dto = { name: '' };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Invalid recipe'));

      // Execute & Verify
      await expect(
        controller.create(mockUser as any, dto as any),
      ).rejects.toThrow('Invalid recipe');
    });
  });

  /**
   * GET /recipes - List recipes
   */
  describe('listMine() - GET /recipes', () => {
    it('should list all recipes for current user', async () => {
      // Setup
      jest
        .spyOn(service, 'listMine')
        .mockResolvedValue([mockRecipeOrm] as any);

      // Execute
      const result = await controller.listMine(mockUser as any);

      // Verify
      expect(service.listMine).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no recipes', async () => {
      // Setup
      jest.spyOn(service, 'listMine').mockResolvedValue([]);

      // Execute
      const result = await controller.listMine(mockUser as any);

      // Verify
      expect(result).toEqual([]);
    });
  });

  /**
   * GET /recipes/:id - Get recipe by ID
   */
  describe('getMineById() - GET /recipes/:id', () => {
    it('should return a recipe by ID', async () => {
      // Setup
      jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(mockRecipeOrm as any);

      // Execute
      const result = await controller.getMineById(
        mockUser as any,
        mockRecipeOrm.id,
      );

      // Verify
      expect(service.getMineById).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when recipe not found', async () => {
      // Setup
      jest
        .spyOn(service, 'getMineById')
        .mockRejectedValue(new NotFoundException('Recipe not found'));

      // Execute & Verify
      await expect(
        controller.getMineById(mockUser as any, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * PATCH /recipes/:id - Update recipe
   */
  describe('updateMine() - PATCH /recipes/:id', () => {
    it('should update a recipe', async () => {
      // Setup
      const dto = { name: 'Updated Recipe Name' };
      const updatedRecipe = { ...mockRecipeOrm, ...dto };
      jest
        .spyOn(service, 'updateMine')
        .mockResolvedValue(updatedRecipe as any);

      // Execute
      const result = await controller.updateMine(
        mockUser as any,
        mockRecipeOrm.id,
        dto as any,
      );

      // Verify
      expect(service.updateMine).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
        dto,
      );
      expect(result).toBeDefined();
    });
  });

  /**
   * DELETE /recipes/:id - Delete recipe
   */
  describe('deleteMine() - DELETE /recipes/:id', () => {
    it('should delete a recipe', async () => {
      // Setup
      jest
        .spyOn(service, 'deleteMine')
        .mockResolvedValue({ deleted: true });

      // Execute
      const result = await controller.deleteMine(
        mockUser as any,
        mockRecipeOrm.id,
      );

      // Verify
      expect(service.deleteMine).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
      );
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when recipe not found', async () => {
      // Setup
      jest
        .spyOn(service, 'deleteMine')
        .mockRejectedValue(new NotFoundException('Recipe not found'));

      // Execute & Verify
      await expect(
        controller.deleteMine(mockUser as any, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * GET /recipes/:id/steps - List steps
   */
  describe('listMineSteps() - GET /recipes/:id/steps', () => {
    it('should list all steps for a recipe', async () => {
      // Setup
      jest
        .spyOn(service, 'listMineSteps')
        .mockResolvedValue([mockRecipeStep] as any);

      // Execute
      const result = await controller.listMineSteps(
        mockUser as any,
        mockRecipeOrm.id,
      );

      // Verify
      expect(service.listMineSteps).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
      );
      expect(result).toHaveLength(1);
    });
  });

  /**
   * PATCH /recipes/:id/steps/:order - Update step
   */
  describe('updateMineStep() - PATCH /recipes/:id/steps/:order', () => {
    it('should update a recipe step', async () => {
      // Setup
      const dto = { label: 'Updated Step Label' };
      const updatedStep = { ...mockRecipeStep, ...dto };
      jest
        .spyOn(service, 'updateMineStep')
        .mockResolvedValue(updatedStep as any);

      // Execute
      const result = await controller.updateMineStep(
        mockUser as any,
        mockRecipeOrm.id,
        1,
        dto as any,
      );

      // Verify
      expect(service.updateMineStep).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
        1,
        dto,
      );
      expect(result).toBeDefined();
    });
  });
});

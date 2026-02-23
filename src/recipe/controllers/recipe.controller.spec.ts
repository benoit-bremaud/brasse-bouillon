import { Test, TestingModule } from '@nestjs/testing';

import { CreateRecipeDto } from '../dtos/create-recipe.dto';
import { NotFoundException } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeService } from '../services/recipe.service';
import { RecipeStepOrmEntity } from '../entities/recipe-step.orm.entity';
import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { UpdateRecipeDto } from '../dtos/update-recipe.dto';
import { UpdateRecipeStepDto } from '../dtos/update-recipe-step.dto';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

describe('RecipeController', () => {
  let controller: RecipeController;
  let service: RecipeService;

  const mockRecipeOrm: RecipeOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    owner_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'My IPA Recipe',
    description: 'A delicious IPA',
    visibility: RecipeVisibility.PRIVATE,
    version: 1,
    root_recipe_id: '550e8400-e29b-41d4-a716-446655440001',
    parent_recipe_id: null,
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

  const mockRecipeStep: RecipeStepOrmEntity = {
    recipe_id: '550e8400-e29b-41d4-a716-446655440001',
    step_order: 1,
    type: RecipeStepType.MASH,
    label: 'Mash',
    description: 'Mash at 68°C for 60 min',
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create() - POST /recipes', () => {
    it('should create a new recipe', async () => {
      const dto: CreateRecipeDto = {
        name: 'My IPA Recipe',
        visibility: RecipeVisibility.PRIVATE,
        batch_size_l: 20,
        boil_time_min: 60,
      };
      const createSpy = jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockRecipeOrm);

      const result = await controller.create(mockUser, dto);

      expect(createSpy).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toBeDefined();
    });

    it('should propagate errors when creation fails', async () => {
      const dto: CreateRecipeDto = { name: '' };
      const createSpy = jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Invalid recipe'));

      await expect(controller.create(mockUser, dto)).rejects.toThrow(
        'Invalid recipe',
      );
      expect(createSpy).toHaveBeenCalledWith(mockUser.id, dto);
    });
  });

  describe('listMine() - GET /recipes', () => {
    it('should list all recipes for current user', async () => {
      const listMineSpy = jest
        .spyOn(service, 'listMine')
        .mockResolvedValue([mockRecipeOrm]);

      const result = await controller.listMine(mockUser);

      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no recipes', async () => {
      const listMineSpy = jest.spyOn(service, 'listMine').mockResolvedValue([]);

      const result = await controller.listMine(mockUser);

      expect(listMineSpy).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([]);
    });
  });

  describe('getMineById() - GET /recipes/:id', () => {
    it('should return a recipe by ID', async () => {
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockResolvedValue(mockRecipeOrm);

      const result = await controller.getMineById(mockUser, mockRecipeOrm.id);

      expect(getMineByIdSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
      );
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when recipe not found', async () => {
      const getMineByIdSpy = jest
        .spyOn(service, 'getMineById')
        .mockRejectedValue(new NotFoundException('Recipe not found'));

      await expect(
        controller.getMineById(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      expect(getMineByIdSpy).toHaveBeenCalledWith(mockUser.id, 'invalid-id');
    });
  });

  describe('updateMine() - PATCH /recipes/:id', () => {
    it('should update a recipe', async () => {
      const dto: UpdateRecipeDto = { name: 'Updated Recipe Name' };
      const updatedRecipe: RecipeOrmEntity = {
        ...mockRecipeOrm,
        name: dto.name,
      };
      const updateMineSpy = jest
        .spyOn(service, 'updateMine')
        .mockResolvedValue(updatedRecipe);

      const result = await controller.updateMine(
        mockUser,
        mockRecipeOrm.id,
        dto,
      );

      expect(updateMineSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
        dto,
      );
      expect(result).toBeDefined();
    });
  });

  describe('deleteMine() - DELETE /recipes/:id', () => {
    it('should delete a recipe', async () => {
      const deleteMineSpy = jest
        .spyOn(service, 'deleteMine')
        .mockResolvedValue({ deleted: true });

      const result = await controller.deleteMine(mockUser, mockRecipeOrm.id);

      expect(deleteMineSpy).toHaveBeenCalledWith(mockUser.id, mockRecipeOrm.id);
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException when recipe not found', async () => {
      const deleteMineSpy = jest
        .spyOn(service, 'deleteMine')
        .mockRejectedValue(new NotFoundException('Recipe not found'));

      await expect(
        controller.deleteMine(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
      expect(deleteMineSpy).toHaveBeenCalledWith(mockUser.id, 'invalid-id');
    });
  });

  describe('listMineSteps() - GET /recipes/:id/steps', () => {
    it('should list all steps for a recipe', async () => {
      const listMineStepsSpy = jest
        .spyOn(service, 'listMineSteps')
        .mockResolvedValue([mockRecipeStep]);

      const result = await controller.listMineSteps(mockUser, mockRecipeOrm.id);

      expect(listMineStepsSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('updateMineStep() - PATCH /recipes/:id/steps/:order', () => {
    it('should update a recipe step', async () => {
      const dto: UpdateRecipeStepDto = { label: 'Updated Step Label' };
      const updatedStep: RecipeStepOrmEntity = {
        ...mockRecipeStep,
        label: dto.label,
      };
      const updateMineStepSpy = jest
        .spyOn(service, 'updateMineStep')
        .mockResolvedValue(updatedStep);

      const result = await controller.updateMineStep(
        mockUser,
        mockRecipeOrm.id,
        1,
        dto,
      );

      expect(updateMineStepSpy).toHaveBeenCalledWith(
        mockUser.id,
        mockRecipeOrm.id,
        1,
        dto,
      );
      expect(result).toBeDefined();
    });
  });
});

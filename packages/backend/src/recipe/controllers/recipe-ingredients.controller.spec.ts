import { Test, TestingModule } from '@nestjs/testing';

import { CreateRecipeAdditiveDto } from '../dtos/create-recipe-additive.dto';
import { CreateRecipeFermentableDto } from '../dtos/create-recipe-fermentable.dto';
import { CreateRecipeHopDto } from '../dtos/create-recipe-hop.dto';
import { CreateRecipeYeastDto } from '../dtos/create-recipe-yeast.dto';
import { NotFoundException } from '@nestjs/common';
import { RecipeAdditiveOrmEntity } from '../entities/recipe-additive.orm.entity';
import { RecipeAdditiveType } from '../domain/enums/recipe-additive-type.enum';
import { RecipeFermentableOrmEntity } from '../entities/recipe-fermentable.orm.entity';
import { RecipeFermentableType } from '../domain/enums/recipe-fermentable-type.enum';
import { RecipeHopAdditionStage } from '../domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeHopType } from '../domain/enums/recipe-hop-type.enum';
import { RecipeIngredientsController } from './recipe-ingredients.controller';
import { RecipeIngredientsService } from '../services/recipe-ingredients.service';
import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';
import { RecipeWaterOrmEntity } from '../entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from '../entities/recipe-yeast.orm.entity';
import { RecipeYeastType } from '../domain/enums/recipe-yeast-type.enum';
import { UpdateRecipeAdditiveDto } from '../dtos/update-recipe-additive.dto';
import { UpdateRecipeFermentableDto } from '../dtos/update-recipe-fermentable.dto';
import { UpdateRecipeHopDto } from '../dtos/update-recipe-hop.dto';
import { UpdateRecipeYeastDto } from '../dtos/update-recipe-yeast.dto';
import { UpsertRecipeWaterDto } from '../dtos/upsert-recipe-water.dto';
import { User } from '../../user/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

describe('RecipeIngredientsController', () => {
  let controller: RecipeIngredientsController;
  let service: RecipeIngredientsService;

  const user: User = Object.assign(new User(), {
    id: '550e8400-e29b-41d4-a716-446655440300',
    email: 'owner@example.com',
    username: 'owner',
    password_hash: 'hashed-password',
    first_name: 'Owner',
    last_name: 'User',
    role: UserRole.USER,
    is_active: true,
    created_at: new Date('2026-02-01T10:00:00.000Z'),
    updated_at: new Date('2026-02-01T10:00:00.000Z'),
  });

  const recipeId = '550e8400-e29b-41d4-a716-446655440301';

  const fermentableEntity: RecipeFermentableOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440311',
    recipe_id: recipeId,
    name: 'Pale Malt',
    type: RecipeFermentableType.GRAIN,
    weight_g: 4500,
    potential_gravity: 1.037,
    color_ebc: 4,
    created_at: new Date('2026-02-01T10:00:00.000Z'),
    updated_at: new Date('2026-02-01T10:00:00.000Z'),
  };

  const hopEntity: RecipeHopOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440321',
    recipe_id: recipeId,
    variety: 'Cascade',
    type: RecipeHopType.PELLET,
    weight_g: 28,
    alpha_acid_percent: 5.5,
    addition_stage: RecipeHopAdditionStage.BOIL,
    addition_time_min: 60,
    created_at: new Date('2026-02-01T10:00:00.000Z'),
    updated_at: new Date('2026-02-01T10:00:00.000Z'),
  };

  const yeastEntity: RecipeYeastOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440331',
    recipe_id: recipeId,
    name: 'Safale US-05',
    type: RecipeYeastType.ALE,
    amount_g: 11.5,
    attenuation_percent: 77,
    temperature_min_c: 18,
    temperature_max_c: 22,
    created_at: new Date('2026-02-01T10:00:00.000Z'),
    updated_at: new Date('2026-02-01T10:00:00.000Z'),
  };

  const additiveEntity: RecipeAdditiveOrmEntity = {
    id: '550e8400-e29b-41d4-a716-446655440341',
    recipe_id: recipeId,
    name: 'Irish Moss',
    type: RecipeAdditiveType.FINING,
    amount_g: 5,
    addition_step: RecipeStepType.BOIL,
    addition_time_min: 15,
    created_at: new Date('2026-02-01T10:00:00.000Z'),
    updated_at: new Date('2026-02-01T10:00:00.000Z'),
  };

  const waterEntity: RecipeWaterOrmEntity = {
    recipe_id: recipeId,
    mash_volume_l: 17,
    sparge_volume_l: 12,
    mash_temperature_c: 67,
    sparge_temperature_c: 78,
    calcium_ppm: 80,
    magnesium_ppm: 10,
    sulfate_ppm: 150,
    chloride_ppm: 50,
    ph_target: 5.4,
    created_at: new Date('2026-02-01T10:00:00.000Z'),
    updated_at: new Date('2026-02-01T10:00:00.000Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeIngredientsController],
      providers: [
        {
          provide: RecipeIngredientsService,
          useValue: {
            listFermentables: jest.fn(),
            addFermentable: jest.fn(),
            updateFermentable: jest.fn(),
            removeFermentable: jest.fn(),
            listHops: jest.fn(),
            addHop: jest.fn(),
            updateHop: jest.fn(),
            removeHop: jest.fn(),
            listYeasts: jest.fn(),
            addYeast: jest.fn(),
            updateYeast: jest.fn(),
            removeYeast: jest.fn(),
            listAdditives: jest.fn(),
            addAdditive: jest.fn(),
            updateAdditive: jest.fn(),
            removeAdditive: jest.fn(),
            getWater: jest.fn(),
            upsertWater: jest.fn(),
            removeWater: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecipeIngredientsController>(
      RecipeIngredientsController,
    );
    service = module.get<RecipeIngredientsService>(RecipeIngredientsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fermentables', () => {
    it('should list fermentables', async () => {
      const listFermentablesSpy = jest
        .spyOn(service, 'listFermentables')
        .mockResolvedValue([fermentableEntity]);

      const result = await controller.listFermentables(user, recipeId);

      expect(listFermentablesSpy).toHaveBeenCalledWith(user.id, recipeId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: fermentableEntity.id,
          recipe_id: fermentableEntity.recipe_id,
          name: fermentableEntity.name,
          type: fermentableEntity.type,
          weight_g: fermentableEntity.weight_g,
        }),
      );
    });

    it('should add fermentable', async () => {
      const dto: CreateRecipeFermentableDto = {
        name: 'Pale Malt',
        type: RecipeFermentableType.GRAIN,
        weight_g: 4500,
        potential_gravity: 1.037,
        color_ebc: 4,
      };

      const addFermentableSpy = jest
        .spyOn(service, 'addFermentable')
        .mockResolvedValue(fermentableEntity);

      const result = await controller.addFermentable(user, recipeId, dto);

      expect(addFermentableSpy).toHaveBeenCalledWith(user.id, recipeId, dto);
      expect(result.id).toBe(fermentableEntity.id);
    });

    it('should update fermentable', async () => {
      const fermentableId = fermentableEntity.id;
      const dto: UpdateRecipeFermentableDto = {
        weight_g: 4200,
      };

      const updateFermentableSpy = jest
        .spyOn(service, 'updateFermentable')
        .mockResolvedValue({
          ...fermentableEntity,
          weight_g: 4200,
        });

      const result = await controller.updateFermentable(
        user,
        recipeId,
        fermentableId,
        dto,
      );

      expect(updateFermentableSpy).toHaveBeenCalledWith(
        user.id,
        recipeId,
        fermentableId,
        dto,
      );
      expect(result.weight_g).toBe(4200);
    });

    it('should remove fermentable', async () => {
      const fermentableId = fermentableEntity.id;
      const removeFermentableSpy = jest
        .spyOn(service, 'removeFermentable')
        .mockResolvedValue({ deleted: true });

      const result = await controller.removeFermentable(
        user,
        recipeId,
        fermentableId,
      );

      expect(removeFermentableSpy).toHaveBeenCalledWith(
        user.id,
        recipeId,
        fermentableId,
      );
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('hops', () => {
    it('should list hops', async () => {
      const listHopsSpy = jest
        .spyOn(service, 'listHops')
        .mockResolvedValue([hopEntity]);

      const result = await controller.listHops(user, recipeId);

      expect(listHopsSpy).toHaveBeenCalledWith(user.id, recipeId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: hopEntity.id,
          variety: hopEntity.variety,
          type: hopEntity.type,
          addition_stage: hopEntity.addition_stage,
        }),
      );
    });

    it('should add hop', async () => {
      const dto: CreateRecipeHopDto = {
        variety: 'Cascade',
        type: RecipeHopType.PELLET,
        weight_g: 28,
        alpha_acid_percent: 5.5,
        addition_stage: RecipeHopAdditionStage.BOIL,
        addition_time_min: 60,
      };

      const addHopSpy = jest
        .spyOn(service, 'addHop')
        .mockResolvedValue(hopEntity);

      const result = await controller.addHop(user, recipeId, dto);

      expect(addHopSpy).toHaveBeenCalledWith(user.id, recipeId, dto);
      expect(result.id).toBe(hopEntity.id);
    });

    it('should update hop', async () => {
      const hopId = hopEntity.id;
      const dto: UpdateRecipeHopDto = {
        addition_time_min: 20,
      };

      const updateHopSpy = jest.spyOn(service, 'updateHop').mockResolvedValue({
        ...hopEntity,
        addition_time_min: 20,
      });

      const result = await controller.updateHop(user, recipeId, hopId, dto);

      expect(updateHopSpy).toHaveBeenCalledWith(user.id, recipeId, hopId, dto);
      expect(result.addition_time_min).toBe(20);
    });

    it('should remove hop', async () => {
      const hopId = hopEntity.id;
      const removeHopSpy = jest
        .spyOn(service, 'removeHop')
        .mockResolvedValue({ deleted: true });

      const result = await controller.removeHop(user, recipeId, hopId);

      expect(removeHopSpy).toHaveBeenCalledWith(user.id, recipeId, hopId);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('yeasts', () => {
    it('should list yeasts', async () => {
      const listYeastsSpy = jest
        .spyOn(service, 'listYeasts')
        .mockResolvedValue([yeastEntity]);

      const result = await controller.listYeasts(user, recipeId);

      expect(listYeastsSpy).toHaveBeenCalledWith(user.id, recipeId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: yeastEntity.id,
          name: yeastEntity.name,
          type: yeastEntity.type,
          amount_g: yeastEntity.amount_g,
        }),
      );
    });

    it('should add yeast', async () => {
      const dto: CreateRecipeYeastDto = {
        name: 'Safale US-05',
        type: RecipeYeastType.ALE,
        amount_g: 11.5,
        attenuation_percent: 77,
        temperature_min_c: 18,
        temperature_max_c: 22,
      };

      const addYeastSpy = jest
        .spyOn(service, 'addYeast')
        .mockResolvedValue(yeastEntity);

      const result = await controller.addYeast(user, recipeId, dto);

      expect(addYeastSpy).toHaveBeenCalledWith(user.id, recipeId, dto);
      expect(result.id).toBe(yeastEntity.id);
    });

    it('should update yeast', async () => {
      const yeastId = yeastEntity.id;
      const dto: UpdateRecipeYeastDto = {
        temperature_max_c: 24,
      };

      const updateYeastSpy = jest
        .spyOn(service, 'updateYeast')
        .mockResolvedValue({
          ...yeastEntity,
          temperature_max_c: 24,
        });

      const result = await controller.updateYeast(user, recipeId, yeastId, dto);

      expect(updateYeastSpy).toHaveBeenCalledWith(
        user.id,
        recipeId,
        yeastId,
        dto,
      );
      expect(result.temperature_max_c).toBe(24);
    });

    it('should remove yeast', async () => {
      const yeastId = yeastEntity.id;
      const removeYeastSpy = jest
        .spyOn(service, 'removeYeast')
        .mockResolvedValue({ deleted: true });

      const result = await controller.removeYeast(user, recipeId, yeastId);

      expect(removeYeastSpy).toHaveBeenCalledWith(user.id, recipeId, yeastId);
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('additives', () => {
    it('should list additives', async () => {
      const listAdditivesSpy = jest
        .spyOn(service, 'listAdditives')
        .mockResolvedValue([additiveEntity]);

      const result = await controller.listAdditives(user, recipeId);

      expect(listAdditivesSpy).toHaveBeenCalledWith(user.id, recipeId);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: additiveEntity.id,
          name: additiveEntity.name,
          type: additiveEntity.type,
          addition_step: additiveEntity.addition_step,
        }),
      );
    });

    it('should add additive', async () => {
      const dto: CreateRecipeAdditiveDto = {
        name: 'Irish Moss',
        type: RecipeAdditiveType.FINING,
        amount_g: 5,
        addition_step: RecipeStepType.BOIL,
        addition_time_min: 15,
      };

      const addAdditiveSpy = jest
        .spyOn(service, 'addAdditive')
        .mockResolvedValue(additiveEntity);

      const result = await controller.addAdditive(user, recipeId, dto);

      expect(addAdditiveSpy).toHaveBeenCalledWith(user.id, recipeId, dto);
      expect(result.id).toBe(additiveEntity.id);
    });

    it('should update additive', async () => {
      const additiveId = additiveEntity.id;
      const dto: UpdateRecipeAdditiveDto = {
        addition_time_min: 10,
      };

      const updateAdditiveSpy = jest
        .spyOn(service, 'updateAdditive')
        .mockResolvedValue({
          ...additiveEntity,
          addition_time_min: 10,
        });

      const result = await controller.updateAdditive(
        user,
        recipeId,
        additiveId,
        dto,
      );

      expect(updateAdditiveSpy).toHaveBeenCalledWith(
        user.id,
        recipeId,
        additiveId,
        dto,
      );
      expect(result.addition_time_min).toBe(10);
    });

    it('should remove additive', async () => {
      const additiveId = additiveEntity.id;
      const removeAdditiveSpy = jest
        .spyOn(service, 'removeAdditive')
        .mockResolvedValue({ deleted: true });

      const result = await controller.removeAdditive(
        user,
        recipeId,
        additiveId,
      );

      expect(removeAdditiveSpy).toHaveBeenCalledWith(
        user.id,
        recipeId,
        additiveId,
      );
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('water', () => {
    it('should get water profile', async () => {
      const getWaterSpy = jest
        .spyOn(service, 'getWater')
        .mockResolvedValue(waterEntity);

      const result = await controller.getWater(user, recipeId);

      expect(getWaterSpy).toHaveBeenCalledWith(user.id, recipeId);
      expect(result).toEqual(
        expect.objectContaining({
          recipe_id: waterEntity.recipe_id,
          mash_volume_l: waterEntity.mash_volume_l,
          sparge_volume_l: waterEntity.sparge_volume_l,
          ph_target: waterEntity.ph_target,
        }),
      );
    });

    it('should throw NotFoundException when water profile does not exist', async () => {
      const getWaterSpy = jest
        .spyOn(service, 'getWater')
        .mockResolvedValue(null);

      await expect(controller.getWater(user, recipeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(getWaterSpy).toHaveBeenCalledWith(user.id, recipeId);
    });

    it('should upsert water profile', async () => {
      const dto: UpsertRecipeWaterDto = {
        mash_volume_l: 17,
        sparge_volume_l: 12,
        mash_temperature_c: 67,
        sparge_temperature_c: 78,
        calcium_ppm: 80,
        magnesium_ppm: 10,
        sulfate_ppm: 150,
        chloride_ppm: 50,
        ph_target: 5.4,
      };

      const upsertWaterSpy = jest
        .spyOn(service, 'upsertWater')
        .mockResolvedValue(waterEntity);

      const result = await controller.upsertWater(user, recipeId, dto);

      expect(upsertWaterSpy).toHaveBeenCalledWith(user.id, recipeId, dto);
      expect(result.recipe_id).toBe(waterEntity.recipe_id);
      expect(result.mash_volume_l).toBe(waterEntity.mash_volume_l);
    });

    it('should remove water profile', async () => {
      const removeWaterSpy = jest
        .spyOn(service, 'removeWater')
        .mockResolvedValue({ deleted: true });

      const result = await controller.removeWater(user, recipeId);

      expect(removeWaterSpy).toHaveBeenCalledWith(user.id, recipeId);
      expect(result).toEqual({ deleted: true });
    });
  });
});

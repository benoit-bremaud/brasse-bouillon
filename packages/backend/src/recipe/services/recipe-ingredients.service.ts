import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { RecipeService } from './recipe.service';
import { RecipeAdditiveOrmEntity } from '../entities/recipe-additive.orm.entity';
import { RecipeFermentableOrmEntity } from '../entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeWaterOrmEntity } from '../entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from '../entities/recipe-yeast.orm.entity';
import { CreateRecipeAdditiveDto } from '../dtos/create-recipe-additive.dto';
import { CreateRecipeFermentableDto } from '../dtos/create-recipe-fermentable.dto';
import { CreateRecipeHopDto } from '../dtos/create-recipe-hop.dto';
import { CreateRecipeYeastDto } from '../dtos/create-recipe-yeast.dto';
import { UpdateRecipeAdditiveDto } from '../dtos/update-recipe-additive.dto';
import { UpdateRecipeFermentableDto } from '../dtos/update-recipe-fermentable.dto';
import { UpdateRecipeHopDto } from '../dtos/update-recipe-hop.dto';
import { UpdateRecipeYeastDto } from '../dtos/update-recipe-yeast.dto';
import { UpsertRecipeWaterDto } from '../dtos/upsert-recipe-water.dto';

/**
 * RecipeIngredientsService
 *
 * Application service for managing recipe ingredients:
 * fermentables, hops, yeasts, additives (1:N) and water profile (1:1).
 *
 * All operations enforce ownership via RecipeService.getMineById().
 */
@Injectable()
export class RecipeIngredientsService {
  constructor(
    private readonly recipeService: RecipeService,
    @InjectRepository(RecipeFermentableOrmEntity)
    private readonly fermentableRepo: Repository<RecipeFermentableOrmEntity>,
    @InjectRepository(RecipeHopOrmEntity)
    private readonly hopRepo: Repository<RecipeHopOrmEntity>,
    @InjectRepository(RecipeYeastOrmEntity)
    private readonly yeastRepo: Repository<RecipeYeastOrmEntity>,
    @InjectRepository(RecipeAdditiveOrmEntity)
    private readonly additiveRepo: Repository<RecipeAdditiveOrmEntity>,
    @InjectRepository(RecipeWaterOrmEntity)
    private readonly waterRepo: Repository<RecipeWaterOrmEntity>,
  ) {}

  // ─── Fermentables ───────────────────────────────────────────────────────────

  async listFermentables(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeFermentableOrmEntity[]> {
    await this.assertOwnership(ownerId, recipeId);
    return this.fermentableRepo.find({
      where: { recipe_id: recipeId },
      order: { created_at: 'ASC' },
    });
  }

  async addFermentable(
    ownerId: string,
    recipeId: string,
    dto: CreateRecipeFermentableDto,
  ): Promise<RecipeFermentableOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = this.fermentableRepo.create({
      id: randomUUID(),
      recipe_id: recipeId,
      name: dto.name,
      type: dto.type,
      weight_g: dto.weight_g,
      potential_gravity: dto.potential_gravity ?? null,
      color_ebc: dto.color_ebc ?? null,
    });
    return this.fermentableRepo.save(entity);
  }

  async updateFermentable(
    ownerId: string,
    recipeId: string,
    fermentableId: string,
    dto: UpdateRecipeFermentableDto,
  ): Promise<RecipeFermentableOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = await this.findFermentableOrThrow(recipeId, fermentableId);

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.weight_g !== undefined) entity.weight_g = dto.weight_g;
    if (dto.potential_gravity !== undefined)
      entity.potential_gravity = dto.potential_gravity ?? null;
    if (dto.color_ebc !== undefined) entity.color_ebc = dto.color_ebc ?? null;

    return this.fermentableRepo.save(entity);
  }

  async removeFermentable(
    ownerId: string,
    recipeId: string,
    fermentableId: string,
  ): Promise<{ deleted: true }> {
    await this.assertOwnership(ownerId, recipeId);
    const result = await this.fermentableRepo.delete({
      id: fermentableId,
      recipe_id: recipeId,
    });
    if (!result.affected) {
      throw new NotFoundException('Fermentable not found');
    }
    return { deleted: true };
  }

  // ─── Hops ───────────────────────────────────────────────────────────────────

  async listHops(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeHopOrmEntity[]> {
    await this.assertOwnership(ownerId, recipeId);
    return this.hopRepo.find({
      where: { recipe_id: recipeId },
      order: { created_at: 'ASC' },
    });
  }

  async addHop(
    ownerId: string,
    recipeId: string,
    dto: CreateRecipeHopDto,
  ): Promise<RecipeHopOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = this.hopRepo.create({
      id: randomUUID(),
      recipe_id: recipeId,
      variety: dto.variety,
      type: dto.type,
      weight_g: dto.weight_g,
      alpha_acid_percent: dto.alpha_acid_percent ?? null,
      addition_stage: dto.addition_stage,
      addition_time_min: dto.addition_time_min ?? null,
    });
    return this.hopRepo.save(entity);
  }

  async updateHop(
    ownerId: string,
    recipeId: string,
    hopId: string,
    dto: UpdateRecipeHopDto,
  ): Promise<RecipeHopOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = await this.findHopOrThrow(recipeId, hopId);

    if (dto.variety !== undefined) entity.variety = dto.variety;
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.weight_g !== undefined) entity.weight_g = dto.weight_g;
    if (dto.alpha_acid_percent !== undefined)
      entity.alpha_acid_percent = dto.alpha_acid_percent ?? null;
    if (dto.addition_stage !== undefined)
      entity.addition_stage = dto.addition_stage;
    if (dto.addition_time_min !== undefined)
      entity.addition_time_min = dto.addition_time_min ?? null;

    return this.hopRepo.save(entity);
  }

  async removeHop(
    ownerId: string,
    recipeId: string,
    hopId: string,
  ): Promise<{ deleted: true }> {
    await this.assertOwnership(ownerId, recipeId);
    const result = await this.hopRepo.delete({
      id: hopId,
      recipe_id: recipeId,
    });
    if (!result.affected) {
      throw new NotFoundException('Hop not found');
    }
    return { deleted: true };
  }

  // ─── Yeasts ─────────────────────────────────────────────────────────────────

  async listYeasts(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeYeastOrmEntity[]> {
    await this.assertOwnership(ownerId, recipeId);
    return this.yeastRepo.find({
      where: { recipe_id: recipeId },
      order: { created_at: 'ASC' },
    });
  }

  async addYeast(
    ownerId: string,
    recipeId: string,
    dto: CreateRecipeYeastDto,
  ): Promise<RecipeYeastOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = this.yeastRepo.create({
      id: randomUUID(),
      recipe_id: recipeId,
      name: dto.name,
      type: dto.type,
      amount_g: dto.amount_g,
      attenuation_percent: dto.attenuation_percent ?? null,
      temperature_min_c: dto.temperature_min_c ?? null,
      temperature_max_c: dto.temperature_max_c ?? null,
    });
    return this.yeastRepo.save(entity);
  }

  async updateYeast(
    ownerId: string,
    recipeId: string,
    yeastId: string,
    dto: UpdateRecipeYeastDto,
  ): Promise<RecipeYeastOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = await this.findYeastOrThrow(recipeId, yeastId);

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.amount_g !== undefined) entity.amount_g = dto.amount_g;
    if (dto.attenuation_percent !== undefined)
      entity.attenuation_percent = dto.attenuation_percent ?? null;
    if (dto.temperature_min_c !== undefined)
      entity.temperature_min_c = dto.temperature_min_c ?? null;
    if (dto.temperature_max_c !== undefined)
      entity.temperature_max_c = dto.temperature_max_c ?? null;

    return this.yeastRepo.save(entity);
  }

  async removeYeast(
    ownerId: string,
    recipeId: string,
    yeastId: string,
  ): Promise<{ deleted: true }> {
    await this.assertOwnership(ownerId, recipeId);
    const result = await this.yeastRepo.delete({
      id: yeastId,
      recipe_id: recipeId,
    });
    if (!result.affected) {
      throw new NotFoundException('Yeast not found');
    }
    return { deleted: true };
  }

  // ─── Additives ──────────────────────────────────────────────────────────────

  async listAdditives(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeAdditiveOrmEntity[]> {
    await this.assertOwnership(ownerId, recipeId);
    return this.additiveRepo.find({
      where: { recipe_id: recipeId },
      order: { created_at: 'ASC' },
    });
  }

  async addAdditive(
    ownerId: string,
    recipeId: string,
    dto: CreateRecipeAdditiveDto,
  ): Promise<RecipeAdditiveOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = this.additiveRepo.create({
      id: randomUUID(),
      recipe_id: recipeId,
      name: dto.name,
      type: dto.type,
      amount_g: dto.amount_g,
      addition_step: dto.addition_step,
      addition_time_min: dto.addition_time_min ?? null,
    });
    return this.additiveRepo.save(entity);
  }

  async updateAdditive(
    ownerId: string,
    recipeId: string,
    additiveId: string,
    dto: UpdateRecipeAdditiveDto,
  ): Promise<RecipeAdditiveOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);
    const entity = await this.findAdditiveOrThrow(recipeId, additiveId);

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.amount_g !== undefined) entity.amount_g = dto.amount_g;
    if (dto.addition_step !== undefined)
      entity.addition_step = dto.addition_step;
    if (dto.addition_time_min !== undefined)
      entity.addition_time_min = dto.addition_time_min ?? null;

    return this.additiveRepo.save(entity);
  }

  async removeAdditive(
    ownerId: string,
    recipeId: string,
    additiveId: string,
  ): Promise<{ deleted: true }> {
    await this.assertOwnership(ownerId, recipeId);
    const result = await this.additiveRepo.delete({
      id: additiveId,
      recipe_id: recipeId,
    });
    if (!result.affected) {
      throw new NotFoundException('Additive not found');
    }
    return { deleted: true };
  }

  // ─── Water Profile (1:1) ────────────────────────────────────────────────────

  async getWater(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeWaterOrmEntity | null> {
    await this.assertOwnership(ownerId, recipeId);
    return this.waterRepo.findOne({ where: { recipe_id: recipeId } });
  }

  async upsertWater(
    ownerId: string,
    recipeId: string,
    dto: UpsertRecipeWaterDto,
  ): Promise<RecipeWaterOrmEntity> {
    await this.assertOwnership(ownerId, recipeId);

    const existing = await this.waterRepo.findOne({
      where: { recipe_id: recipeId },
    });

    if (existing) {
      existing.mash_volume_l = dto.mash_volume_l;
      existing.sparge_volume_l = dto.sparge_volume_l;
      existing.mash_temperature_c = dto.mash_temperature_c ?? null;
      existing.sparge_temperature_c = dto.sparge_temperature_c ?? null;
      existing.calcium_ppm = dto.calcium_ppm ?? null;
      existing.magnesium_ppm = dto.magnesium_ppm ?? null;
      existing.sulfate_ppm = dto.sulfate_ppm ?? null;
      existing.chloride_ppm = dto.chloride_ppm ?? null;
      existing.ph_target = dto.ph_target ?? null;
      return this.waterRepo.save(existing);
    }

    const entity = this.waterRepo.create({
      recipe_id: recipeId,
      mash_volume_l: dto.mash_volume_l,
      sparge_volume_l: dto.sparge_volume_l,
      mash_temperature_c: dto.mash_temperature_c ?? null,
      sparge_temperature_c: dto.sparge_temperature_c ?? null,
      calcium_ppm: dto.calcium_ppm ?? null,
      magnesium_ppm: dto.magnesium_ppm ?? null,
      sulfate_ppm: dto.sulfate_ppm ?? null,
      chloride_ppm: dto.chloride_ppm ?? null,
      ph_target: dto.ph_target ?? null,
    });
    return this.waterRepo.save(entity);
  }

  async removeWater(
    ownerId: string,
    recipeId: string,
  ): Promise<{ deleted: true }> {
    await this.assertOwnership(ownerId, recipeId);
    const result = await this.waterRepo.delete({ recipe_id: recipeId });
    if (!result.affected) {
      throw new NotFoundException('Water profile not found');
    }
    return { deleted: true };
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Asserts that the recipe exists and is owned by ownerId.
   * Throws NotFoundException if not found or unauthorized.
   */
  private async assertOwnership(
    ownerId: string,
    recipeId: string,
  ): Promise<void> {
    await this.recipeService.getMineById(ownerId, recipeId);
  }

  private async findFermentableOrThrow(
    recipeId: string,
    fermentableId: string,
  ): Promise<RecipeFermentableOrmEntity> {
    const entity = await this.fermentableRepo.findOne({
      where: { id: fermentableId, recipe_id: recipeId },
    });
    if (!entity) throw new NotFoundException('Fermentable not found');
    return entity;
  }

  private async findHopOrThrow(
    recipeId: string,
    hopId: string,
  ): Promise<RecipeHopOrmEntity> {
    const entity = await this.hopRepo.findOne({
      where: { id: hopId, recipe_id: recipeId },
    });
    if (!entity) throw new NotFoundException('Hop not found');
    return entity;
  }

  private async findYeastOrThrow(
    recipeId: string,
    yeastId: string,
  ): Promise<RecipeYeastOrmEntity> {
    const entity = await this.yeastRepo.findOne({
      where: { id: yeastId, recipe_id: recipeId },
    });
    if (!entity) throw new NotFoundException('Yeast not found');
    return entity;
  }

  private async findAdditiveOrThrow(
    recipeId: string,
    additiveId: string,
  ): Promise<RecipeAdditiveOrmEntity> {
    const entity = await this.additiveRepo.findOne({
      where: { id: additiveId, recipe_id: recipeId },
    });
    if (!entity) throw new NotFoundException('Additive not found');
    return entity;
  }
}

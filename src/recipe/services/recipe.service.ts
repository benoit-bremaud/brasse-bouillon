import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, QueryFailedError, Repository } from 'typeorm';

import { RecipeDomainService } from '../domain/services/recipe-domain.service';
import { RecipeIbuTinsethDomainService } from '../domain/services/recipe-ibu-tinseth.domain.service';
import { RecipeWorkflowService } from '../domain/services/recipe-workflow.service';
import { RecipeHopOrmEntity } from '../entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from '../entities/recipe-step.orm.entity';
import { RecipeIbuEstimateDto } from '../dtos/recipe-ibu-estimate.dto';
import { CreateRecipeDto } from '../dtos/create-recipe.dto';
import { UpdateRecipeDto } from '../dtos/update-recipe.dto';
import { UpdateRecipeStepDto } from '../dtos/update-recipe-step.dto';

@Injectable()
export class RecipeService {
  private readonly domain = new RecipeDomainService();
  private readonly workflow = new RecipeWorkflowService();
  private readonly ibuCalculator = new RecipeIbuTinsethDomainService();

  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly repo: Repository<RecipeOrmEntity>,
    @InjectRepository(RecipeStepOrmEntity)
    private readonly stepRepo: Repository<RecipeStepOrmEntity>,
    @InjectRepository(RecipeHopOrmEntity)
    private readonly hopRepo: Repository<RecipeHopOrmEntity>,
  ) {}

  async create(
    ownerId: string,
    dto: CreateRecipeDto,
  ): Promise<RecipeOrmEntity> {
    return this.repo.manager.transaction(async (manager) => {
      const recipeRepo = manager.getRepository(RecipeOrmEntity);

      const id = randomUUID();

      const recipe = this.domain.createRecipe({
        id,
        ownerId,
        name: dto.name,
        description: dto.description ?? undefined,
        visibility: dto.visibility,
      });

      const entity = recipeRepo.create({
        id: recipe.id,
        owner_id: recipe.ownerId,
        name: recipe.name,
        description: recipe.description ?? null,
        visibility: recipe.visibility,
        version: recipe.version,
        root_recipe_id: recipe.rootRecipeId,
        parent_recipe_id: recipe.parentRecipeId ?? null,
        batch_size_l: dto.batch_size_l ?? null,
        boil_time_min: dto.boil_time_min ?? null,
        og_target: dto.og_target ?? null,
        fg_target: dto.fg_target ?? null,
        abv_estimated: dto.abv_estimated ?? null,
        ibu_target: dto.ibu_target ?? null,
        ebc_target: dto.ebc_target ?? null,
        efficiency_target: dto.efficiency_target ?? null,
      });

      const saved = await recipeRepo.save(entity);
      await this.ensureDefaultSteps(saved.id, manager);
      return saved;
    });
  }

  async listMine(ownerId: string): Promise<RecipeOrmEntity[]> {
    return this.repo.find({
      where: { owner_id: ownerId },
      order: { updated_at: 'DESC' },
    });
  }

  async getMineById(ownerId: string, id: string): Promise<RecipeOrmEntity> {
    const entity = await this.repo.findOne({
      where: { id, owner_id: ownerId },
    });
    if (!entity) {
      throw new NotFoundException('Recipe not found');
    }
    return entity;
  }

  async updateMine(
    ownerId: string,
    id: string,
    dto: UpdateRecipeDto,
  ): Promise<RecipeOrmEntity> {
    const entity = await this.getMineById(ownerId, id);

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.visibility !== undefined) entity.visibility = dto.visibility;

    // Update brewing metrics
    if (dto.batch_size_l !== undefined) entity.batch_size_l = dto.batch_size_l;
    if (dto.boil_time_min !== undefined)
      entity.boil_time_min = dto.boil_time_min;
    if (dto.og_target !== undefined) entity.og_target = dto.og_target;
    if (dto.fg_target !== undefined) entity.fg_target = dto.fg_target;
    if (dto.abv_estimated !== undefined)
      entity.abv_estimated = dto.abv_estimated;
    if (dto.ibu_target !== undefined) entity.ibu_target = dto.ibu_target;
    if (dto.ebc_target !== undefined) entity.ebc_target = dto.ebc_target;
    if (dto.efficiency_target !== undefined)
      entity.efficiency_target = dto.efficiency_target;

    return this.repo.save(entity);
  }

  async deleteMine(ownerId: string, id: string): Promise<{ deleted: true }> {
    return this.repo.manager.transaction(async (manager) => {
      const recipeRepo = manager.getRepository(RecipeOrmEntity);
      const stepsRepo = manager.getRepository(RecipeStepOrmEntity);

      const recipe = await recipeRepo.findOne({
        where: { id, owner_id: ownerId },
      });
      if (!recipe) {
        throw new NotFoundException('Recipe not found');
      }

      await stepsRepo.delete({ recipe_id: id });
      try {
        await recipeRepo.delete({ id, owner_id: ownerId });
      } catch (error) {
        if (
          error instanceof QueryFailedError &&
          this.isForeignKeyViolation(error)
        ) {
          throw new BadRequestException(
            'Recipe cannot be deleted because it is referenced by at least one batch',
          );
        }
        throw error;
      }

      return { deleted: true };
    });
  }

  async listMineSteps(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeStepOrmEntity[]> {
    await this.getMineById(ownerId, recipeId);
    return this.stepRepo.manager.transaction((manager) =>
      this.ensureDefaultSteps(recipeId, manager),
    );
  }

  async updateMineStep(
    ownerId: string,
    recipeId: string,
    order: number,
    dto: UpdateRecipeStepDto,
  ): Promise<RecipeStepOrmEntity> {
    if (!Number.isInteger(order) || order < 0) {
      throw new BadRequestException('Invalid step order');
    }

    await this.getMineById(ownerId, recipeId);

    return this.stepRepo.manager.transaction(async (manager) => {
      const stepsRepo = manager.getRepository(RecipeStepOrmEntity);

      await this.ensureDefaultSteps(recipeId, manager);

      const entity = await stepsRepo.findOne({
        where: { recipe_id: recipeId, step_order: order },
      });
      if (!entity) {
        throw new NotFoundException('Recipe step not found');
      }

      if (dto.label !== undefined) entity.label = dto.label;
      if (dto.description !== undefined) entity.description = dto.description;

      return stepsRepo.save(entity);
    });
  }

  async estimateMineIbu(
    ownerId: string,
    recipeId: string,
  ): Promise<RecipeIbuEstimateDto> {
    const recipe = await this.getMineById(ownerId, recipeId);
    const hops = await this.hopRepo.find({
      where: { recipe_id: recipeId },
      order: { created_at: 'ASC' },
    });

    if (hops.length === 0) {
      return RecipeIbuEstimateDto.fromUnestimated(recipeId, []);
    }

    if (!recipe.batch_size_l || !recipe.og_target) {
      return RecipeIbuEstimateDto.fromUnestimated(recipeId, hops);
    }

    const result = this.ibuCalculator.calculate({
      batchSizeL: recipe.batch_size_l,
      og: recipe.og_target,
      boilTimeMin: recipe.boil_time_min ?? null,
      hops: hops.map((hop) => ({
        hopId: hop.id,
        variety: hop.variety,
        type: hop.type,
        additionStage: hop.addition_stage,
        additionTimeMin: hop.addition_time_min ?? null,
        weightG: hop.weight_g,
        alphaAcidPercent: hop.alpha_acid_percent ?? null,
      })),
    });

    return RecipeIbuEstimateDto.fromTinseth(recipeId, result);
  }

  private async ensureDefaultSteps(
    recipeId: string,
    manager?: EntityManager,
  ): Promise<RecipeStepOrmEntity[]> {
    const stepsRepo = manager
      ? manager.getRepository(RecipeStepOrmEntity)
      : this.stepRepo;

    const existing = await stepsRepo.find({
      where: { recipe_id: recipeId },
      order: { step_order: 'ASC' },
    });

    if (existing.length > 0) {
      return existing;
    }

    const defaults = this.workflow.getDefaultWorkflow().map((step) =>
      stepsRepo.create({
        recipe_id: recipeId,
        step_order: step.order,
        type: step.type,
        label: step.label,
        description: step.description ?? null,
      }),
    );

    try {
      await stepsRepo.save(defaults);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // If concurrent calls created steps at the same time, simply re-fetch.
        if (!this.isUniqueConstraintViolation(error)) {
          throw error;
        }
      } else {
        throw error;
      }
    }

    return stepsRepo.find({
      where: { recipe_id: recipeId },
      order: { step_order: 'ASC' },
    });
  }

  private getDriverErrorMetadata(error: QueryFailedError<any>): {
    code: string;
    message: string;
  } {
    const driverError = error.driverError as {
      code?: string | number;
      message?: string;
    };

    const code =
      typeof driverError.code === 'string'
        ? driverError.code
        : typeof driverError.code === 'number'
          ? String(driverError.code)
          : '';

    const message = (driverError.message ?? error.message).toLowerCase();

    return { code, message };
  }

  private isForeignKeyViolation(error: QueryFailedError<any>): boolean {
    const { code, message } = this.getDriverErrorMetadata(error);

    return (
      code === '23503' ||
      code === 'ER_ROW_IS_REFERENCED_2' ||
      code === 'SQLITE_CONSTRAINT_FOREIGNKEY' ||
      message.includes('foreign key constraint failed')
    );
  }

  private isUniqueConstraintViolation(error: QueryFailedError<any>): boolean {
    const { code, message } = this.getDriverErrorMetadata(error);

    return (
      code === '23505' ||
      code === 'ER_DUP_ENTRY' ||
      code === 'SQLITE_CONSTRAINT_PRIMARYKEY' ||
      code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      message.includes('unique constraint failed')
    );
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';

import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { CreateRecipeDto } from '../dtos/create-recipe.dto';
import { UpdateRecipeDto } from '../dtos/update-recipe.dto';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly repo: Repository<RecipeOrmEntity>,
  ) {}

  async create(
    ownerId: string,
    dto: CreateRecipeDto,
  ): Promise<RecipeOrmEntity> {
    const id = randomUUID();

    const entity = this.repo.create({
      id,
      owner_id: ownerId,
      name: dto.name,
      description: dto.description ?? null,
      visibility: dto.visibility ?? RecipeVisibility.PRIVATE,
      version: 1,
      root_recipe_id: id,
      parent_recipe_id: null,
    });

    return this.repo.save(entity);
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

    return this.repo.save(entity);
  }

  async deleteMine(ownerId: string, id: string): Promise<{ deleted: true }> {
    const result = await this.repo.delete({ id, owner_id: ownerId });
    if (!result.affected) {
      throw new NotFoundException('Recipe not found');
    }
    return { deleted: true };
  }
}

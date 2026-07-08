import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EquipmentProfileService } from '../../equipment/services/equipment-profile.service';
import { RecipeWaterOrmEntity } from '../../recipe/entities/recipe-water.orm.entity';
import { RecipeService } from '../../recipe/services/recipe.service';
import { CapacityFit, computeCapacityFit } from '../domain/capacity-fit';
import { HEADSPACE_RATIO } from '../equipment-fit.constants';

/**
 * Orchestrates the advisory equipment capacity fit-check (ADR-0026): resolves
 * the caller's equipment profile, reads the (access-checked) recipe + its
 * optional water row, and delegates the verdict to the pure domain function.
 */
@Injectable()
export class EquipmentFitService {
  constructor(
    private readonly recipeService: RecipeService,
    private readonly equipmentProfileService: EquipmentProfileService,
    @InjectRepository(RecipeWaterOrmEntity)
    private readonly waterRepo: Repository<RecipeWaterOrmEntity>,
  ) {}

  /**
   * @param userId  authenticated caller
   * @param recipeId  recipe to fit (must be readable by the caller — owner or public)
   * @param profileId  optional explicit equipment profile; defaults to the
   *                   caller's most-recently-created one (no persisted default
   *                   marker yet, ADR-0026)
   */
  async getFit(
    userId: string,
    recipeId: string,
    profileId?: string,
  ): Promise<CapacityFit> {
    // Access control + existence: throws NotFound if the recipe is not readable.
    const recipe = await this.recipeService.getReadableById(userId, recipeId);

    const profile = await this.resolveProfile(userId, profileId);
    const water = await this.waterRepo.findOne({
      where: { recipe_id: recipeId },
    });

    return computeCapacityFit({
      batchSizeL: recipe.batch_size_l ?? null,
      recipeWater: water
        ? {
            mashVolumeL: water.mash_volume_l,
            spargeVolumeL: water.sparge_volume_l,
          }
        : null,
      profile: profile
        ? {
            fermenterVolumeL: profile.fermenter_volume_l,
            boilKettleVolumeL: profile.boil_kettle_volume_l,
          }
        : null,
      headspaceRatio: HEADSPACE_RATIO,
    });
  }

  /**
   * Explicit `profileId` → that profile (404 if it is not the caller's).
   * Otherwise the most-recently-created profile, or `null` when the caller has
   * declared none (→ a non-blocking NO_PROFILE advisory).
   */
  private async resolveProfile(
    userId: string,
    profileId?: string,
  ): Promise<{
    fermenter_volume_l: number;
    boil_kettle_volume_l: number;
  } | null> {
    if (profileId) {
      return this.equipmentProfileService.getMineById(userId, profileId);
    }
    const profiles = await this.equipmentProfileService.listMine(userId);
    return profiles[0] ?? null;
  }
}

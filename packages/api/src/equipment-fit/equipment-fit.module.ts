import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipmentModule } from '../equipment/equipment.module';
import { RecipeWaterOrmEntity } from '../recipe/entities/recipe-water.orm.entity';
import { RecipeModule } from '../recipe/recipe.module';
import { EquipmentFitController } from './controllers/equipment-fit.controller';
import { EquipmentFitService } from './services/equipment-fit.service';

/**
 * Advisory equipment capacity fit-check (ADR-0026). Reuses `RecipeService`
 * (readable-recipe access) and `EquipmentProfileService` (profile resolution),
 * and reads the optional `recipe_water` row directly.
 */
@Module({
  imports: [
    EquipmentModule,
    RecipeModule,
    // Deliberate: the fit-check reads the optional recipe_water row directly
    // (ADR-0026 / brew-prep 03-component — no WaterService in the picture), so we
    // register the repository here rather than route through RecipeModule.
    TypeOrmModule.forFeature([RecipeWaterOrmEntity]),
  ],
  controllers: [EquipmentFitController],
  providers: [EquipmentFitService],
})
export class EquipmentFitModule {}

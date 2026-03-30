import { Module } from '@nestjs/common';
import { RecipeAdditiveOrmEntity } from './entities/recipe-additive.orm.entity';
import { RecipeController } from './controllers/recipe.controller';
import { RecipeFermentableOrmEntity } from './entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from './entities/recipe-hop.orm.entity';
import { RecipeIngredientsController } from './controllers/recipe-ingredients.controller';
import { RecipeIngredientsService } from './services/recipe-ingredients.service';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeStepOrmEntity } from './entities/recipe-step.orm.entity';
import { RecipeWaterOrmEntity } from './entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from './entities/recipe-yeast.orm.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecipeOrmEntity,
      RecipeStepOrmEntity,
      RecipeFermentableOrmEntity,
      RecipeHopOrmEntity,
      RecipeYeastOrmEntity,
      RecipeAdditiveOrmEntity,
      RecipeWaterOrmEntity,
    ]),
  ],
  controllers: [RecipeController, RecipeIngredientsController],
  providers: [RecipeService, RecipeIngredientsService],
  exports: [RecipeService],
})
export class RecipeModule {}

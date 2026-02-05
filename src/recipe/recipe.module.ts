import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeController } from './controllers/recipe.controller';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from './entities/recipe-step.orm.entity';
import { RecipeService } from './services/recipe.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeOrmEntity, RecipeStepOrmEntity])],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}

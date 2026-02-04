import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeController } from './controllers/recipe.controller';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeOrmEntity])],
  controllers: [RecipeController],
  providers: [RecipeService],
  exports: [RecipeService],
})
export class RecipeModule {}

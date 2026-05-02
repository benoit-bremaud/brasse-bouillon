import { TypeOrmModule } from '@nestjs/typeorm';

import { RecipeAdditiveOrmEntity } from './entities/recipe-additive.orm.entity';
import { RecipeFermentableOrmEntity } from './entities/recipe-fermentable.orm.entity';
import { RecipeHopOrmEntity } from './entities/recipe-hop.orm.entity';
import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeStepOrmEntity } from './entities/recipe-step.orm.entity';
import { RecipeWaterOrmEntity } from './entities/recipe-water.orm.entity';
import { RecipeYeastOrmEntity } from './entities/recipe-yeast.orm.entity';

/**
 * Single source of truth for the Recipe entity set so each
 * RecipeService spec can register the in-memory SQLite + TypeORM
 * module without copy-pasting the entity list. Pulled out to clear
 * the SonarCloud duplication QG on PR #845.
 */
export const RECIPE_ORM_ENTITIES = [
  RecipeOrmEntity,
  RecipeStepOrmEntity,
  RecipeFermentableOrmEntity,
  RecipeHopOrmEntity,
  RecipeYeastOrmEntity,
  RecipeAdditiveOrmEntity,
  RecipeWaterOrmEntity,
] as const;

/**
 * Returns the two TypeOrmModule registrations every RecipeService
 * spec file needs. Use as `imports: [...buildRecipeTestingTypeOrm()]`
 * so the spec file stays free of repository-list boilerplate.
 */
export function buildRecipeTestingTypeOrm() {
  return [
    TypeOrmModule.forRoot({
      type: 'sqlite' as const,
      database: ':memory:',
      entities: [...RECIPE_ORM_ENTITIES],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([...RECIPE_ORM_ENTITIES]),
  ];
}

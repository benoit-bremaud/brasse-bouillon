import { RecipeDomainService } from './services/recipe-domain.service';
import { RecipeVisibility } from './enums/recipe-visibility.enum';
import { Recipe } from './entities/recipe.entity';

describe('RecipeDomainService', () => {
  const fixedDate = new Date('2026-01-30T12:00:00.000Z');
  const now = () => fixedDate;

  let service: RecipeDomainService;

  beforeEach(() => {
    service = new RecipeDomainService(now);
  });

  it('should create a new private recipe by default', () => {
    const recipe = service.createRecipe({
      id: 'recipe-1',
      ownerId: 'user-1',
      name: 'My First IPA',
      description: 'Citrusy and hoppy IPA',
    });

    expect(recipe).toEqual<Recipe>({
      id: 'recipe-1',
      ownerId: 'user-1',
      name: 'My First IPA',
      description: 'Citrusy and hoppy IPA',
      visibility: RecipeVisibility.PRIVATE,
      version: 1,
      rootRecipeId: 'recipe-1',
      parentRecipeId: undefined,
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });
  });

  it('should create a forked recipe with incremented version and lineage links', () => {
    const original = service.createRecipe({
      id: 'recipe-1',
      ownerId: 'user-1',
      name: 'Base Stout',
    });

    const fork = service.forkRecipe(original, {
      id: 'recipe-2',
      ownerId: 'user-2',
      name: 'Coffee Stout',
      visibility: RecipeVisibility.PUBLIC,
    });

    expect(fork).toEqual<Recipe>({
      id: 'recipe-2',
      ownerId: 'user-2',
      name: 'Coffee Stout',
      description: undefined,
      visibility: RecipeVisibility.PUBLIC,
      version: 2,
      rootRecipeId: original.rootRecipeId,
      parentRecipeId: original.id,
      createdAt: fixedDate,
      updatedAt: fixedDate,
    });
  });
});

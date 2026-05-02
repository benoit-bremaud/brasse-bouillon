jest.setTimeout(20000);

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RecipeOrmEntity } from './entities/recipe.orm.entity';
import { RecipeService } from './services/recipe.service';
import { RecipeVisibility } from './domain/enums/recipe-visibility.enum';
import { buildRecipeTestingTypeOrm } from './recipe-testing.module';

/**
 * Issue #779 — coverage guard on the catalog discovery surface.
 *
 * Pins the two service methods added by the catalog mini PR
 * (`listPublic` + `getReadableById`) against an in-memory SQLite
 * so every visibility branch is exercised end-to-end without
 * mocking the repository.
 */
describe('RecipeService catalog read paths (Issue #779)', () => {
  let module: TestingModule;
  let service: RecipeService;
  let recipeRepo: Repository<RecipeOrmEntity>;

  const OWNER = 'owner-uuid-aaa';
  const VIEWER = 'viewer-uuid-bbb';

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [...buildRecipeTestingTypeOrm()],
      providers: [RecipeService],
    }).compile();

    service = module.get(RecipeService);
    recipeRepo = module.get(getRepositoryToken(RecipeOrmEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await recipeRepo.clear();
  });

  async function seedRecipe(
    id: string,
    visibility: RecipeVisibility,
    ownerId: string = OWNER,
  ): Promise<RecipeOrmEntity> {
    const r = recipeRepo.create({
      id,
      owner_id: ownerId,
      name: `Test ${id}`,
      visibility,
      version: 1,
      root_recipe_id: id,
      brew_count: 0,
      is_official: false,
    });
    return recipeRepo.save(r);
  }

  describe('listPublic()', () => {
    it('happy: returns every PUBLIC recipe regardless of owner', async () => {
      await seedRecipe('rec-pub-1', RecipeVisibility.PUBLIC, OWNER);
      await seedRecipe('rec-pub-2', RecipeVisibility.PUBLIC, VIEWER);

      const rows = await service.listPublic();
      const ids = rows.map((r) => r.id).sort();
      expect(ids).toEqual(['rec-pub-1', 'rec-pub-2']);
    });

    it('edge: excludes PRIVATE and UNLISTED recipes from the catalog', async () => {
      await seedRecipe('rec-pub', RecipeVisibility.PUBLIC, OWNER);
      await seedRecipe('rec-priv', RecipeVisibility.PRIVATE, OWNER);
      await seedRecipe('rec-unl', RecipeVisibility.UNLISTED, OWNER);

      const rows = await service.listPublic();
      const ids = rows.map((r) => r.id).sort();
      expect(ids).toEqual(['rec-pub']);
    });

    it('sad: returns [] when no PUBLIC recipe exists', async () => {
      await seedRecipe('rec-priv', RecipeVisibility.PRIVATE, OWNER);

      const rows = await service.listPublic();
      expect(rows).toEqual([]);
    });
  });

  describe('getReadableById()', () => {
    it('happy: returns the recipe when the viewer is the owner (any visibility)', async () => {
      await seedRecipe('rec-priv', RecipeVisibility.PRIVATE, OWNER);

      const result = await service.getReadableById(OWNER, 'rec-priv');
      expect(result.id).toBe('rec-priv');
    });

    it('happy: returns a PUBLIC recipe when the viewer is NOT the owner', async () => {
      await seedRecipe('rec-pub', RecipeVisibility.PUBLIC, OWNER);

      const result = await service.getReadableById(VIEWER, 'rec-pub');
      expect(result.id).toBe('rec-pub');
    });

    it('sad: throws NotFound when the id does not exist', async () => {
      await expect(
        service.getReadableById(VIEWER, 'no-such-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('edge: throws NotFound when a non-owner reads a PRIVATE recipe (no leak)', async () => {
      await seedRecipe('rec-priv', RecipeVisibility.PRIVATE, OWNER);

      await expect(service.getReadableById(VIEWER, 'rec-priv')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('edge: throws NotFound when a non-owner reads an UNLISTED recipe (no leak)', async () => {
      await seedRecipe('rec-unl', RecipeVisibility.UNLISTED, OWNER);

      await expect(service.getReadableById(VIEWER, 'rec-unl')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

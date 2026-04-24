import { RecipeOrmEntity } from '../entities/recipe.orm.entity';
import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import { RecipeDto } from './recipe.dto';

function buildEntity(overrides: Partial<RecipeOrmEntity> = {}): RecipeOrmEntity {
  const base: RecipeOrmEntity = {
    id: 'recipe-1',
    owner_id: 'owner-1',
    name: 'Punk IPA clone',
    description: null,
    visibility: RecipeVisibility.PRIVATE,
    version: 1,
    root_recipe_id: 'recipe-1',
    parent_recipe_id: null,
    batch_size_l: 20,
    boil_time_min: 60,
    og_target: 1.056,
    fg_target: 1.012,
    abv_estimated: 5.6,
    ibu_target: 40,
    ebc_target: 15,
    efficiency_target: 72,
    avg_rating: null,
    brew_count: 0,
    last_brewed_at: null,
    is_official: false,
    created_at: new Date('2026-04-24T00:00:00.000Z'),
    updated_at: new Date('2026-04-24T00:00:00.000Z'),
  };
  return { ...base, ...overrides };
}

describe('RecipeDto.fromEntity — quality fields (Epic #693 part 2)', () => {
  describe('happy path', () => {
    it('maps all 4 quality fields with realistic values', () => {
      const entity = buildEntity({
        avg_rating: 4.7,
        brew_count: 23,
        last_brewed_at: new Date('2026-04-23T18:30:00.000Z'),
        is_official: true,
      });

      const dto = RecipeDto.fromEntity(entity);

      expect(dto.avg_rating).toBe(4.7);
      expect(dto.brew_count).toBe(23);
      expect(dto.last_brewed_at).toEqual(new Date('2026-04-23T18:30:00.000Z'));
      expect(dto.is_official).toBe(true);
    });
  });

  describe('sad path — null / default values', () => {
    it('propagates null avg_rating when the recipe was never rated', () => {
      const entity = buildEntity({ avg_rating: null });

      const dto = RecipeDto.fromEntity(entity);

      expect(dto.avg_rating).toBeNull();
    });

    it('propagates null last_brewed_at when the recipe was never brewed', () => {
      const entity = buildEntity({ last_brewed_at: null });

      const dto = RecipeDto.fromEntity(entity);

      expect(dto.last_brewed_at).toBeNull();
    });

    it('defaults brew_count to 0 and is_official to false for a fresh recipe', () => {
      const entity = buildEntity({ brew_count: 0, is_official: false });

      const dto = RecipeDto.fromEntity(entity);

      expect(dto.brew_count).toBe(0);
      expect(dto.is_official).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('preserves rating boundary values (1.00 and 5.00)', () => {
      expect(RecipeDto.fromEntity(buildEntity({ avg_rating: 1.0 })).avg_rating).toBe(1.0);
      expect(RecipeDto.fromEntity(buildEntity({ avg_rating: 5.0 })).avg_rating).toBe(5.0);
    });

    it('preserves very large brew_count values (community popular recipe)', () => {
      const entity = buildEntity({ brew_count: 999_999 });

      const dto = RecipeDto.fromEntity(entity);

      expect(dto.brew_count).toBe(999_999);
    });

    it('handles an official recipe with 0 brews and no rating yet (fresh import from DIY Dog)', () => {
      const entity = buildEntity({
        is_official: true,
        brew_count: 0,
        avg_rating: null,
        last_brewed_at: null,
      });

      const dto = RecipeDto.fromEntity(entity);

      expect(dto.is_official).toBe(true);
      expect(dto.brew_count).toBe(0);
      expect(dto.avg_rating).toBeNull();
      expect(dto.last_brewed_at).toBeNull();
    });
  });
});

import { DataSource } from 'typeorm';

import { RecipeDifficultyService } from '../recipe/services/recipe-difficulty.service';
import { backfillRecipeDifficulty } from './recompute-difficulty-cli';

jest.mock('../recipe/services/recipe-difficulty.service');

const MockedService = jest.mocked(RecipeDifficultyService);

function buildDataSource(
  isInitialized: boolean,
  recipes: { id: string }[],
): { dataSource: DataSource; initialize: jest.Mock } {
  const initialize = jest.fn().mockResolvedValue(undefined);
  const recipeRepo = { find: jest.fn().mockResolvedValue(recipes) };
  const dataSource = {
    isInitialized,
    initialize,
    getRepository: jest.fn(() => recipeRepo),
  } as unknown as DataSource;
  return { dataSource, initialize };
}

describe('backfillRecipeDifficulty', () => {
  let recompute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    recompute = jest
      .fn()
      .mockResolvedValue({ computed: 'facile', reasons: [] });
    MockedService.mockImplementation(
      () =>
        ({
          recomputeForRecipe: recompute,
        }) as unknown as RecipeDifficultyService,
    );
  });

  it('happy: recomputes every recipe and returns the summary', async () => {
    const { dataSource } = buildDataSource(true, [
      { id: 'r1' },
      { id: 'r2' },
      { id: 'r3' },
    ]);

    const result = await backfillRecipeDifficulty(dataSource);

    expect(recompute).toHaveBeenCalledTimes(3);
    expect(recompute).toHaveBeenCalledWith('r1');
    expect(recompute).toHaveBeenCalledWith('r2');
    expect(recompute).toHaveBeenCalledWith('r3');
    expect(result).toEqual({ total: 3, recomputed: 3 });
  });

  it('edge: initialises the DataSource when it is not yet connected', async () => {
    const { dataSource, initialize } = buildDataSource(false, [{ id: 'r1' }]);

    await backfillRecipeDifficulty(dataSource);

    expect(initialize).toHaveBeenCalledTimes(1);
  });

  it('edge: does not re-initialise an already-connected DataSource (and no-ops on an empty catalogue)', async () => {
    const { dataSource, initialize } = buildDataSource(true, []);

    const result = await backfillRecipeDifficulty(dataSource);

    expect(initialize).not.toHaveBeenCalled();
    expect(recompute).not.toHaveBeenCalled();
    expect(result).toEqual({ total: 0, recomputed: 0 });
  });

  it('sad: counts only recipes still present (a recompute returning null is skipped)', async () => {
    recompute
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ computed: 'facile', reasons: [] });
    const { dataSource } = buildDataSource(true, [
      { id: 'gone' },
      { id: 'r2' },
    ]);

    const result = await backfillRecipeDifficulty(dataSource);

    expect(result).toEqual({ total: 2, recomputed: 1 });
  });

  it('sad: propagates a recompute failure so the operator gets a non-zero exit', async () => {
    recompute.mockRejectedValueOnce(new Error('db boom'));
    const { dataSource } = buildDataSource(true, [{ id: 'r1' }, { id: 'r2' }]);

    await expect(backfillRecipeDifficulty(dataSource)).rejects.toThrow(
      'db boom',
    );
  });
});

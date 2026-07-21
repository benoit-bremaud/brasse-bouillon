import { DataSource } from 'typeorm';

import { User } from '../user/entities/user.entity';
import {
  buildPublicRecipeSubResourceRepos,
  seedPublicRecipes,
} from './seeds/public-recipes.seed';
import { seedSystemUser } from './seeds/system-user.seed';
import { seedDeletedAuthor } from './seeds/deleted-author.seed';
import { runProductionSeed } from './seed-cli';

jest.mock('./seeds/system-user.seed', () => ({
  seedSystemUser: jest.fn(),
}));
jest.mock('./seeds/deleted-author.seed', () => ({
  seedDeletedAuthor: jest.fn(),
}));
jest.mock('./seeds/public-recipes.seed', () => ({
  seedPublicRecipes: jest.fn(),
  buildPublicRecipeSubResourceRepos: jest.fn(),
}));

const mockedSeedSystemUser = jest.mocked(seedSystemUser);
const mockedSeedDeletedAuthor = jest.mocked(seedDeletedAuthor);
const mockedSeedPublicRecipes = jest.mocked(seedPublicRecipes);
const mockedBuildSubRepos = jest.mocked(buildPublicRecipeSubResourceRepos);

// Distinct sentinels so we can assert each seed receives the repository
// resolved from the right entity.
const userRepo = { __entity: 'user' };
const recipeRepo = { __entity: 'recipe' };
const subRepos = {
  fermentableRepo: {},
  hopRepo: {},
  yeastRepo: {},
  stepRepo: {},
};

function buildDataSource(isInitialized: boolean): {
  dataSource: DataSource;
  initialize: jest.Mock;
} {
  const initialize = jest.fn().mockResolvedValue(undefined);
  const dataSource = {
    isInitialized,
    initialize,
    getRepository: jest.fn((entity: unknown) =>
      entity === User ? userRepo : recipeRepo,
    ),
  } as unknown as DataSource;
  return { dataSource, initialize };
}

describe('runProductionSeed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSeedDeletedAuthor.mockResolvedValue({
      inserted: true,
      user_id: 'deleted',
    });
    mockedBuildSubRepos.mockReturnValue(
      subRepos as unknown as ReturnType<
        typeof buildPublicRecipeSubResourceRepos
      >,
    );
  });

  describe('happy path', () => {
    it('seeds the system user then the public recipes and returns the combined summary', async () => {
      mockedSeedSystemUser.mockResolvedValue({
        inserted: true,
        user_id: 'sys',
      });
      mockedSeedPublicRecipes.mockResolvedValue({
        inserted: 12,
        updated: 0,
        total: 12,
      });
      const { dataSource, initialize } = buildDataSource(true);

      const result = await runProductionSeed(dataSource);

      // Already initialised → must not re-initialise.
      expect(initialize).not.toHaveBeenCalled();
      // System user and deleted-author tombstone seeded from the User
      // repository.
      expect(mockedSeedSystemUser).toHaveBeenCalledWith(userRepo);
      expect(mockedSeedDeletedAuthor).toHaveBeenCalledWith(userRepo);
      // Public recipes seeded from the Recipe repository, default seed list,
      // and the sub-resource repos built from the same DataSource.
      expect(mockedBuildSubRepos).toHaveBeenCalledWith(dataSource);
      expect(mockedSeedPublicRecipes).toHaveBeenCalledWith(
        recipeRepo,
        undefined,
        subRepos,
      );
      expect(result).toEqual({
        systemUser: { inserted: true, user_id: 'sys' },
        deletedAuthor: { inserted: true, user_id: 'deleted' },
        publicRecipes: { inserted: 12, updated: 0, total: 12 },
      });
    });

    it('seeds the system user BEFORE the recipes (FK owner_id -> users.id)', async () => {
      mockedSeedSystemUser.mockResolvedValue({
        inserted: true,
        user_id: 'sys',
      });
      mockedSeedPublicRecipes.mockResolvedValue({
        inserted: 0,
        updated: 12,
        total: 12,
      });

      await runProductionSeed(buildDataSource(true).dataSource);

      expect(mockedSeedSystemUser.mock.invocationCallOrder[0]).toBeLessThan(
        mockedSeedPublicRecipes.mock.invocationCallOrder[0],
      );
    });
  });

  describe('edge cases', () => {
    it('initialises the DataSource first when it is not yet connected', async () => {
      mockedSeedSystemUser.mockResolvedValue({
        inserted: true,
        user_id: 'sys',
      });
      mockedSeedPublicRecipes.mockResolvedValue({
        inserted: 12,
        updated: 0,
        total: 12,
      });
      const { dataSource, initialize } = buildDataSource(false);

      await runProductionSeed(dataSource);

      expect(initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('sad path', () => {
    it('rejects when the recipe seed fails, after the system user was seeded', async () => {
      mockedSeedSystemUser.mockResolvedValue({
        inserted: true,
        user_id: 'sys',
      });
      mockedSeedPublicRecipes.mockRejectedValue(new Error('seed boom'));

      await expect(
        runProductionSeed(buildDataSource(true).dataSource),
      ).rejects.toThrow('seed boom');
      expect(mockedSeedSystemUser).toHaveBeenCalledTimes(1);
    });
  });
});

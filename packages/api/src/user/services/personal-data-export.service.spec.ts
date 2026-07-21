import { User } from '../entities/user.entity';
import { PersonalDataExportRepository } from '../repositories/personal-data-export.repository';
import { UserService } from './user.service';
import { PersonalDataExportService } from './personal-data-export.service';

describe('PersonalDataExportService', () => {
  const exportRepository = {
    findRecipes: jest.fn(),
    findRecipeComponents: jest.fn(),
    findBatches: jest.fn(),
    findBatchRecords: jest.fn(),
    findEquipmentProfiles: jest.fn(),
    findLabelDrafts: jest.fn(),
    findScans: jest.fn(),
    findScanImages: jest.fn(),
  };
  const userService = {
    findById: jest.fn(),
  };
  let service: PersonalDataExportService;

  const user = Object.assign(new User(), {
    id: 'user-1',
    email: 'brewer@example.com',
    username: 'brewer',
    first_name: 'Alex',
    last_name: 'Brewer',
    bio: 'Home brewer',
    password_hash: 'must-not-export',
    role: 'admin',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userService.findById.mockResolvedValue(user);
    for (const method of Object.values(exportRepository)) {
      method.mockResolvedValue([]);
    }
    service = new PersonalDataExportService(
      exportRepository as unknown as PersonalDataExportRepository,
      userService as unknown as UserService,
    );
  });

  it('exports only authenticated account data and owned aggregate projections', async () => {
    // Arrange
    exportRepository.findRecipes.mockResolvedValue([
      { id: 'recipe-1', owner_id: 'user-1', name: 'My recipe' },
    ]);
    exportRepository.findRecipeComponents.mockResolvedValue([
      {
        id: 'fermentable-1',
        recipe_id: 'recipe-1',
        name: 'Malt',
        kind: 'fermentable',
      },
    ]);

    // Act
    const result = await service.exportAccount('user-1');

    // Assert
    expect(result.schema_version).toBe('1.0');
    expect(result.account).toEqual({
      id: 'user-1',
      email: 'brewer@example.com',
      username: 'brewer',
      first_name: 'Alex',
      last_name: 'Brewer',
      bio: 'Home brewer',
      created_at: user.created_at,
      updated_at: user.updated_at,
    });
    expect(result.recipes).toEqual([
      { id: 'recipe-1', owner_id: 'user-1', name: 'My recipe' },
    ]);
    expect(result.recipe_components).toEqual([
      {
        id: 'fermentable-1',
        recipe_id: 'recipe-1',
        name: 'Malt',
        kind: 'fermentable',
      },
    ]);
    expect(result).not.toHaveProperty('password_hash');
    expect(result).not.toHaveProperty('role');
    expect(exportRepository.findRecipes).toHaveBeenCalledWith('user-1');
  });

  it('returns empty collections for an account with no aggregate data', async () => {
    // Act
    const result = await service.exportAccount('empty-user');

    // Assert
    expect(result.recipes).toEqual([]);
    expect(result.recipe_components).toEqual([]);
    expect(result.batches).toEqual([]);
    expect(result.batch_records).toEqual([]);
    expect(result.scans).toEqual([]);
  });

  it('propagates storage errors instead of returning a partial export', async () => {
    // Arrange
    exportRepository.findRecipes.mockRejectedValueOnce(
      new Error('database unavailable'),
    );

    // Act
    const exportPromise = service.exportAccount('user-1');

    // Assert
    await expect(exportPromise).rejects.toThrow('database unavailable');
  });
});

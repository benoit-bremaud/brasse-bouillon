import { DataSource } from 'typeorm';

import { PersonalDataExportRepository } from './personal-data-export.repository';

describe('PersonalDataExportRepository', () => {
  const dataSource = {
    query: jest.fn(),
  };
  let repository: PersonalDataExportRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    dataSource.query.mockResolvedValue([]);
    repository = new PersonalDataExportRepository(
      dataSource as unknown as DataSource,
    );
  });

  it('reads owned recipes with the owner id as the only bound parameter', async () => {
    dataSource.query.mockResolvedValue([
      { id: 'recipe-1', owner_id: 'user-1', name: 'My recipe' },
    ]);

    const rows = await repository.findRecipes('user-1');

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM recipes'),
      ['user-1'],
    );
    expect(rows).toEqual([
      { id: 'recipe-1', owner_id: 'user-1', name: 'My recipe' },
    ]);
  });

  it('tags each recipe component with its kind and only reads owner-owned rows', async () => {
    dataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM recipe_fermentables')) {
        return Promise.resolve([{ id: 'ferm-1', recipe_id: 'recipe-1' }]);
      }
      if (sql.includes('FROM recipe_hops')) {
        return Promise.resolve([{ id: 'hop-1', recipe_id: 'recipe-1' }]);
      }
      return Promise.resolve([]);
    });

    const rows = await repository.findRecipeComponents('user-1');

    expect(rows).toEqual([
      { id: 'ferm-1', recipe_id: 'recipe-1', kind: 'fermentable' },
      { id: 'hop-1', recipe_id: 'recipe-1', kind: 'hop' },
    ]);
    // Every component query filters by the owner through the recipes join.
    const componentCalls = dataSource.query.mock.calls as unknown[][];
    for (const call of componentCalls) {
      expect(call[1]).toEqual(['user-1']);
      expect(call[0] as string).toContain('recipes.owner_id = ?');
    }
  });

  it('tags each batch record with its kind through the batches join', async () => {
    dataSource.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM batch_tastings')) {
        return Promise.resolve([{ id: 'tasting-1', batch_id: 'batch-1' }]);
      }
      return Promise.resolve([]);
    });

    const rows = await repository.findBatchRecords('user-1');

    expect(rows).toEqual([
      { id: 'tasting-1', batch_id: 'batch-1', kind: 'tasting' },
    ]);
    const batchCalls = dataSource.query.mock.calls as unknown[][];
    for (const call of batchCalls) {
      expect(call[1]).toEqual(['user-1']);
      expect(call[0] as string).toContain('batches.owner_id = ?');
    }
  });

  it('discards non-object rows defensively', async () => {
    dataSource.query.mockResolvedValue([
      { id: 'scan-1', owner_id: 'user-1' },
      null,
      'garbage',
      ['nested'],
    ]);

    const rows = await repository.findScans('user-1');

    expect(rows).toEqual([{ id: 'scan-1', owner_id: 'user-1' }]);
  });

  it('joins scan images to scan requests owned by the user', async () => {
    dataSource.query.mockResolvedValue([
      { id: 'image-1', scan_request_id: 'scan-1' },
    ]);

    await repository.findScanImages('user-1');

    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FROM scan_label_images'),
      ['user-1'],
    );
    const imageCalls = dataSource.query.mock.calls as unknown[][];
    expect(imageCalls[0][0] as string).toContain('scans.owner_id = ?');
  });

  it('propagates storage errors', async () => {
    dataSource.query.mockRejectedValue(new Error('database unavailable'));

    await expect(repository.findRecipes('user-1')).rejects.toThrow(
      'database unavailable',
    );
  });
});

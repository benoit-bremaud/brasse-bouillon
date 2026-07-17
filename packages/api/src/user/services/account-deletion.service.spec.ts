import { DataSource, EntityManager } from 'typeorm';

import { RecipeVisibility } from '../../recipe/domain/enums/recipe-visibility.enum';
import { User } from '../entities/user.entity';
import { AccountDeletionService } from './account-deletion.service';

describe('AccountDeletionService', () => {
  const queryBuilder = {
    update: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    execute: jest.fn(),
    select: jest.fn(),
    getRawMany: jest.fn(),
  };

  const manager = {
    findOne: jest.fn(),
    query: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
    delete: jest.fn(),
  };

  const userRepository = {
    find: jest.fn(),
  };

  const dataSource = {
    transaction: jest.fn(),
    query: jest.fn(),
    getRepository: jest.fn(),
  };

  let service: AccountDeletionService;

  beforeEach(() => {
    jest.clearAllMocks();
    queryBuilder.update.mockReturnValue(queryBuilder);
    queryBuilder.set.mockReturnValue(queryBuilder);
    queryBuilder.delete.mockReturnValue(queryBuilder);
    queryBuilder.from.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);
    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.execute.mockResolvedValue({ affected: 1 });
    queryBuilder.getRawMany.mockResolvedValue([]);
    manager.update.mockResolvedValue({ affected: 1 });
    manager.createQueryBuilder.mockReturnValue(queryBuilder);
    userRepository.find.mockResolvedValue([]);
    dataSource.getRepository.mockReturnValue(userRepository);
    dataSource.transaction.mockImplementation(
      async (
        callback: (transactionManager: EntityManager) => Promise<unknown>,
      ) => callback(manager as unknown as EntityManager),
    );
    service = new AccountDeletionService(dataSource as unknown as DataSource);
  });

  it('deletes private data, anonymizes public recipes, and removes the user in one transaction', async () => {
    // Arrange
    const userId = 'user-1';
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), { id: userId }),
    );
    manager.query.mockImplementation((sql: string) => {
      if (sql.includes('FROM recipes')) {
        return Promise.resolve([
          { id: 'private-recipe', visibility: RecipeVisibility.PRIVATE },
          { id: 'public-recipe', visibility: RecipeVisibility.PUBLIC },
        ]);
      }
      if (sql.includes('FROM "batches"')) {
        return Promise.resolve([{ id: 'batch-1' }]);
      }
      if (sql.includes('FROM "scan_requests"')) {
        return Promise.resolve([{ id: 'scan-1' }]);
      }
      return Promise.resolve([]);
    });
    queryBuilder.getRawMany.mockResolvedValue([
      { file_path: 'uploads/scan-labels/user-1/scan-1/front.jpg' },
    ]);

    // Act
    await service.deleteAccount(userId);

    // Assert
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(queryBuilder.set).toHaveBeenCalledWith({
      owner_id: '00000000-0000-0000-0000-000000000000',
    });
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'owner_id = :userId AND visibility = :visibility',
      { userId, visibility: RecipeVisibility.PUBLIC },
    );
    expect(manager.delete).toHaveBeenCalledWith(User, { id: userId });
  });

  it('is idempotent when the account was already removed', async () => {
    // Arrange
    manager.findOne.mockResolvedValue(null);

    // Act
    await service.deleteAccount('missing-user');

    // Assert
    expect(manager.query).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('does not issue dependent deletes when an account owns no aggregate data', async () => {
    // Arrange
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), { id: 'empty-user' }),
    );
    manager.query.mockResolvedValue([]);

    // Act
    await service.deleteAccount('empty-user');

    // Assert
    expect(queryBuilder.execute).toHaveBeenCalled();
    expect(manager.delete).toHaveBeenCalledWith(User, { id: 'empty-user' });
  });

  it('schedules deletion once and returns a 30-day recovery window', async () => {
    // Arrange
    const now = new Date('2026-07-16T10:00:00.000Z');
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), { id: 'user-1' }),
    );

    // Act
    const result = await service.requestDeletion('user-1', now);

    // Assert
    expect(result).toEqual({
      status: 'scheduled',
      requested_at: now,
      scheduled_for: new Date('2026-08-15T10:00:00.000Z'),
      grace_period_days: 30,
    });
    expect(manager.update).toHaveBeenCalledWith(
      User,
      'user-1',
      expect.objectContaining({
        deletion_requested_at: now,
        deletion_scheduled_for: new Date('2026-08-15T10:00:00.000Z'),
      }),
    );
  });

  it('is idempotent when deletion is already pending', async () => {
    // Arrange
    const requestedAt = new Date('2026-07-16T10:00:00.000Z');
    const scheduledFor = new Date('2026-08-15T10:00:00.000Z');
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: requestedAt,
        deletion_scheduled_for: scheduledFor,
      }),
    );

    // Act
    const result = await service.requestDeletion(
      'user-1',
      new Date('2026-07-20T10:00:00.000Z'),
    );

    // Assert
    expect(result.scheduled_for).toBe(scheduledFor);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('cancels a pending deletion before its deadline', async () => {
    // Arrange
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: new Date('2026-07-16T10:00:00.000Z'),
        deletion_scheduled_for: new Date('2026-08-15T10:00:00.000Z'),
      }),
    );

    // Act
    await service.cancelDeletion(
      'user-1',
      new Date('2026-07-20T10:00:00.000Z'),
    );

    // Assert
    expect(manager.update).toHaveBeenCalledWith(User, 'user-1', {
      deletion_requested_at: null,
      deletion_scheduled_for: null,
    });
  });

  it('stays idempotent when the pending deletion is already past due', async () => {
    // Arrange — rescheduling here would reopen the closed cancel window.
    const requestedAt = new Date('2026-06-01T10:00:00.000Z');
    const scheduledFor = new Date('2026-07-01T10:00:00.000Z');
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: requestedAt,
        deletion_scheduled_for: scheduledFor,
      }),
    );

    // Act
    const result = await service.requestDeletion(
      'user-1',
      new Date('2026-07-16T10:00:00.000Z'),
    );

    // Assert
    expect(result.scheduled_for).toBe(scheduledFor);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('rejects cancellation once the deletion deadline has passed', async () => {
    // Arrange
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: new Date('2026-06-01T10:00:00.000Z'),
        deletion_scheduled_for: new Date('2026-07-01T10:00:00.000Z'),
      }),
    );

    // Act + Assert
    await expect(
      service.cancelDeletion('user-1', new Date('2026-07-16T10:00:00.000Z')),
    ).rejects.toThrow('Account deletion is already due');
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('processes each due user returned by the repository', async () => {
    // Arrange
    userRepository.find.mockResolvedValue([{ id: 'due-1' }, { id: 'due-2' }]);
    const deleteSpy = jest
      .spyOn(service, 'deleteAccount')
      .mockResolvedValue(undefined);

    // Act
    await service.processDueDeletions();

    // Assert
    expect(deleteSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenNthCalledWith(1, 'due-1', expect.any(Date));
    expect(deleteSpy).toHaveBeenNthCalledWith(2, 'due-2', expect.any(Date));
  });

  it('continues with remaining due users when one deletion fails', async () => {
    // Arrange
    userRepository.find.mockResolvedValue([
      { id: 'failing-user' },
      { id: 'healthy-user' },
    ]);
    const deleteSpy = jest
      .spyOn(service, 'deleteAccount')
      .mockRejectedValueOnce(new Error('disk full'))
      .mockResolvedValueOnce(undefined);

    // Act + Assert — the cron callback must never surface a rejection.
    await expect(service.processDueDeletions()).resolves.toBeUndefined();
    expect(deleteSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenLastCalledWith(
      'healthy-user',
      expect.any(Date),
    );
  });

  it('does not throw when listing due deletions fails', async () => {
    // Arrange
    userRepository.find.mockRejectedValue(new Error('database unavailable'));
    const deleteSpy = jest.spyOn(service, 'deleteAccount');

    // Act + Assert
    await expect(service.processDueDeletions()).resolves.toBeUndefined();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('skips the worker-path erasure when the deletion was canceled meanwhile', async () => {
    // Arrange — due-users snapshot said "due", but the user canceled
    // before the erasure transaction started.
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: null,
        deletion_scheduled_for: null,
      }),
    );

    // Act
    await service.deleteAccount('user-1', new Date('2026-07-16T10:00:00.000Z'));

    // Assert
    expect(manager.query).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('skips the worker-path erasure when the deletion is no longer due', async () => {
    // Arrange — a cancel + fresh request moved the deadline to the future.
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: new Date('2026-07-10T10:00:00.000Z'),
        deletion_scheduled_for: new Date('2026-08-09T10:00:00.000Z'),
      }),
    );

    // Act
    await service.deleteAccount('user-1', new Date('2026-07-16T10:00:00.000Z'));

    // Assert
    expect(manager.query).not.toHaveBeenCalled();
    expect(manager.delete).not.toHaveBeenCalled();
  });

  it('erases through the worker path when the deletion is due', async () => {
    // Arrange
    manager.findOne.mockResolvedValue(
      Object.assign(new User(), {
        id: 'user-1',
        deletion_requested_at: new Date('2026-06-01T10:00:00.000Z'),
        deletion_scheduled_for: new Date('2026-07-01T10:00:00.000Z'),
      }),
    );
    manager.query.mockResolvedValue([]);

    // Act
    await service.deleteAccount('user-1', new Date('2026-07-16T10:00:00.000Z'));

    // Assert
    expect(manager.delete).toHaveBeenCalledWith(User, { id: 'user-1' });
  });
});

/**
 * Regression harness on the production sqlite driver: the first worker
 * implementation bound a JS Date into a raw SQL query, which
 * better-sqlite3 rejects at bind time — every hourly run crashed and no
 * scheduled deletion was ever executed. This suite proves the due-users
 * selection round-trips dates correctly through TypeORM.
 */
describe('AccountDeletionService (better-sqlite3 integration)', () => {
  let dataSource: DataSource;
  let service: AccountDeletionService;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [User],
      synchronize: true,
    });
    await dataSource.initialize();
    service = new AccountDeletionService(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('selects only accounts whose deletion deadline has passed', async () => {
    // Arrange
    const now = Date.now();
    const users = dataSource.getRepository(User);
    const dueUser = await users.save(
      seedUser('due', new Date(now - 300_000), new Date(now - 60_000)),
    );
    await users.save(
      seedUser('pending', new Date(now - 300_000), new Date(now + 3_600_000)),
    );
    await users.save(seedUser('untouched', null, null));
    const deleteSpy = jest
      .spyOn(service, 'deleteAccount')
      .mockResolvedValue(undefined);

    // Act
    await service.processDueDeletions();

    // Assert
    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(dueUser.id, expect.any(Date));
  });
});

function seedUser(
  slug: string,
  requestedAt: Date | null,
  scheduledFor: Date | null,
): User {
  return Object.assign(new User(), {
    email: `${slug}@example.com`,
    username: `user_${slug}`,
    password_hash: 'not-a-real-hash',
    deletion_requested_at: requestedAt,
    deletion_scheduled_for: scheduledFor,
  });
}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ConflictException } from '@nestjs/common';

import { AppModule } from './../src/app.module';
import { UserService } from './../src/user/services/user.service';
import { UserRole } from './../src/common/enums/role.enum';

/**
 * Exercises the CREATOR role against the REAL migrated SQLite schema (the e2e
 * runner applies all migrations). Unit tests mock the repository, so they
 * cannot catch a DB-level CHECK constraint — this is the regression guard for
 * the `CHK_users_role` fix (a 'creator' row must persist) and the
 * `UQ_users_single_creator` single-holder backstop (ADR-0011).
 */
describe('CREATOR role (e2e — real migrated DB)', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    userService = app.get(UserService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('persists role = creator through the migrated CHECK constraint', async () => {
    await userService.create({
      email: 'founder@example.com',
      username: 'founder',
      password: 'SecurePassword123!',
    });

    const promoted = await userService.assignCreatorRole('founder@example.com');

    expect(promoted.role).toBe(UserRole.CREATOR);
  });

  it('rejects a second CREATOR at the DB single-holder backstop', async () => {
    await userService.create({
      email: 'a@example.com',
      username: 'usera',
      password: 'SecurePassword123!',
    });
    await userService.create({
      email: 'b@example.com',
      username: 'userb',
      password: 'SecurePassword123!',
    });
    await userService.assignCreatorRole('a@example.com');

    await expect(
      userService.assignCreatorRole('b@example.com'),
    ).rejects.toThrow(ConflictException);
  });

  it('is idempotent — re-assigning the same CREATOR keeps the role', async () => {
    await userService.create({
      email: 'c@example.com',
      username: 'userc',
      password: 'SecurePassword123!',
    });
    await userService.assignCreatorRole('c@example.com');

    const again = await userService.assignCreatorRole('c@example.com');

    expect(again.role).toBe(UserRole.CREATOR);
  });
});

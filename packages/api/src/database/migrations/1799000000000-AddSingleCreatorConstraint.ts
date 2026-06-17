import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the `CREATOR` role (ADR-0011) at the database level.
 *
 * Two changes on the `users` table:
 * 1. Extend `CHK_users_role` to permit `'creator'` — the initial schema only
 *    allowed `'admin' | 'user' | 'moderator'`, so persisting `role = 'creator'`
 *    would otherwise fail with a CHECK violation (caught in review of #1231).
 * 2. Add the partial unique index `UQ_users_single_creator` enforcing the
 *    single-holder invariant (at most one `role = 'creator'` row) as a DB
 *    backstop for `UserService.assignCreatorRole`.
 *
 * SQLite cannot ALTER a CHECK constraint in place, so the table is rebuilt
 * (create → copy → drop → rename → re-index) following the repo's existing
 * `PRAGMA foreign_keys` pattern. Column set mirrors the schema after
 * `1778000000000-AddPasswordResetFieldsToUser`.
 */
export class AddSingleCreatorConstraint1799000000000 implements MigrationInterface {
  name = 'AddSingleCreatorConstraint1799000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.rebuildUsers(queryRunner, [
      'admin',
      'user',
      'moderator',
      'creator',
    ]);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_single_creator" ON "users" ("role") WHERE "role" = 'creator'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_single_creator"`);
    // Reverts the CHECK to its original three roles. Fails if a 'creator' row
    // still exists (it would violate the restored constraint) — demote first.
    await this.rebuildUsers(queryRunner, ['admin', 'user', 'moderator']);
  }

  /**
   * Rebuild the `users` table with the given allowed roles in `CHK_users_role`,
   * preserving every column, default, row, and index.
   */
  private async rebuildUsers(
    queryRunner: QueryRunner,
    allowedRoles: string[],
  ): Promise<void> {
    const rolesList = allowedRoles.map((r) => `'${r}'`).join(', ');
    const columns = [
      'id',
      'email',
      'username',
      'password_hash',
      'first_name',
      'last_name',
      'role',
      'created_at',
      'updated_at',
      'is_active',
      'password_reset_token_hash',
      'password_reset_expires_at',
    ]
      .map((c) => `"${c}"`)
      .join(', ');

    await queryRunner.query(`PRAGMA foreign_keys = OFF`);
    try {
      await queryRunner.query(`
      CREATE TABLE "users_new" (
        "id" varchar PRIMARY KEY NOT NULL,
        "email" varchar(255) NOT NULL,
        "username" varchar(100) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "first_name" varchar(255),
        "last_name" varchar(255),
        "role" varchar(20) NOT NULL DEFAULT ('user'),
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "is_active" boolean NOT NULL DEFAULT (1),
        "password_reset_token_hash" varchar(255),
        "password_reset_expires_at" datetime,
        CONSTRAINT "CHK_users_role" CHECK ("role" IN (${rolesList}))
      )
    `);
      await queryRunner.query(
        `INSERT INTO "users_new" (${columns}) SELECT ${columns} FROM "users"`,
      );
      await queryRunner.query(`DROP TABLE "users"`);
      await queryRunner.query(`ALTER TABLE "users_new" RENAME TO "users"`);
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_users_email_unique" ON "users" ("email")`,
      );
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_users_username_unique" ON "users" ("username")`,
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_users_password_reset_token_hash" ON "users" ("password_reset_token_hash")`,
      );
    } finally {
      // Always restore FK enforcement, even if the rebuild fails mid-way —
      // otherwise the connection keeps FK checks disabled for the process.
      await queryRunner.query(`PRAGMA foreign_keys = ON`);
    }
  }
}

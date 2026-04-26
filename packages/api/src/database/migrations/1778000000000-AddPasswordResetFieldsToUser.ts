import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds password-reset fields to the `users` table (Issue #603a).
 *
 * Two columns:
 * - `password_reset_token_hash` VARCHAR(255) nullable — bcrypt hash of
 *   the raw token. Storing the hash (not the raw token) prevents a
 *   leaked DB snapshot from being directly usable to reset accounts.
 * - `password_reset_expires_at` DATETIME nullable — UTC timestamp at
 *   which the token expires (1 hour after issuance per the onboarding
 *   brainstorm §2.7).
 *
 * Both fields stay NULL when no reset is in-flight. They are cleared
 * on successful reset, on a new reset request (single-use semantics),
 * and on password change via the existing change-password flow.
 *
 * Index on `password_reset_token_hash` so reset attempts can locate
 * the user efficiently when they POST the token to /auth/reset-password.
 */
export class AddPasswordResetFieldsToUser1778000000000 implements MigrationInterface {
  name = 'AddPasswordResetFieldsToUser1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "password_reset_token_hash" varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "password_reset_expires_at" datetime`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_users_password_reset_token_hash" ON "users" ("password_reset_token_hash")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_password_reset_token_hash"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "password_reset_expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "password_reset_token_hash"`,
    );
  }
}

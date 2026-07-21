import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds the authenticated account deletion grace-period timestamps. */
export class AddUserDeletionGracePeriod1811000000000 implements MigrationInterface {
  name = 'AddUserDeletionGracePeriod1811000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "deletion_requested_at" datetime`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "deletion_scheduled_for" datetime`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_deletion_scheduled_for" ON "users" ("deletion_scheduled_for")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_deletion_scheduled_for"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "deletion_scheduled_for"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "deletion_requested_at"`,
    );
  }
}

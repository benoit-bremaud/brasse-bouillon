import { MigrationInterface, QueryRunner } from 'typeorm';

/** Adds the bounded plain-text biography used by the Profile MVP. */
export class AddUserBio1810000000000 implements MigrationInterface {
  name = 'AddUserBio1810000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "bio" varchar(500)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
  }
}

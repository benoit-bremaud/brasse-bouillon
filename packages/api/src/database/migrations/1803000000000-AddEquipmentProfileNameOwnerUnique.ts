import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Enforce per-owner uniqueness of equipment profile names (F21). A user cannot
 * create two profiles with the same name; different users may reuse a name.
 *
 * The `up()` step defensively removes pre-existing duplicate (owner_id, name)
 * rows — keeping the earliest — BEFORE creating the unique index, so the
 * migration cannot fail (and brick the boot-time `migrationsRun`) on databases
 * that already contain duplicates created before this constraint existed.
 */
export class AddEquipmentProfileNameOwnerUnique1803000000000 implements MigrationInterface {
  name = 'AddEquipmentProfileNameOwnerUnique1803000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "equipment_profiles"
      WHERE rowid NOT IN (
        SELECT MIN(rowid)
        FROM "equipment_profiles"
        GROUP BY "owner_id", "name"
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_equipment_profiles_owner_id_name" ON "equipment_profiles" ("owner_id", "name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "IDX_equipment_profiles_owner_id_name"`,
    );
  }
}

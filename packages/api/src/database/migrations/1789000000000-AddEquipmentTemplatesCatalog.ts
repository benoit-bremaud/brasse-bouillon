import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `equipment_templates` table — immutable reference
 * catalogue of homebrew equipment templates. Phase 3 PR #7 of
 * the catalogue refactor (Issue #708 / #869).
 *
 * **Naming**: distinct from the existing `equipment_profiles`
 * table (user-owned per-brewer setups). A template here is the
 * SHARED reference (manufacturer specs) that a user can later
 * copy to seed their own personal `equipment_profile`. The
 * naming split avoids the kind of class-name collision that
 * PR #894 caught and fixed for the water catalogue.
 *
 * Seeded with 8 entries (2 BeerXML verbatim from
 * libraries/equipment.xml + 6 popular modern setups).
 */
export class AddEquipmentTemplatesCatalog1789000000000 implements MigrationInterface {
  name = 'AddEquipmentTemplatesCatalog1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "equipment_templates" (
        "id"                        varchar(36) PRIMARY KEY NOT NULL,
        "name"                      varchar(120) NOT NULL,
        "boil_size_l"               real,
        "batch_size_l"              real,
        "tun_volume_l"              real,
        "tun_weight_kg"             real,
        "tun_specific_heat"         real,
        "top_up_water_l"            real,
        "trub_chiller_loss_l"       real,
        "evap_rate_percent"         real,
        "boil_time_min"             integer,
        "calc_boil_volume"          boolean NOT NULL DEFAULT 1,
        "lauter_deadspace_l"        real,
        "top_up_kettle_l"           real,
        "hop_utilization_percent"   real,
        "notes"                     text,
        "created_at"                datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"                datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_equipment_templates_name" ON "equipment_templates" ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_equipment_templates_name"`);
    await queryRunner.query(`DROP TABLE "equipment_templates"`);
  }
}

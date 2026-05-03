import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `mash_profiles` and `mash_steps` tables — the first
 * catalogue with a 1:N internal relation. Phase 2 PR #5 of the
 * catalogue refactor (Issue #708 / #869), completing the metadata
 * phase that started with `styles` (#891).
 *
 * `mash_steps.mash_profile_id` → `mash_profiles.id` with
 * ON DELETE CASCADE: deleting a profile removes all its steps,
 * since orphan mash steps make no sense. The composite UNIQUE
 * (mash_profile_id, step_index) guards against duplicate ordering
 * positions within the same profile.
 *
 * BeerXML 1.0 mapping:
 *   - `<MASH>` parent → mash_profiles row
 *   - `<MASH_STEP>` child → mash_steps row (one per step)
 *
 * Seeded with 10 profiles + ~28 steps (5 BeerXML verbatim from
 * libraries/mash.xml + 5 modern profiles for the demo recipes).
 */
export class AddMashCatalog1787000000000 implements MigrationInterface {
  name = 'AddMashCatalog1787000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "mash_profiles" (
        "id"                  varchar(36) PRIMARY KEY NOT NULL,
        "name"                varchar(120) NOT NULL,
        "grain_temp_c"        real,
        "tun_temp_c"          real,
        "sparge_temp_c"       real,
        "ph"                  real,
        "tun_weight_kg"       real,
        "tun_specific_heat"   real,
        "equip_adjust"        boolean NOT NULL DEFAULT 0,
        "notes"               text,
        "created_at"          datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"          datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_mash_profiles_name" UNIQUE ("name")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "mash_steps" (
        "id"                    varchar(36) PRIMARY KEY NOT NULL,
        "mash_profile_id"       varchar(36) NOT NULL,
        "step_index"            integer NOT NULL,
        "name"                  varchar(60) NOT NULL,
        "type"                  varchar(12) NOT NULL,
        "step_time_min"         integer,
        "step_temp_c"           real,
        "ramp_time_min"         integer,
        "end_temp_c"            real,
        "infuse_amount_l"       real,
        "infuse_temp_c"         real,
        "decoction_amount_l"    real,
        "water_grain_ratio"     real,
        "description"           text,
        "created_at"            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"            datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_mash_steps_profile"
          FOREIGN KEY ("mash_profile_id")
          REFERENCES "mash_profiles"("id")
          ON DELETE CASCADE,
        CONSTRAINT "CHK_mash_steps_type"
          CHECK ("type" IN ('infusion', 'temperature', 'decoction')),
        CONSTRAINT "UQ_mash_steps_profile_index"
          UNIQUE ("mash_profile_id", "step_index")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_mash_steps_profile" ON "mash_steps" ("mash_profile_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_mash_steps_type" ON "mash_steps" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_mash_steps_type"`);
    await queryRunner.query(`DROP INDEX "IDX_mash_steps_profile"`);
    await queryRunner.query(`DROP TABLE "mash_steps"`);
    await queryRunner.query(`DROP TABLE "mash_profiles"`);
  }
}

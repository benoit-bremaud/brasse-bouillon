import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIngredientsAndMetrics1771345553838
  implements MigrationInterface
{
  name = 'AddIngredientsAndMetrics1771345553838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "batch_size_l" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "boil_time_min" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "og_target" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "fg_target" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "abv_estimated" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "ibu_target" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "ebc_target" real`,
    );
    await queryRunner.query(
      `ALTER TABLE "recipes" ADD COLUMN "efficiency_target" real`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipe_fermentables" (
        "id" varchar PRIMARY KEY NOT NULL,
        "recipe_id" varchar(36) NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" varchar(20) NOT NULL,
        "weight_g" real NOT NULL,
        "potential_gravity" real,
        "color_ebc" real,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_recipe_fermentables_type" CHECK ("type" IN ('grain', 'extract', 'sugar', 'adjunct')),
        CONSTRAINT "FK_recipe_fermentables_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_recipe_fermentables_recipe_id" ON "recipe_fermentables" ("recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipe_hops" (
        "id" varchar PRIMARY KEY NOT NULL,
        "recipe_id" varchar(36) NOT NULL,
        "variety" varchar(100) NOT NULL,
        "type" varchar(20) NOT NULL,
        "weight_g" real NOT NULL,
        "alpha_acid_percent" real,
        "addition_stage" varchar(20) NOT NULL,
        "addition_time_min" integer,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_recipe_hops_type" CHECK ("type" IN ('pellet', 'whole_leaf', 'extract')),
        CONSTRAINT "CHK_recipe_hops_addition_stage" CHECK ("addition_stage" IN ('boil', 'whirlpool', 'dry_hop', 'first_wort')),
        CONSTRAINT "FK_recipe_hops_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_recipe_hops_recipe_id" ON "recipe_hops" ("recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipe_yeasts" (
        "id" varchar PRIMARY KEY NOT NULL,
        "recipe_id" varchar(36) NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" varchar(20) NOT NULL,
        "amount_g" real NOT NULL,
        "attenuation_percent" real,
        "temperature_min_c" integer,
        "temperature_max_c" integer,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_recipe_yeasts_type" CHECK ("type" IN ('ale', 'lager', 'wild', 'brett')),
        CONSTRAINT "FK_recipe_yeasts_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_recipe_yeasts_recipe_id" ON "recipe_yeasts" ("recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipe_additives" (
        "id" varchar PRIMARY KEY NOT NULL,
        "recipe_id" varchar(36) NOT NULL,
        "name" varchar(100) NOT NULL,
        "type" varchar(20) NOT NULL,
        "amount_g" real NOT NULL,
        "addition_step" varchar(20) NOT NULL,
        "addition_time_min" integer,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_recipe_additives_type" CHECK ("type" IN ('spice', 'fruit', 'fining', 'acid', 'salt', 'other')),
        CONSTRAINT "CHK_recipe_additives_addition_step" CHECK ("addition_step" IN ('mash', 'boil', 'whirlpool', 'fermentation', 'packaging')),
        CONSTRAINT "FK_recipe_additives_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_recipe_additives_recipe_id" ON "recipe_additives" ("recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipe_water" (
        "recipe_id" varchar(36) PRIMARY KEY NOT NULL,
        "mash_volume_l" real NOT NULL,
        "sparge_volume_l" real NOT NULL,
        "mash_temperature_c" integer,
        "sparge_temperature_c" integer,
        "calcium_ppm" real,
        "magnesium_ppm" real,
        "sulfate_ppm" real,
        "chloride_ppm" real,
        "ph_target" real,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "FK_recipe_water_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_recipe_water_recipe_id" ON "recipe_water" ("recipe_id")`,
    );

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(`DROP INDEX "IDX_recipe_water_recipe_id"`);
    await queryRunner.query(`DROP TABLE "recipe_water"`);

    await queryRunner.query(`DROP INDEX "IDX_recipe_additives_recipe_id"`);
    await queryRunner.query(`DROP TABLE "recipe_additives"`);

    await queryRunner.query(`DROP INDEX "IDX_recipe_yeasts_recipe_id"`);
    await queryRunner.query(`DROP TABLE "recipe_yeasts"`);

    await queryRunner.query(`DROP INDEX "IDX_recipe_hops_recipe_id"`);
    await queryRunner.query(`DROP TABLE "recipe_hops"`);

    await queryRunner.query(`DROP INDEX "IDX_recipe_fermentables_recipe_id"`);
    await queryRunner.query(`DROP TABLE "recipe_fermentables"`);

    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "efficiency_target"`,
    );
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "ebc_target"`);
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "ibu_target"`);
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "abv_estimated"`,
    );
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "fg_target"`);
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "og_target"`);
    await queryRunner.query(
      `ALTER TABLE "recipes" DROP COLUMN "boil_time_min"`,
    );
    await queryRunner.query(`ALTER TABLE "recipes" DROP COLUMN "batch_size_l"`);

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }
}

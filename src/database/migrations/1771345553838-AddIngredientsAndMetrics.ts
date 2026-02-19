import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIngredientsAndMetrics1771345553838
  implements MigrationInterface
{
  name = 'AddIngredientsAndMetrics1771345553838';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recipe_additives" ("id" varchar PRIMARY KEY NOT NULL, "recipe_id" varchar(36) NOT NULL, "name" varchar(100) NOT NULL, "type" varchar CHECK( "type" IN ('spice','fruit','fining','acid','salt','other') ) NOT NULL, "amount_g" real NOT NULL, "addition_step" varchar CHECK( "addition_step" IN ('mash','boil','whirlpool','fermentation','packaging') ) NOT NULL, "addition_time_min" integer, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f599a546aee18f976f355f1697" ON "recipe_additives" ("recipe_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_fermentables" ("id" varchar PRIMARY KEY NOT NULL, "recipe_id" varchar(36) NOT NULL, "name" varchar(100) NOT NULL, "type" varchar CHECK( "type" IN ('grain','extract','sugar','adjunct') ) NOT NULL, "weight_g" real NOT NULL, "potential_gravity" real, "color_ebc" real, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c4fd52b02273dc5eff215c343" ON "recipe_fermentables" ("recipe_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_hops" ("id" varchar PRIMARY KEY NOT NULL, "recipe_id" varchar(36) NOT NULL, "variety" varchar(100) NOT NULL, "type" varchar CHECK( "type" IN ('pellet','whole_leaf','extract') ) NOT NULL, "weight_g" real NOT NULL, "alpha_acid_percent" real, "addition_stage" varchar CHECK( "addition_stage" IN ('boil','whirlpool','dry_hop','first_wort') ) NOT NULL, "addition_time_min" integer, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_264a7622b6e0804a1c7c6b40c3" ON "recipe_hops" ("recipe_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_water" ("recipe_id" varchar(36) PRIMARY KEY NOT NULL, "mash_volume_l" real NOT NULL, "sparge_volume_l" real NOT NULL, "mash_temperature_c" integer, "sparge_temperature_c" integer, "calcium_ppm" real, "magnesium_ppm" real, "sulfate_ppm" real, "chloride_ppm" real, "ph_target" real, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9c6840be912ab6842871a478a3" ON "recipe_water" ("recipe_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_yeasts" ("id" varchar PRIMARY KEY NOT NULL, "recipe_id" varchar(36) NOT NULL, "name" varchar(100) NOT NULL, "type" varchar CHECK( "type" IN ('ale','lager','wild','brett') ) NOT NULL, "amount_g" real NOT NULL, "attenuation_percent" real, "temperature_min_c" integer, "temperature_max_c" integer, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e41a51e5dec16326f05cfe0892" ON "recipe_yeasts" ("recipe_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_79a3d5be8267dbe740bb860da6"`);
    await queryRunner.query(`DROP INDEX "IDX_a6f21b05a0f89abd1faddbc537"`);
    await queryRunner.query(`DROP INDEX "IDX_71bb8421d7219197f9e8150342"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_recipes" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "name" varchar(200) NOT NULL, "description" text, "visibility" varchar CHECK( "visibility" IN ('private','unlisted','public') ) NOT NULL DEFAULT ('private'), "version" integer NOT NULL DEFAULT (1), "root_recipe_id" varchar(36) NOT NULL, "parent_recipe_id" varchar(36), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "batch_size_l" real, "boil_time_min" integer, "og_target" real, "fg_target" real, "abv_estimated" real, "ibu_target" real, "ebc_target" real, "efficiency_target" real)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_recipes"("id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at") SELECT "id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at" FROM "recipes"`,
    );
    await queryRunner.query(`DROP TABLE "recipes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_recipes" RENAME TO "recipes"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79a3d5be8267dbe740bb860da6" ON "recipes" ("root_recipe_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6f21b05a0f89abd1faddbc537" ON "recipes" ("visibility") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71bb8421d7219197f9e8150342" ON "recipes" ("owner_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_46fd842e6d23ce5ef2d68fcd2c"`);
    await queryRunner.query(`DROP INDEX "IDX_7b1ba5e79c27dbc3a3a687dbbb"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_batches" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "recipe_id" varchar(36) NOT NULL, "status" varchar CHECK( "status" IN ('in_progress','completed') ) NOT NULL DEFAULT ('in_progress'), "current_step_order" integer, "started_at" datetime NOT NULL, "fermentation_started_at" datetime, "fermentation_completed_at" datetime, "completed_at" datetime, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_batches"("id", "owner_id", "recipe_id", "status", "current_step_order", "started_at", "fermentation_started_at", "fermentation_completed_at", "completed_at", "created_at", "updated_at") SELECT "id", "owner_id", "recipe_id", "status", "current_step_order", "started_at", "fermentation_started_at", "fermentation_completed_at", "completed_at", "created_at", "updated_at" FROM "batches"`,
    );
    await queryRunner.query(`DROP TABLE "batches"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_batches" RENAME TO "batches"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46fd842e6d23ce5ef2d68fcd2c" ON "batches" ("recipe_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7b1ba5e79c27dbc3a3a687dbbb" ON "batches" ("owner_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_fd9e8a338b145095bef31195fe"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_batch_reminders" ("id" varchar PRIMARY KEY NOT NULL, "batch_id" varchar(36) NOT NULL, "label" varchar(200) NOT NULL, "due_at" datetime NOT NULL, "status" varchar CHECK( "status" IN ('pending','done','canceled') ) NOT NULL DEFAULT ('pending'), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_batch_reminders"("id", "batch_id", "label", "due_at", "status", "created_at", "updated_at") SELECT "id", "batch_id", "label", "due_at", "status", "created_at", "updated_at" FROM "batch_reminders"`,
    );
    await queryRunner.query(`DROP TABLE "batch_reminders"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_batch_reminders" RENAME TO "batch_reminders"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fd9e8a338b145095bef31195fe" ON "batch_reminders" ("batch_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_b51578dec853e3c5bd445880ab"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_batch_steps" ("batch_id" varchar NOT NULL, "step_order" integer NOT NULL, "type" varchar CHECK( "type" IN ('mash','boil','whirlpool','fermentation','packaging') ) NOT NULL, "label" varchar(200) NOT NULL, "description" text, "status" varchar CHECK( "status" IN ('pending','in_progress','completed') ) NOT NULL, "started_at" datetime, "completed_at" datetime, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), PRIMARY KEY ("batch_id", "step_order"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_batch_steps"("batch_id", "step_order", "type", "label", "description", "status", "started_at", "completed_at", "created_at", "updated_at") SELECT "batch_id", "step_order", "type", "label", "description", "status", "started_at", "completed_at", "created_at", "updated_at" FROM "batch_steps"`,
    );
    await queryRunner.query(`DROP TABLE "batch_steps"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_batch_steps" RENAME TO "batch_steps"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b51578dec853e3c5bd445880ab" ON "batch_steps" ("batch_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_c96103c0a53fef2d6883336870"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_equipment_profiles" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "name" varchar(120) NOT NULL, "mash_tun_volume_l" real NOT NULL, "boil_kettle_volume_l" real NOT NULL, "fermenter_volume_l" real NOT NULL, "trub_loss_l" real NOT NULL DEFAULT (0), "dead_space_loss_l" real NOT NULL DEFAULT (0), "transfer_loss_l" real NOT NULL DEFAULT (0), "evaporation_rate_l_per_hour" real NOT NULL, "efficiency_estimated_percent" real NOT NULL, "efficiency_measured_percent" real, "cooling_time_minutes" integer, "cooling_flow_rate_l_per_minute" real, "system_type" varchar CHECK( "system_type" IN ('extract','all-grain','all-in-one') ) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_equipment_profiles"("id", "owner_id", "name", "mash_tun_volume_l", "boil_kettle_volume_l", "fermenter_volume_l", "trub_loss_l", "dead_space_loss_l", "transfer_loss_l", "evaporation_rate_l_per_hour", "efficiency_estimated_percent", "efficiency_measured_percent", "cooling_time_minutes", "cooling_flow_rate_l_per_minute", "system_type", "created_at", "updated_at") SELECT "id", "owner_id", "name", "mash_tun_volume_l", "boil_kettle_volume_l", "fermenter_volume_l", "trub_loss_l", "dead_space_loss_l", "transfer_loss_l", "evaporation_rate_l_per_hour", "efficiency_estimated_percent", "efficiency_measured_percent", "cooling_time_minutes", "cooling_flow_rate_l_per_minute", "system_type", "created_at", "updated_at" FROM "equipment_profiles"`,
    );
    await queryRunner.query(`DROP TABLE "equipment_profiles"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_equipment_profiles" RENAME TO "equipment_profiles"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c96103c0a53fef2d6883336870" ON "equipment_profiles" ("owner_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_79a3d5be8267dbe740bb860da6"`);
    await queryRunner.query(`DROP INDEX "IDX_a6f21b05a0f89abd1faddbc537"`);
    await queryRunner.query(`DROP INDEX "IDX_71bb8421d7219197f9e8150342"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_recipes" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "name" varchar(200) NOT NULL, "description" text, "visibility" varchar CHECK( "visibility" IN ('private','unlisted','public') ) NOT NULL DEFAULT ('private'), "version" integer NOT NULL DEFAULT (1), "root_recipe_id" varchar(36) NOT NULL, "parent_recipe_id" varchar(36), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "batch_size_l" real, "boil_time_min" integer, "og_target" real, "fg_target" real, "abv_estimated" real, "ibu_target" real, "ebc_target" real, "efficiency_target" real)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_recipes"("id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at", "batch_size_l", "boil_time_min", "og_target", "fg_target", "abv_estimated", "ibu_target", "ebc_target", "efficiency_target") SELECT "id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at", "batch_size_l", "boil_time_min", "og_target", "fg_target", "abv_estimated", "ibu_target", "ebc_target", "efficiency_target" FROM "recipes"`,
    );
    await queryRunner.query(`DROP TABLE "recipes"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_recipes" RENAME TO "recipes"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79a3d5be8267dbe740bb860da6" ON "recipes" ("root_recipe_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6f21b05a0f89abd1faddbc537" ON "recipes" ("visibility") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_71bb8421d7219197f9e8150342" ON "recipes" ("owner_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_38ada029d0ae403b4d552c8852"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_recipe_steps" ("recipe_id" varchar NOT NULL, "step_order" integer NOT NULL, "type" varchar CHECK( "type" IN ('mash','boil','whirlpool','fermentation','packaging') ) NOT NULL, "label" varchar(200) NOT NULL, "description" text, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), PRIMARY KEY ("recipe_id", "step_order"))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_recipe_steps"("recipe_id", "step_order", "type", "label", "description", "created_at", "updated_at") SELECT "recipe_id", "step_order", "type", "label", "description", "created_at", "updated_at" FROM "recipe_steps"`,
    );
    await queryRunner.query(`DROP TABLE "recipe_steps"`);
    await queryRunner.query(
      `ALTER TABLE "temporary_recipe_steps" RENAME TO "recipe_steps"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_38ada029d0ae403b4d552c8852" ON "recipe_steps" ("recipe_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"`);
    await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_users" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar(255) NOT NULL, "username" varchar(100) NOT NULL, "password_hash" varchar(255) NOT NULL, "first_name" varchar(255), "last_name" varchar(255), "role" varchar CHECK( "role" IN ('admin','user','moderator') ) NOT NULL DEFAULT ('user'), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "is_active" boolean NOT NULL DEFAULT (1))`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_users"("id", "email", "username", "password_hash", "first_name", "last_name", "role", "created_at", "updated_at", "is_active") SELECT "id", "email", "username", "password_hash", "first_name", "last_name", "role", "created_at", "updated_at", "is_active" FROM "users"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`ALTER TABLE "temporary_users" RENAME TO "users"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP INDEX "IDX_fe0bb3f6520ee0469504521e71"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "temporary_users"`);
    await queryRunner.query(
      `CREATE TABLE "users" ("id" varchar PRIMARY KEY NOT NULL, "email" varchar(255) NOT NULL, "username" varchar(100) NOT NULL, "password_hash" varchar(255) NOT NULL, "first_name" varchar(255), "last_name" varchar(255), "role" varchar CHECK( "role" IN ('admin','user','moderator') ) NOT NULL DEFAULT ('user'), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "is_active" boolean NOT NULL DEFAULT (1))`,
    );
    await queryRunner.query(
      `INSERT INTO "users"("id", "email", "username", "password_hash", "first_name", "last_name", "role", "created_at", "updated_at", "is_active") SELECT "id", "email", "username", "password_hash", "first_name", "last_name", "role", "created_at", "updated_at", "is_active" FROM "temporary_users"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_users"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_38ada029d0ae403b4d552c8852"`);
    await queryRunner.query(
      `ALTER TABLE "recipe_steps" RENAME TO "temporary_recipe_steps"`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipe_steps" ("recipe_id" varchar NOT NULL, "step_order" integer NOT NULL, "type" varchar CHECK( "type" IN ('mash','boil','whirlpool','fermentation','packaging') ) NOT NULL, "label" varchar(200) NOT NULL, "description" text, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), PRIMARY KEY ("recipe_id", "step_order"))`,
    );
    await queryRunner.query(
      `INSERT INTO "recipe_steps"("recipe_id", "step_order", "type", "label", "description", "created_at", "updated_at") SELECT "recipe_id", "step_order", "type", "label", "description", "created_at", "updated_at" FROM "temporary_recipe_steps"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_recipe_steps"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_38ada029d0ae403b4d552c8852" ON "recipe_steps" ("recipe_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_71bb8421d7219197f9e8150342"`);
    await queryRunner.query(`DROP INDEX "IDX_a6f21b05a0f89abd1faddbc537"`);
    await queryRunner.query(`DROP INDEX "IDX_79a3d5be8267dbe740bb860da6"`);
    await queryRunner.query(
      `ALTER TABLE "recipes" RENAME TO "temporary_recipes"`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipes" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "name" varchar(200) NOT NULL, "description" text, "visibility" varchar CHECK( "visibility" IN ('private','unlisted','public') ) NOT NULL DEFAULT ('private'), "version" integer NOT NULL DEFAULT (1), "root_recipe_id" varchar(36) NOT NULL, "parent_recipe_id" varchar(36), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "batch_size_l" real, "boil_time_min" integer, "og_target" real, "fg_target" real, "abv_estimated" real, "ibu_target" real, "ebc_target" real, "efficiency_target" real)`,
    );
    await queryRunner.query(
      `INSERT INTO "recipes"("id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at", "batch_size_l", "boil_time_min", "og_target", "fg_target", "abv_estimated", "ibu_target", "ebc_target", "efficiency_target") SELECT "id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at", "batch_size_l", "boil_time_min", "og_target", "fg_target", "abv_estimated", "ibu_target", "ebc_target", "efficiency_target" FROM "temporary_recipes"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_recipes"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_71bb8421d7219197f9e8150342" ON "recipes" ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6f21b05a0f89abd1faddbc537" ON "recipes" ("visibility") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79a3d5be8267dbe740bb860da6" ON "recipes" ("root_recipe_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_c96103c0a53fef2d6883336870"`);
    await queryRunner.query(
      `ALTER TABLE "equipment_profiles" RENAME TO "temporary_equipment_profiles"`,
    );
    await queryRunner.query(
      `CREATE TABLE "equipment_profiles" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "name" varchar(120) NOT NULL, "mash_tun_volume_l" real NOT NULL, "boil_kettle_volume_l" real NOT NULL, "fermenter_volume_l" real NOT NULL, "trub_loss_l" real NOT NULL DEFAULT (0), "dead_space_loss_l" real NOT NULL DEFAULT (0), "transfer_loss_l" real NOT NULL DEFAULT (0), "evaporation_rate_l_per_hour" real NOT NULL, "efficiency_estimated_percent" real NOT NULL, "efficiency_measured_percent" real, "cooling_time_minutes" integer, "cooling_flow_rate_l_per_minute" real, "system_type" varchar CHECK( "system_type" IN ('extract','all-grain','all-in-one') ) NOT NULL, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "equipment_profiles"("id", "owner_id", "name", "mash_tun_volume_l", "boil_kettle_volume_l", "fermenter_volume_l", "trub_loss_l", "dead_space_loss_l", "transfer_loss_l", "evaporation_rate_l_per_hour", "efficiency_estimated_percent", "efficiency_measured_percent", "cooling_time_minutes", "cooling_flow_rate_l_per_minute", "system_type", "created_at", "updated_at") SELECT "id", "owner_id", "name", "mash_tun_volume_l", "boil_kettle_volume_l", "fermenter_volume_l", "trub_loss_l", "dead_space_loss_l", "transfer_loss_l", "evaporation_rate_l_per_hour", "efficiency_estimated_percent", "efficiency_measured_percent", "cooling_time_minutes", "cooling_flow_rate_l_per_minute", "system_type", "created_at", "updated_at" FROM "temporary_equipment_profiles"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_equipment_profiles"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c96103c0a53fef2d6883336870" ON "equipment_profiles" ("owner_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_b51578dec853e3c5bd445880ab"`);
    await queryRunner.query(
      `ALTER TABLE "batch_steps" RENAME TO "temporary_batch_steps"`,
    );
    await queryRunner.query(
      `CREATE TABLE "batch_steps" ("batch_id" varchar NOT NULL, "step_order" integer NOT NULL, "type" varchar CHECK( "type" IN ('mash','boil','whirlpool','fermentation','packaging') ) NOT NULL, "label" varchar(200) NOT NULL, "description" text, "status" varchar CHECK( "status" IN ('pending','in_progress','completed') ) NOT NULL, "started_at" datetime, "completed_at" datetime, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), PRIMARY KEY ("batch_id", "step_order"))`,
    );
    await queryRunner.query(
      `INSERT INTO "batch_steps"("batch_id", "step_order", "type", "label", "description", "status", "started_at", "completed_at", "created_at", "updated_at") SELECT "batch_id", "step_order", "type", "label", "description", "status", "started_at", "completed_at", "created_at", "updated_at" FROM "temporary_batch_steps"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_batch_steps"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_b51578dec853e3c5bd445880ab" ON "batch_steps" ("batch_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_fd9e8a338b145095bef31195fe"`);
    await queryRunner.query(
      `ALTER TABLE "batch_reminders" RENAME TO "temporary_batch_reminders"`,
    );
    await queryRunner.query(
      `CREATE TABLE "batch_reminders" ("id" varchar PRIMARY KEY NOT NULL, "batch_id" varchar(36) NOT NULL, "label" varchar(200) NOT NULL, "due_at" datetime NOT NULL, "status" varchar CHECK( "status" IN ('pending','done','canceled') ) NOT NULL DEFAULT ('pending'), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "batch_reminders"("id", "batch_id", "label", "due_at", "status", "created_at", "updated_at") SELECT "id", "batch_id", "label", "due_at", "status", "created_at", "updated_at" FROM "temporary_batch_reminders"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_batch_reminders"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_fd9e8a338b145095bef31195fe" ON "batch_reminders" ("batch_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_7b1ba5e79c27dbc3a3a687dbbb"`);
    await queryRunner.query(`DROP INDEX "IDX_46fd842e6d23ce5ef2d68fcd2c"`);
    await queryRunner.query(
      `ALTER TABLE "batches" RENAME TO "temporary_batches"`,
    );
    await queryRunner.query(
      `CREATE TABLE "batches" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "recipe_id" varchar(36) NOT NULL, "status" varchar CHECK( "status" IN ('in_progress','completed') ) NOT NULL DEFAULT ('in_progress'), "current_step_order" integer, "started_at" datetime NOT NULL, "fermentation_started_at" datetime, "fermentation_completed_at" datetime, "completed_at" datetime, "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "batches"("id", "owner_id", "recipe_id", "status", "current_step_order", "started_at", "fermentation_started_at", "fermentation_completed_at", "completed_at", "created_at", "updated_at") SELECT "id", "owner_id", "recipe_id", "status", "current_step_order", "started_at", "fermentation_started_at", "fermentation_completed_at", "completed_at", "created_at", "updated_at" FROM "temporary_batches"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_batches"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_7b1ba5e79c27dbc3a3a687dbbb" ON "batches" ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46fd842e6d23ce5ef2d68fcd2c" ON "batches" ("recipe_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_71bb8421d7219197f9e8150342"`);
    await queryRunner.query(`DROP INDEX "IDX_a6f21b05a0f89abd1faddbc537"`);
    await queryRunner.query(`DROP INDEX "IDX_79a3d5be8267dbe740bb860da6"`);
    await queryRunner.query(
      `ALTER TABLE "recipes" RENAME TO "temporary_recipes"`,
    );
    await queryRunner.query(
      `CREATE TABLE "recipes" ("id" varchar PRIMARY KEY NOT NULL, "owner_id" varchar(36) NOT NULL, "name" varchar(200) NOT NULL, "description" text, "visibility" varchar CHECK( "visibility" IN ('private','unlisted','public') ) NOT NULL DEFAULT ('private'), "version" integer NOT NULL DEFAULT (1), "root_recipe_id" varchar(36) NOT NULL, "parent_recipe_id" varchar(36), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`,
    );
    await queryRunner.query(
      `INSERT INTO "recipes"("id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at") SELECT "id", "owner_id", "name", "description", "visibility", "version", "root_recipe_id", "parent_recipe_id", "created_at", "updated_at" FROM "temporary_recipes"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_recipes"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_71bb8421d7219197f9e8150342" ON "recipes" ("owner_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a6f21b05a0f89abd1faddbc537" ON "recipes" ("visibility") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_79a3d5be8267dbe740bb860da6" ON "recipes" ("root_recipe_id") `,
    );
    await queryRunner.query(`DROP INDEX "IDX_e41a51e5dec16326f05cfe0892"`);
    await queryRunner.query(`DROP TABLE "recipe_yeasts"`);
    await queryRunner.query(`DROP INDEX "IDX_9c6840be912ab6842871a478a3"`);
    await queryRunner.query(`DROP TABLE "recipe_water"`);
    await queryRunner.query(`DROP INDEX "IDX_264a7622b6e0804a1c7c6b40c3"`);
    await queryRunner.query(`DROP TABLE "recipe_hops"`);
    await queryRunner.query(`DROP INDEX "IDX_9c4fd52b02273dc5eff215c343"`);
    await queryRunner.query(`DROP TABLE "recipe_fermentables"`);
    await queryRunner.query(`DROP INDEX "IDX_f599a546aee18f976f355f1697"`);
    await queryRunner.query(`DROP TABLE "recipe_additives"`);
  }
}

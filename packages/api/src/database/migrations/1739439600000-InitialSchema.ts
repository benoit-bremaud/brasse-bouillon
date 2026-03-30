import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1739439600000 implements MigrationInterface {
  name = 'InitialSchema1739439600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(`
      CREATE TABLE "users" (
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
        CONSTRAINT "CHK_users_role" CHECK ("role" IN ('admin', 'user', 'moderator'))
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email_unique" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_username_unique" ON "users" ("username")`,
    );

    await queryRunner.query(`
      CREATE TABLE "equipment_profiles" (
        "id" varchar PRIMARY KEY NOT NULL,
        "owner_id" varchar(36) NOT NULL,
        "name" varchar(120) NOT NULL,
        "mash_tun_volume_l" real NOT NULL,
        "boil_kettle_volume_l" real NOT NULL,
        "fermenter_volume_l" real NOT NULL,
        "trub_loss_l" real NOT NULL DEFAULT (0),
        "dead_space_loss_l" real NOT NULL DEFAULT (0),
        "transfer_loss_l" real NOT NULL DEFAULT (0),
        "evaporation_rate_l_per_hour" real NOT NULL,
        "efficiency_estimated_percent" real NOT NULL,
        "efficiency_measured_percent" real,
        "cooling_time_minutes" integer,
        "cooling_flow_rate_l_per_minute" real,
        "system_type" varchar(20) NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_equipment_profiles_system_type" CHECK ("system_type" IN ('extract', 'all-grain', 'all-in-one')),
        CONSTRAINT "FK_equipment_profiles_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_equipment_profiles_owner_id" ON "equipment_profiles" ("owner_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipes" (
        "id" varchar PRIMARY KEY NOT NULL,
        "owner_id" varchar(36) NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text,
        "visibility" varchar(20) NOT NULL DEFAULT ('private'),
        "version" integer NOT NULL DEFAULT (1),
        "root_recipe_id" varchar(36) NOT NULL,
        "parent_recipe_id" varchar(36),
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_recipes_visibility" CHECK ("visibility" IN ('private', 'unlisted', 'public')),
        CONSTRAINT "FK_recipes_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_recipes_root_recipe_id" FOREIGN KEY ("root_recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_recipes_parent_recipe_id" FOREIGN KEY ("parent_recipe_id") REFERENCES "recipes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_owner_id" ON "recipes" ("owner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_visibility" ON "recipes" ("visibility")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_recipes_root_recipe_id" ON "recipes" ("root_recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "recipe_steps" (
        "recipe_id" varchar NOT NULL,
        "step_order" integer NOT NULL,
        "type" varchar(20) NOT NULL,
        "label" varchar(200) NOT NULL,
        "description" text,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        PRIMARY KEY ("recipe_id", "step_order"),
        CONSTRAINT "CHK_recipe_steps_type" CHECK ("type" IN ('mash', 'boil', 'whirlpool', 'fermentation', 'packaging')),
        CONSTRAINT "FK_recipe_steps_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_recipe_steps_recipe_id" ON "recipe_steps" ("recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "batches" (
        "id" varchar PRIMARY KEY NOT NULL,
        "owner_id" varchar(36) NOT NULL,
        "recipe_id" varchar(36) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT ('in_progress'),
        "current_step_order" integer,
        "started_at" datetime NOT NULL,
        "fermentation_started_at" datetime,
        "fermentation_completed_at" datetime,
        "completed_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_batches_status" CHECK ("status" IN ('in_progress', 'completed')),
        CONSTRAINT "FK_batches_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_batches_recipe_id" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_batches_owner_id" ON "batches" ("owner_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_batches_recipe_id" ON "batches" ("recipe_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "batch_steps" (
        "batch_id" varchar NOT NULL,
        "step_order" integer NOT NULL,
        "type" varchar(20) NOT NULL,
        "label" varchar(200) NOT NULL,
        "description" text,
        "status" varchar(20) NOT NULL,
        "started_at" datetime,
        "completed_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        PRIMARY KEY ("batch_id", "step_order"),
        CONSTRAINT "CHK_batch_steps_type" CHECK ("type" IN ('mash', 'boil', 'whirlpool', 'fermentation', 'packaging')),
        CONSTRAINT "CHK_batch_steps_status" CHECK ("status" IN ('pending', 'in_progress', 'completed')),
        CONSTRAINT "FK_batch_steps_batch_id" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_batch_steps_batch_id" ON "batch_steps" ("batch_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "batch_reminders" (
        "id" varchar PRIMARY KEY NOT NULL,
        "batch_id" varchar(36) NOT NULL,
        "label" varchar(200) NOT NULL,
        "due_at" datetime NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT ('pending'),
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_batch_reminders_status" CHECK ("status" IN ('pending', 'done', 'canceled')),
        CONSTRAINT "FK_batch_reminders_batch_id" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_batch_reminders_batch_id" ON "batch_reminders" ("batch_id")`,
    );

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(`DROP INDEX "IDX_batch_reminders_batch_id"`);
    await queryRunner.query(`DROP TABLE "batch_reminders"`);

    await queryRunner.query(`DROP INDEX "IDX_batch_steps_batch_id"`);
    await queryRunner.query(`DROP TABLE "batch_steps"`);

    await queryRunner.query(`DROP INDEX "IDX_batches_recipe_id"`);
    await queryRunner.query(`DROP INDEX "IDX_batches_owner_id"`);
    await queryRunner.query(`DROP TABLE "batches"`);

    await queryRunner.query(`DROP INDEX "IDX_recipe_steps_recipe_id"`);
    await queryRunner.query(`DROP TABLE "recipe_steps"`);

    await queryRunner.query(`DROP INDEX "IDX_recipes_root_recipe_id"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_visibility"`);
    await queryRunner.query(`DROP INDEX "IDX_recipes_owner_id"`);
    await queryRunner.query(`DROP TABLE "recipes"`);

    await queryRunner.query(`DROP INDEX "IDX_equipment_profiles_owner_id"`);
    await queryRunner.query(`DROP TABLE "equipment_profiles"`);

    await queryRunner.query(`DROP INDEX "IDX_users_username_unique"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email_unique"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }
}

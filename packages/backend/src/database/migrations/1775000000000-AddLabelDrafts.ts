import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLabelDrafts1775000000000 implements MigrationInterface {
  name = 'AddLabelDrafts1775000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(`
      CREATE TABLE "label_drafts" (
        "id" varchar PRIMARY KEY NOT NULL,
        "owner_id" varchar(36) NOT NULL,
        "batch_id" varchar(36) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT ('draft'),
        "bottle_format" varchar(40) NOT NULL,
        "template_id" varchar(40) NOT NULL,
        "editable_fields" text NOT NULL,
        "preview_snapshot" text,
        "version" integer NOT NULL DEFAULT (1),
        "deleted_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_label_drafts_status" CHECK ("status" IN ('draft', 'archived')),
        CONSTRAINT "CHK_label_drafts_bottle_format" CHECK ("bottle_format" IN ('33cl_long_neck', '75cl_champenoise', '44cl_can')),
        CONSTRAINT "CHK_label_drafts_template_id" CHECK ("template_id" IN ('template_1', 'template_2', 'template_3')),
        CONSTRAINT "FK_label_drafts_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_label_drafts_batch_id" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_label_drafts_owner_updated_at" ON "label_drafts" ("owner_id", "updated_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_label_drafts_owner_status" ON "label_drafts" ("owner_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_label_drafts_batch_id" ON "label_drafts" ("batch_id")`,
    );

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(`DROP INDEX "IDX_label_drafts_batch_id"`);
    await queryRunner.query(`DROP INDEX "IDX_label_drafts_owner_status"`);
    await queryRunner.query(`DROP INDEX "IDX_label_drafts_owner_updated_at"`);
    await queryRunner.query(`DROP TABLE "label_drafts"`);

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }
}

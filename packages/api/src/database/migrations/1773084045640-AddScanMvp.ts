import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScanMvp1773084045640 implements MigrationInterface {
  name = 'AddScanMvp1773084045640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(`
      CREATE TABLE "scan_catalog_items" (
        "id" varchar PRIMARY KEY NOT NULL,
        "barcode" varchar(32) NOT NULL,
        "name" varchar(200) NOT NULL,
        "brewery" varchar(160) NOT NULL,
        "style" varchar(120) NOT NULL,
        "abv" real,
        "ibu" real,
        "color_ebc" real,
        "fermentation_type" varchar(20) NOT NULL DEFAULT ('unknown'),
        "aromatic_tags" text,
        "notes_source" text,
        "is_abv_estimated" boolean NOT NULL DEFAULT (0),
        "is_ibu_estimated" boolean NOT NULL DEFAULT (0),
        "is_color_ebc_estimated" boolean NOT NULL DEFAULT (0),
        "is_style_estimated" boolean NOT NULL DEFAULT (0),
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_scan_catalog_items_fermentation_type" CHECK (
          "fermentation_type" IN ('ale', 'lager', 'hybrid', 'wild', 'unknown')
        )
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_scan_catalog_items_barcode" ON "scan_catalog_items" ("barcode")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_scan_catalog_items_name" ON "scan_catalog_items" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_scan_catalog_items_style" ON "scan_catalog_items" ("style")`,
    );

    await queryRunner.query(`
      CREATE TABLE "scan_requests" (
        "id" varchar PRIMARY KEY NOT NULL,
        "owner_id" varchar(36) NOT NULL,
        "barcode" varchar(32) NOT NULL,
        "status" varchar(32) NOT NULL,
        "idempotency_key" varchar(128) NOT NULL,
        "idempotency_response" text NOT NULL,
        "consent_ai_training" boolean NOT NULL DEFAULT (0),
        "retention_until" datetime NOT NULL,
        "catalog_item_id" varchar(36),
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_scan_requests_status" CHECK (
          "status" IN (
            'matched',
            'unknown_barcode',
            'needs_human_review',
            'resolved',
            'not_found'
          )
        ),
        CONSTRAINT "FK_scan_requests_owner_id" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_scan_requests_catalog_item_id" FOREIGN KEY ("catalog_item_id") REFERENCES "scan_catalog_items" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_scan_requests_owner_created_at" ON "scan_requests" ("owner_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_scan_requests_owner_status" ON "scan_requests" ("owner_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_scan_requests_barcode" ON "scan_requests" ("barcode")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_scan_requests_owner_idempotency_key" ON "scan_requests" ("owner_id", "idempotency_key")`,
    );

    await queryRunner.query(`
      CREATE TABLE "scan_label_images" (
        "id" varchar PRIMARY KEY NOT NULL,
        "scan_request_id" varchar(36) NOT NULL,
        "face" varchar(10) NOT NULL,
        "file_path" varchar(512) NOT NULL,
        "mime_type" varchar(32) NOT NULL,
        "size_bytes" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_scan_label_images_face" CHECK ("face" IN ('front', 'back')),
        CONSTRAINT "FK_scan_label_images_scan_request_id" FOREIGN KEY ("scan_request_id") REFERENCES "scan_requests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_scan_label_images_scan_request_id" ON "scan_label_images" ("scan_request_id")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_scan_label_images_scan_request_id_face" ON "scan_label_images" ("scan_request_id", "face")`,
    );

    await queryRunner.query(`
      CREATE TABLE "scan_review_queue" (
        "id" varchar PRIMARY KEY NOT NULL,
        "scan_request_id" varchar(36) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT ('pending'),
        "internal_note" text,
        "reviewed_by" varchar(36),
        "reviewed_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_scan_review_queue_status" CHECK (
          "status" IN ('pending', 'resolved', 'not_found')
        ),
        CONSTRAINT "FK_scan_review_queue_scan_request_id" FOREIGN KEY ("scan_request_id") REFERENCES "scan_requests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_scan_review_queue_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_scan_review_queue_scan_request_id" ON "scan_review_queue" ("scan_request_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_scan_review_queue_status_created_at" ON "scan_review_queue" ("status", "created_at")`,
    );

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = OFF`);

    await queryRunner.query(
      `DROP INDEX "IDX_scan_review_queue_status_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "UQ_scan_review_queue_scan_request_id"`,
    );
    await queryRunner.query(`DROP TABLE "scan_review_queue"`);

    await queryRunner.query(
      `DROP INDEX "UQ_scan_label_images_scan_request_id_face"`,
    );
    await queryRunner.query(
      `DROP INDEX "IDX_scan_label_images_scan_request_id"`,
    );
    await queryRunner.query(`DROP TABLE "scan_label_images"`);

    await queryRunner.query(
      `DROP INDEX "UQ_scan_requests_owner_idempotency_key"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_scan_requests_barcode"`);
    await queryRunner.query(`DROP INDEX "IDX_scan_requests_owner_status"`);
    await queryRunner.query(`DROP INDEX "IDX_scan_requests_owner_created_at"`);
    await queryRunner.query(`DROP TABLE "scan_requests"`);

    await queryRunner.query(`DROP INDEX "IDX_scan_catalog_items_style"`);
    await queryRunner.query(`DROP INDEX "IDX_scan_catalog_items_name"`);
    await queryRunner.query(`DROP INDEX "UQ_scan_catalog_items_barcode"`);
    await queryRunner.query(`DROP TABLE "scan_catalog_items"`);

    await queryRunner.query(`PRAGMA foreign_keys = ON`);
  }
}

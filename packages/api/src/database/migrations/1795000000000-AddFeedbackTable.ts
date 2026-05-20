import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `feedback` table (epic #1026, C2 / #1027).
 *
 * One row per submitted piece of feedback from the website widget or
 * the mobile app, mirroring the `feedback-widget` `FeedbackPayload`
 * wire contract plus a server-side `created_at`. No backend consent
 * column at v0.1 — consent is client-side per ADR-0003.
 *
 * Indexes on `project_id` (filter by source surface) and `created_at`
 * (chronological triage) anticipate the future maintainer review
 * screen; both are low-cardinality-safe at v0.1 volumes.
 */
export class AddFeedbackTable1795000000000 implements MigrationInterface {
  name = 'AddFeedbackTable1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "feedback" (
        "id" varchar PRIMARY KEY NOT NULL,
        "project_id" varchar(100) NOT NULL,
        "category" varchar(20) NOT NULL,
        "sub_category" varchar(40),
        "message" text NOT NULL,
        "url" varchar(2048) NOT NULL,
        "referrer" varchar(2048),
        "user_agent" varchar(512) NOT NULL,
        "viewport_w" integer NOT NULL,
        "viewport_h" integer NOT NULL,
        "locale" varchar(20) NOT NULL,
        "client_timestamp" datetime NOT NULL,
        "widget_version" varchar(40) NOT NULL,
        "scroll_depth" float NOT NULL,
        "session_id" varchar(128) NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_feedback_project_id" ON "feedback" ("project_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_feedback_created_at" ON "feedback" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_feedback_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_feedback_project_id"`);
    await queryRunner.query(`DROP TABLE "feedback"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Creates the `batch_alerts` table (#605 slice 3, epic #595).
 *
 * Alerts raised on a batch — an overdue step or a measurement crossing a
 * threshold. Belongs to a batch (`batch_id`, FK CASCADE like batch_steps);
 * `step_order` optionally pins it to a step; `dismissed_at` is set on
 * acknowledgement. SQLite-friendly: `varchar` + CHECK for the trigger/severity
 * enums, `text` message, `datetime` timestamps. Indexed on `batch_id`.
 */
export class AddBatchAlertsTable1798000000000 implements MigrationInterface {
  name = 'AddBatchAlertsTable1798000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "batch_alerts" (
        "id" varchar PRIMARY KEY NOT NULL,
        "batch_id" varchar NOT NULL,
        "step_order" integer,
        "trigger" varchar(20) NOT NULL,
        "severity" varchar(20) NOT NULL,
        "message" text,
        "triggered_at" datetime NOT NULL,
        "dismissed_at" datetime,
        "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
        CONSTRAINT "CHK_batch_alerts_trigger" CHECK ("trigger" IN ('overdue', 'threshold')),
        CONSTRAINT "CHK_batch_alerts_severity" CHECK ("severity" IN ('info', 'warning', 'critical')),
        CONSTRAINT "FK_batch_alerts_batch_id" FOREIGN KEY ("batch_id") REFERENCES "batches" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_batch_alerts_batch_id" ON "batch_alerts" ("batch_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_batch_alerts_batch_id"`);
    await queryRunner.query(`DROP TABLE "batch_alerts"`);
  }
}

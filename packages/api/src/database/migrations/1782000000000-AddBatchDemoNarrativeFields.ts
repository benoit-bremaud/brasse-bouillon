import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the minimum-viable narrative + metric columns to `batches`
 * so a brassin can carry a human-friendly title, free-text notes,
 * the basic volume reality (target vs final), and the brewing-day
 * gravity / ABV trio (Issue #782 — pre-seed Punk IPA brassin demo,
 * minimal+ version validated through the 8-axis data model Q&A on
 * 2026-04-30).
 *
 * Decisions per axis (KISS for blanche, rich variants deferred to
 * the v0.2/v0.3 backlog issues #808-#814):
 *
 * - Axis 1 (identity)        → name + notes
 * - Axis 2 (volumes)         → target_volume_l + final_volume_l
 * - Axis 3 (gravity + ABV)   → og_actual + fg_actual + abv_actual
 * - Axis 4 (intermediate measurements) → none — see #811
 * - Axis 5 (observations)    → notes covers it for v0.1 — see #812
 * - Axis 6 (steps)           → seeds 9 BatchStep rows, no schema change
 * - Axis 7 (alerts)          → none — see #814
 * - Axis 8 (photos)          → none — see #808
 *
 * All columns are nullable: pre-existing batches predate this
 * scope, and we don't want to force-fill arbitrary defaults during
 * the migration. New brassins (v0.1+) start populating these as
 * the brewer fills the form.
 *
 * Type rationale: aligned with the existing `recipes.og_target` /
 * `recipes.fg_target` convention which uses SQLite `real`
 * (double-precision floating-point). FP64 has ample headroom for
 * brewing precision — gravity 1.057 vs 1.058 is nowhere near the
 * representation limit. Decimal types are reserved for monetary
 * values; brewing metrics use real.
 */
// Columns added in this migration, in their semantic creation order
// (down migration drops them in reverse). Keeping the list as a
// shared constant lets the up / down methods iterate instead of
// repeating 7 verbatim ALTER statements each.
const COLUMNS: ReadonlyArray<{ name: string; sqlType: string }> = [
  { name: 'name', sqlType: 'varchar(120)' },
  { name: 'notes', sqlType: 'text' },
  { name: 'target_volume_l', sqlType: 'real' },
  { name: 'final_volume_l', sqlType: 'real' },
  { name: 'og_actual', sqlType: 'real' },
  { name: 'fg_actual', sqlType: 'real' },
  { name: 'abv_actual', sqlType: 'real' },
];

export class AddBatchDemoNarrativeFields1782000000000 implements MigrationInterface {
  name = 'AddBatchDemoNarrativeFields1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const col of COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE "batches" ADD COLUMN "${col.name}" ${col.sqlType}`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const col of [...COLUMNS].reverse()) {
      await queryRunner.query(
        `ALTER TABLE "batches" DROP COLUMN "${col.name}"`,
      );
    }
  }
}

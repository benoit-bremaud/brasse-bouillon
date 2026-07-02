import { BatchStatus } from '../domain/enums/batch-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('batches')
@Index(['owner_id'])
@Index(['recipe_id'])
// DB backstop for prepareMine's idempotency: at most ONE unlaunched draft per
// owner+recipe, even under concurrent prepare calls (the read-then-insert in
// the service cannot see a row another request has not committed yet).
@Index('idx_batches_one_draft_per_owner_recipe', ['owner_id', 'recipe_id'], {
  unique: true,
  where: '"launched_at" IS NULL',
})
export class BatchOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  owner_id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  recipe_id: string;

  // Issue #782 minimal++ — narrative + metric fields kept on the row
  // itself so the brassin carries the basics expected by the demo
  // story (title, free-text recap, target vs final volume, OG/FG/ABV
  // trio) independently of the linked recipe. All nullable so
  // legacy rows don't need backfill. Richer per-stage volumes,
  // measurements, observations, and step transitions live in the
  // v0.2/v0.3 backlog (#808-#814).
  @Column({ type: 'varchar', length: 120, nullable: true })
  name?: string | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ type: 'real', nullable: true })
  target_volume_l?: number | null;

  @Column({ type: 'real', nullable: true })
  final_volume_l?: number | null;

  @Column({ type: 'real', nullable: true })
  og_actual?: number | null;

  @Column({ type: 'real', nullable: true })
  fg_actual?: number | null;

  @Column({ type: 'real', nullable: true })
  abv_actual?: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: BatchStatus,
    nullable: false,
    default: BatchStatus.IN_PROGRESS,
  })
  status: BatchStatus;

  @Column({ type: 'integer', nullable: true })
  current_step_order?: number | null;

  @Column({ type: 'datetime', nullable: false })
  started_at: Date;

  @Column({ type: 'datetime', nullable: true })
  fermentation_started_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  fermentation_completed_at?: Date | null;

  // B3 — timestamp set when the batch is bottled/closed. Mirrors
  // `fermentation_completed_at`; the batch status stays COMPLETED (no new
  // BOTTLED state — see 05-state-batch-closure.md). Nullable so legacy rows
  // and not-yet-bottled batches don't need backfill.
  @Column({ type: 'datetime', nullable: true })
  bottled_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completed_at?: Date | null;

  // Soft lifecycle timestamps (brew-day/07). The `status` column stays the
  // brewing lifecycle (in_progress/completed); these nullable stamps carry the
  // reversibility states so no CHECK-constraint rebuild is needed. `cancelled_at`
  // = a launched brew the brewer stopped (F16, keeps the journal); `archived_at`
  // = a finished/cancelled brew hidden from the active list (F25). The effective
  // status is derived (archived > cancelled > status) — see deriveEffectiveStatus.
  @Column({ type: 'datetime', nullable: true })
  cancelled_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  archived_at?: Date | null;

  // Draft lifecycle (brew-day/07 F14/F15). `launched_at` null = an « en
  // préparation » draft created by "Préparer": it carries the prep and has no
  // steps yet; Launch stamps it (and refreshes `started_at`, which the CHECK-
  // constrained schema keeps NOT NULL as the row-creation instant until then).
  // Same additive-timestamp model as cancelled_at/archived_at — the effective
  // status is derived, no `status` CHECK rebuild. Legacy rows are backfilled
  // launched_at = started_at (they were all launched at creation).
  @Column({ type: 'datetime', nullable: true })
  launched_at?: Date | null;

  // Prep-checklist state carried by the draft (F14: per-batch, resets each
  // brew). Only the CHECKED item ids are stored — the items themselves stay
  // derived from the recipe (single source of truth); ids from a recipe edited
  // mid-prep simply stop matching (benign, drafts are short-lived).
  @Column({ type: 'simple-json', nullable: true })
  prep_checked_ids?: string[] | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

/**
 * A free-text observation a brewer logs against a batch (#605, slice 2) — the
 * "Notes" section of the Mes Brassins detail (#606). Belongs to a `Batch`;
 * `step_order` optionally pins it to the step it was taken during.
 *
 * SQLite-friendly types: `text` for the note, `simple-array` (stored as a
 * comma-joined `text`) for photo references, `integer` for the optional
 * 1–5 mood score, `datetime` for timestamps.
 */
@Entity('batch_observations')
@Index(['batch_id'])
export class ObservationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  batch_id: string;

  /** Step the note belongs to (nullable — some notes are batch-level). */
  @Column({ type: 'integer', nullable: true })
  step_order?: number | null;

  @Column({ type: 'text', nullable: false })
  free_text: string;

  /** Opaque references to attached photos (storage keys / URIs). */
  @Column({ type: 'simple-array', nullable: true })
  photo_refs?: string[] | null;

  /** Optional subjective 1–5 mood/confidence score for the reading. */
  @Column({ type: 'integer', nullable: true })
  mood_score?: number | null;

  @Column({ type: 'datetime', nullable: false })
  observed_at: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

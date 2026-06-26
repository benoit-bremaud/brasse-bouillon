import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

/**
 * A brewer's first tasting note on a finished batch (B3). The novice rates the
 * beer 1-5 and optionally jots a free note after the batch is closed (bottled).
 *
 * One tasting per batch in v1 (no structured BJCP form yet — deferred). Belongs
 * to a `Batch`; SQLite-friendly column types (`integer`, `text`, `datetime`).
 */
@Entity('batch_tastings')
@Index(['batch_id'], { unique: true })
export class TastingOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  batch_id: string;

  /** 1-5 stars (enforced by the DTO + domain factory). */
  @Column({ type: 'integer', nullable: false })
  rating: number;

  /** Optional free-text tasting note. */
  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

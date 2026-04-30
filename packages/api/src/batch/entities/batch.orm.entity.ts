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

  @Column({ type: 'datetime', nullable: true })
  completed_at?: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

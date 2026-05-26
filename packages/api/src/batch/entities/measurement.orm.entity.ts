import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

import { MeasurementType } from '../domain/enums/measurement-type.enum';

/**
 * A single measurement recorded against a batch (#605) — OG/FG/SG spot,
 * temperature or pH. Belongs to a `Batch` (the aggregate root, per the batches
 * class diagram); `step_order` optionally pins it to the batch step it was
 * taken during (the `batch_steps` row is identified by `batch_id` + `step_order`).
 *
 * SQLite-friendly column types (no JSONB): `real` for the value, `datetime`
 * for timestamps, `varchar` + CHECK for the enum.
 */
@Entity('batch_measurements')
@Index(['batch_id'])
export class MeasurementOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  batch_id: string;

  /** Step the reading belongs to (nullable — some readings are batch-level). */
  @Column({ type: 'integer', nullable: true })
  step_order?: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: MeasurementType,
    nullable: false,
  })
  type: MeasurementType;

  @Column({ type: 'real', nullable: false })
  value: number;

  /** e.g. "°C", "SG", "pH" — free-form, optional. */
  @Column({ type: 'varchar', length: 20, nullable: true })
  unit?: string | null;

  @Column({ type: 'datetime', nullable: false })
  taken_at: Date;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

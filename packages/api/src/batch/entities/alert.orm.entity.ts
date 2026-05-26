import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

import { AlertSeverity } from '../domain/enums/alert-severity.enum';
import { AlertTrigger } from '../domain/enums/alert-trigger.enum';

/**
 * An alert raised on a batch (#605, slice 3) — an overdue step or a measurement
 * crossing a threshold. Belongs to a `Batch`; `step_order` optionally pins it to
 * the step concerned. `dismissed_at` is set once the brewer acknowledges it.
 *
 * SQLite-friendly types: `varchar` + CHECK for the enums, `datetime` for
 * timestamps, `text` for the human message.
 */
@Entity('batch_alerts')
@Index(['batch_id'])
export class AlertOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  batch_id: string;

  @Column({ type: 'integer', nullable: true })
  step_order?: number | null;

  @Column({ type: 'varchar', length: 20, enum: AlertTrigger, nullable: false })
  trigger: AlertTrigger;

  @Column({ type: 'varchar', length: 20, enum: AlertSeverity, nullable: false })
  severity: AlertSeverity;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ type: 'datetime', nullable: false })
  triggered_at: Date;

  /** Set when the brewer acknowledges the alert; null while active. */
  @Column({ type: 'datetime', nullable: true })
  dismissed_at?: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

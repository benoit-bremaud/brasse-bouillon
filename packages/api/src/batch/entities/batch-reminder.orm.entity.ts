import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BatchReminderStatus } from '../domain/enums/batch-reminder-status.enum';

@Entity('batch_reminders')
@Index(['batch_id'])
export class BatchReminderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  batch_id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  label: string;

  @Column({ type: 'datetime', nullable: false })
  due_at: Date;

  @Column({
    type: 'varchar',
    length: 20,
    enum: BatchReminderStatus,
    nullable: false,
    default: BatchReminderStatus.PENDING,
  })
  status: BatchReminderStatus;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

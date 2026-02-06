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

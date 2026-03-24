import { RecipeStepType } from '../../recipe/domain/enums/recipe-step-type.enum';

import { BatchStepStatus } from '../domain/enums/batch-step-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('batch_steps')
@Index(['batch_id'])
export class BatchStepOrmEntity {
  @PrimaryColumn('uuid')
  batch_id: string;

  @PrimaryColumn({ type: 'integer' })
  step_order: number;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeStepType,
    nullable: false,
  })
  type: RecipeStepType;

  @Column({ type: 'varchar', length: 200, nullable: false })
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: BatchStepStatus,
    nullable: false,
  })
  status: BatchStepStatus;

  @Column({ type: 'datetime', nullable: true })
  started_at?: Date | null;

  @Column({ type: 'datetime', nullable: true })
  completed_at?: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

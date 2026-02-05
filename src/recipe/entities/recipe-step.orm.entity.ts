import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recipe_steps')
@Index(['recipe_id'])
export class RecipeStepOrmEntity {
  @PrimaryColumn('uuid')
  recipe_id: string;

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

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

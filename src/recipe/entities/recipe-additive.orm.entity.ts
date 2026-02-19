import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecipeAdditiveType } from '../domain/enums/recipe-additive-type.enum';
import { RecipeStepType } from '../domain/enums/recipe-step-type.enum';

@Entity('recipe_additives')
@Index(['recipe_id'])
export class RecipeAdditiveOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  recipe_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeAdditiveType,
    nullable: false,
  })
  type: RecipeAdditiveType;

  @Column({ type: 'real', nullable: false })
  amount_g: number;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeStepType,
    nullable: false,
  })
  addition_step: RecipeStepType;

  @Column({ type: 'integer', nullable: true })
  addition_time_min?: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

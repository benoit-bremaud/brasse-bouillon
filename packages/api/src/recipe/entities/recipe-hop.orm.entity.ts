import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecipeHopAdditionStage } from '../domain/enums/recipe-hop-addition-stage.enum';
import { RecipeHopType } from '../domain/enums/recipe-hop-type.enum';

@Entity('recipe_hops')
@Index(['recipe_id'])
export class RecipeHopOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  recipe_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  variety: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeHopType,
    nullable: false,
  })
  type: RecipeHopType;

  @Column({ type: 'real', nullable: false })
  weight_g: number;

  @Column({ type: 'real', nullable: true })
  alpha_acid_percent?: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeHopAdditionStage,
    nullable: false,
  })
  addition_stage: RecipeHopAdditionStage;

  @Column({ type: 'integer', nullable: true })
  addition_time_min?: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

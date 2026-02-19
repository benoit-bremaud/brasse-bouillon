import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';

@Entity('recipes')
@Index(['owner_id'])
@Index(['visibility'])
@Index(['root_recipe_id'])
export class RecipeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  owner_id: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeVisibility,
    nullable: false,
    default: RecipeVisibility.PRIVATE,
  })
  visibility: RecipeVisibility;

  @Column({ type: 'integer', nullable: false, default: 1 })
  version: number;

  @Column({ type: 'varchar', length: 36, nullable: false })
  root_recipe_id: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  parent_recipe_id?: string | null;

  // Brewing metrics and targets
  @Column({ type: 'real', nullable: true })
  batch_size_l?: number | null;

  @Column({ type: 'integer', nullable: true })
  boil_time_min?: number | null;

  @Column({ type: 'real', nullable: true })
  og_target?: number | null;

  @Column({ type: 'real', nullable: true })
  fg_target?: number | null;

  @Column({ type: 'real', nullable: true })
  abv_estimated?: number | null;

  @Column({ type: 'real', nullable: true })
  ibu_target?: number | null;

  @Column({ type: 'real', nullable: true })
  ebc_target?: number | null;

  @Column({ type: 'real', nullable: true })
  efficiency_target?: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

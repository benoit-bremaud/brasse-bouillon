import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecipeYeastType } from '../domain/enums/recipe-yeast-type.enum';

@Entity('recipe_yeasts')
@Index(['recipe_id'])
export class RecipeYeastOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  recipe_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeYeastType,
    nullable: false,
  })
  type: RecipeYeastType;

  @Column({ type: 'real', nullable: false })
  amount_g: number;

  @Column({ type: 'real', nullable: true })
  attenuation_percent?: number | null;

  @Column({ type: 'integer', nullable: true })
  temperature_min_c?: number | null;

  @Column({ type: 'integer', nullable: true })
  temperature_max_c?: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

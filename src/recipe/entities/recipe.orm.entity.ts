import { RecipeVisibility } from '../domain/enums/recipe-visibility.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recipes')
@Index(['owner_id'])
@Index(['visibility'])
@Index(['root_recipe_id'])
export class RecipeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
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

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

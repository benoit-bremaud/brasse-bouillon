import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RecipeFermentableType } from '../domain/enums/recipe-fermentable-type.enum';

@Entity('recipe_fermentables')
@Index(['recipe_id'])
export class RecipeFermentableOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  recipe_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: RecipeFermentableType,
    nullable: false,
  })
  type: RecipeFermentableType;

  @Column({ type: 'real', nullable: false })
  weight_g: number;

  @Column({ type: 'real', nullable: true })
  potential_gravity?: number | null;

  @Column({ type: 'real', nullable: true })
  color_ebc?: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

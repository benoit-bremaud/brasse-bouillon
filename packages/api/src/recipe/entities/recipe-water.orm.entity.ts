import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recipe_water')
@Index(['recipe_id'])
export class RecipeWaterOrmEntity {
  @PrimaryColumn('varchar', { length: 36 })
  recipe_id: string;

  @Column({ type: 'real', nullable: false })
  mash_volume_l: number;

  @Column({ type: 'real', nullable: false })
  sparge_volume_l: number;

  @Column({ type: 'integer', nullable: true })
  mash_temperature_c?: number | null;

  @Column({ type: 'integer', nullable: true })
  sparge_temperature_c?: number | null;

  @Column({ type: 'real', nullable: true })
  calcium_ppm?: number | null;

  @Column({ type: 'real', nullable: true })
  magnesium_ppm?: number | null;

  @Column({ type: 'real', nullable: true })
  sulfate_ppm?: number | null;

  @Column({ type: 'real', nullable: true })
  chloride_ppm?: number | null;

  @Column({ type: 'real', nullable: true })
  ph_target?: number | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

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
@Index(['is_official'])
@Index(['brew_count'])
@Index(['last_brewed_at'])
@Index(['imported_from_recipe_id'])
@Index(['style'])
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

  // Quality fields feeding the scan matching algorithm (Epic #693 part 2).
  // Denormalized aggregates + flag maintained by the recipe / batch / rating
  // pipelines; consumed by the matching score (see scan-2026-04-24.md §3).
  @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
  avg_rating?: number | null;

  @Column({ type: 'integer', nullable: false, default: 0 })
  brew_count: number;

  @Column({ type: 'datetime', nullable: true })
  last_brewed_at?: Date | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_official: boolean;

  // BJCP-flavoured style tag fed to the scan matching algorithm
  // (Issue #699). Nullable because pre-existing user recipes have no
  // style and the matching service degrades gracefully.
  @Column({ type: 'varchar', length: 120, nullable: true })
  style?: string | null;

  // Import provenance fields (Issue #601). Populated when a user imports
  // a community recipe via POST /recipes/import-from-community/:id.
  // Both null on user-created recipes.
  @Column({ type: 'varchar', length: 36, nullable: true })
  imported_from_recipe_id?: string | null;

  @Column({ type: 'text', nullable: true })
  import_provenance?: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

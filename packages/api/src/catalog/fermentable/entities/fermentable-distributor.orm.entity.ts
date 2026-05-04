import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { DistributorOrmEntity } from '../../distributor/entities/distributor.orm.entity';
import { FermentableOrmEntity } from './fermentable.orm.entity';

/**
 * M:N junction between fermentables and distributors
 * (Issue #901). Mirrors the `hop_distributors` shape exactly
 * — see the docblock there for the design rationale (composite
 * PK, ON DELETE CASCADE both sides, https-only product URLs).
 */
@Entity('fermentable_distributors')
export class FermentableDistributorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  fermentable_id: string;

  @PrimaryColumn({ type: 'varchar', length: 36 })
  distributor_id: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  product_url: string;

  @Column({ type: 'varchar', length: 80, nullable: true })
  sku: string | null;

  @Column({ type: 'text', nullable: true })
  notes_per_distributor: string | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => FermentableOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fermentable_id' })
  fermentable: FermentableOrmEntity;

  @ManyToOne(() => DistributorOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distributor_id' })
  distributor: DistributorOrmEntity;
}

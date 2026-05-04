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
import { YeastOrmEntity } from './yeast.orm.entity';

/**
 * M:N junction between yeasts and distributors (Issue #901).
 * Mirrors `hop_distributors` — see that docblock for design
 * rationale.
 */
@Entity('yeast_distributors')
export class YeastDistributorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  yeast_id: string;

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

  @ManyToOne(() => YeastOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'yeast_id' })
  yeast: YeastOrmEntity;

  @ManyToOne(() => DistributorOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distributor_id' })
  distributor: DistributorOrmEntity;
}

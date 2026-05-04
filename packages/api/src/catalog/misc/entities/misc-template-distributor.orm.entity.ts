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
import { MiscTemplateOrmEntity } from './misc-template.orm.entity';

/**
 * M:N junction between misc templates and distributors
 * (Issue #901). Mirrors `hop_distributors` — see that docblock
 * for design rationale.
 */
@Entity('misc_template_distributors')
export class MiscTemplateDistributorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  misc_template_id: string;

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

  @ManyToOne(() => MiscTemplateOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'misc_template_id' })
  misc_template: MiscTemplateOrmEntity;

  @ManyToOne(() => DistributorOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distributor_id' })
  distributor: DistributorOrmEntity;
}

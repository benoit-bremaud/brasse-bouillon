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
import { EquipmentTemplateOrmEntity } from './equipment-template.orm.entity';

/**
 * M:N junction between equipment templates and distributors
 * (Issue #901). Mirrors `hop_distributors` — see that docblock
 * for design rationale.
 *
 * Equipment is the only catalogue where one item often costs
 * 100-2000 € (Grainfather, Klarstein, Anvil), so the boutique
 * link is even more valuable here than for ingredients (the
 * brewer compares prices across distributors before clicking
 * "Acheter").
 */
@Entity('equipment_template_distributors')
export class EquipmentTemplateDistributorOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  equipment_template_id: string;

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

  @ManyToOne(() => EquipmentTemplateOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_template_id' })
  equipment_template: EquipmentTemplateOrmEntity;

  @ManyToOne(() => DistributorOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'distributor_id' })
  distributor: DistributorOrmEntity;
}

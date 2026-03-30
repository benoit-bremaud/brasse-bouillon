import { EquipmentSystemType } from '../domain/enums/equipment-system-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('equipment_profiles')
@Index(['owner_id'])
export class EquipmentProfileOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36, nullable: false })
  owner_id: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  name: string;

  // Volumes (L)
  @Column({ type: 'real', nullable: false })
  mash_tun_volume_l: number;

  @Column({ type: 'real', nullable: false })
  boil_kettle_volume_l: number;

  @Column({ type: 'real', nullable: false })
  fermenter_volume_l: number;

  // Losses (L)
  @Column({ type: 'real', nullable: false, default: 0 })
  trub_loss_l: number;

  @Column({ type: 'real', nullable: false, default: 0 })
  dead_space_loss_l: number;

  @Column({ type: 'real', nullable: false, default: 0 })
  transfer_loss_l: number;

  // Rates / efficiency
  @Column({ type: 'real', nullable: false })
  evaporation_rate_l_per_hour: number;

  @Column({ type: 'real', nullable: false })
  efficiency_estimated_percent: number;

  @Column({ type: 'real', nullable: true })
  efficiency_measured_percent?: number | null;

  // Optional cooling
  @Column({ type: 'integer', nullable: true })
  cooling_time_minutes?: number | null;

  @Column({ type: 'real', nullable: true })
  cooling_flow_rate_l_per_minute?: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: EquipmentSystemType,
    nullable: false,
  })
  system_type: EquipmentSystemType;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

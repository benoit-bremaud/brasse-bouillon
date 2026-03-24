import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';

@Entity('scan_catalog_items')
@Index('UQ_scan_catalog_items_barcode', ['barcode'], { unique: true })
@Index('IDX_scan_catalog_items_name', ['name'])
@Index('IDX_scan_catalog_items_style', ['style'])
export class ScanCatalogItemOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 32, nullable: false })
  barcode: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 160, nullable: false })
  brewery: string;

  @Column({ type: 'varchar', length: 120, nullable: false })
  style: string;

  @Column({ type: 'real', nullable: true })
  abv?: number | null;

  @Column({ type: 'real', nullable: true })
  ibu?: number | null;

  @Column({ type: 'real', nullable: true })
  color_ebc?: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ScanFermentationType,
    nullable: false,
    default: ScanFermentationType.UNKNOWN,
  })
  fermentation_type: ScanFermentationType;

  @Column({ type: 'text', nullable: true })
  aromatic_tags?: string | null;

  @Column({ type: 'text', nullable: true })
  notes_source?: string | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_abv_estimated: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_ibu_estimated: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_color_ebc_estimated: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_style_estimated: boolean;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

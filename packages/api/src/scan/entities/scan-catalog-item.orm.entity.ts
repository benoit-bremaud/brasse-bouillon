import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ScanCatalogSource } from '../domain/enums/scan-catalog-source.enum';
import { ScanFermentationType } from '../domain/enums/scan-fermentation-type.enum';

@Entity('scan_catalog_items')
@Index('UQ_scan_catalog_items_barcode', ['barcode'], { unique: true })
@Index('IDX_scan_catalog_items_name', ['name'])
@Index('IDX_scan_catalog_items_style', ['style'])
@Index('IDX_scan_catalog_items_source', ['source'])
@Index('IDX_scan_catalog_items_fetched_at', ['fetched_at'])
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

  // OpenFoodFacts cache bridge (Epic #693 part 3/5). Tracks where the
  // row came from so the proxy can decide between cache hit, cache
  // miss, and never-refresh (manual / seed entries).
  @Column({
    type: 'varchar',
    length: 20,
    enum: ScanCatalogSource,
    nullable: false,
    default: ScanCatalogSource.SEED,
  })
  source: ScanCatalogSource;

  // ISO-8601 timestamp of the last successful fetch from the upstream
  // source. Drives the 1-hour cache TTL: rows older than 1 h trigger
  // a background refresh on next access (rows with NULL fetched_at are
  // either seed data — never refetched — or fresh manual inserts).
  @Column({ type: 'datetime', nullable: true })
  fetched_at?: Date | null;

  // Raw upstream response, stored as JSON-serialized TEXT to stay
  // cross-DB-safe (per ADR-0004 storage convention). Useful for
  // debugging discrepancies and for re-deriving structured fields if
  // the parsing logic evolves.
  @Column({ type: 'text', nullable: true })
  raw_payload?: string | null;

  // Number of times this catalog item has been resolved by a
  // scan-lookup call (Issue #929). Incremented atomically. Counter
  // is per-SKU today; will be migrated to a beer_identities table
  // when we build the stats screen.
  @Column({ type: 'integer', nullable: false, default: 0 })
  scan_count: number;

  // Timestamp of the last scan-lookup hit on this row. Powers
  // trending stats and informs cache-freshness tuning later.
  @Column({ type: 'datetime', nullable: true })
  last_scanned_at?: Date | null;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}

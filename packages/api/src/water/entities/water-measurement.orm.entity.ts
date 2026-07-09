import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Append-only cache of Hub'Eau water-quality measurements (ADR-0025, slice 2).
 *
 * One row per raw Hub'Eau `resultats_dis` measurement. Rows are **never
 * updated** — a full sync appends with `INSERT OR IGNORE` on the unique key, so
 * history accrues for free and re-syncing the same window is idempotent. The
 * commune → dominant-network link is resolved at read time (as in slice 1), so
 * the cache keys on `code_reseau` (the dominant network), NOT `code_commune`
 * (which would blend all networks and shift the average).
 *
 * The unique key `(code_reseau, code_parametre, date_prelevement,
 * code_prelevement)` mirrors ADR-0025 § Slice-2 design: a single physical
 * sample (`code_prelevement`) yields one measurement per parameter per date on
 * a given network. This is public ARS/Hub'Eau reference data — NOT PII.
 */
@Entity('water_measurements')
@Index(
  'UQ_water_measurements_key',
  ['code_reseau', 'code_parametre', 'date_prelevement', 'code_prelevement'],
  { unique: true },
)
@Index('IDX_water_measurements_reseau_date', [
  'code_reseau',
  'date_prelevement',
])
export class WaterMeasurementOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /** Dominant-network code (Hub'Eau `code_reseau`). */
  @Column({ type: 'varchar', length: 64, nullable: false })
  code_reseau: string;

  /** SANDRE parameter code (e.g. `1374` = Calcium). */
  @Column({ type: 'varchar', length: 16, nullable: false })
  code_parametre: string;

  /** Sampling date, stored as `YYYY-MM-DD` so `max()` sorts lexicographically. */
  @Column({ type: 'varchar', length: 10, nullable: false })
  date_prelevement: string;

  /** Physical-sample id (Hub'Eau `code_prelevement`) — part of the dedupe key. */
  @Column({ type: 'varchar', length: 64, nullable: false })
  code_prelevement: string;

  /** Raw parameter label (`libelle_parametre`) — matched to an ion at read time. */
  @Column({ type: 'varchar', length: 255, nullable: false })
  libelle_parametre: string;

  /** Measured value in mg/L; null when Hub'Eau reports no numeric result. */
  @Column({ type: 'real', nullable: true })
  resultat_numerique: number | null;

  /** Per-sample physico-chemical conformity short code (C/N/D/S), if present. */
  @Column({ type: 'varchar', length: 8, nullable: true })
  conformite: string | null;

  /** When we ingested this row (audit only — freshness uses `date_prelevement`). */
  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WaterMeasurementOrmEntity } from '../entities/water-measurement.orm.entity';
import { WaterSample } from '../domain/ports/water-quality-provider.port';

/**
 * Durable append-only cache for Hub'Eau measurements (ADR-0025, slice 2). It is
 * the persistence seam between the Hub'Eau provider and the domain aggregation:
 * a full sync appends rows idempotently, and the profile is read back from here
 * — the same `WaterSample` shape in and out. All reads/writes key on
 * `code_reseau` (the dominant network) and the requested year window.
 *
 * The read returns the **most recent** samples first, bounded to a limit, so the
 * aggregated average is deterministic and reflects the freshest measurements
 * (an improvement over slice 1, which averaged an arbitrary Hub'Eau-order page).
 * The bound also keeps `sampleCount` stable as history accretes across syncs.
 */
@Injectable()
export class WaterMeasurementCacheService {
  constructor(
    @InjectRepository(WaterMeasurementOrmEntity)
    private readonly repo: Repository<WaterMeasurementOrmEntity>,
  ) {}

  /**
   * The most recent `date_prelevement` we hold for this network within the year
   * window, or null when we hold none — the local side of the sync-gate compare.
   */
  async getStoredMaxDate(input: {
    networkCode: string;
    year: number;
  }): Promise<string | null> {
    const { min, max } = yearBounds(input.year);
    const row = await this.repo
      .createQueryBuilder('m')
      .select('MAX(m.date_prelevement)', 'maxDate')
      .where('m.code_reseau = :networkCode', {
        networkCode: input.networkCode,
      })
      .andWhere('m.date_prelevement BETWEEN :min AND :max', { min, max })
      .getRawOne<{ maxDate: string | null }>();

    return row?.maxDate ?? null;
  }

  /**
   * Append the fetched samples (idempotent). Rows missing any part of the unique
   * key (`code_parametre` / `date_prelevement` / `code_prelevement`) can't be
   * deduped, so they are skipped rather than risk duplicate history. `orIgnore()`
   * turns a re-sync of the same window into a no-op (`INSERT OR IGNORE`).
   */
  async appendMeasurements(
    networkCode: string,
    samples: WaterSample[],
  ): Promise<void> {
    const rows = samples.filter(isFullyKeyed).map((sample) => ({
      code_reseau: networkCode,
      code_parametre: sample.parameterCode,
      date_prelevement: sample.datePrelevement,
      code_prelevement: sample.codePrelevement,
      libelle_parametre: sample.parameterLabel,
      resultat_numerique: sample.numericResult,
      conformite: sample.conformity,
    }));

    if (!rows.length) {
      return;
    }

    await this.repo
      .createQueryBuilder()
      .insert()
      .into(WaterMeasurementOrmEntity)
      .values(rows)
      .orIgnore()
      .execute();
  }

  /**
   * Read this network's stored samples for the year window, most recent first,
   * bounded to `limit` rows, mapped back to the provider's `WaterSample` shape
   * so the domain aggregation consumes them exactly as it consumes live-fetched
   * samples. The bound keeps the read (and thus `sampleCount`) comparable to a
   * single slice-1 fetch even as the append-only table accretes history.
   */
  async readSamples(input: {
    networkCode: string;
    year: number;
    limit: number;
  }): Promise<WaterSample[]> {
    const { min, max } = yearBounds(input.year);
    const rows = await this.repo
      .createQueryBuilder('m')
      .where('m.code_reseau = :networkCode', {
        networkCode: input.networkCode,
      })
      .andWhere('m.date_prelevement BETWEEN :min AND :max', { min, max })
      .orderBy('m.date_prelevement', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .limit(input.limit)
      .getMany();

    return rows.map((row) => ({
      parameterLabel: row.libelle_parametre,
      numericResult: row.resultat_numerique,
      conformity: row.conformite,
      parameterCode: row.code_parametre,
      datePrelevement: row.date_prelevement,
      codePrelevement: row.code_prelevement,
    }));
  }
}

/** A sample carrying every part of the append-only unique key (non-null). */
type KeyedSample = WaterSample & {
  parameterCode: string;
  datePrelevement: string;
  codePrelevement: string;
};

/** Type guard: keeps only samples that can be keyed (and thus deduped) safely. */
function isFullyKeyed(sample: WaterSample): sample is KeyedSample {
  return (
    sample.parameterCode !== null &&
    sample.datePrelevement !== null &&
    sample.codePrelevement !== null
  );
}

/** Inclusive `YYYY-MM-DD` bounds for a calendar year (ISO strings sort chronologically). */
function yearBounds(year: number): { min: string; max: string } {
  return { min: `${year}-01-01`, max: `${year}-12-31` };
}

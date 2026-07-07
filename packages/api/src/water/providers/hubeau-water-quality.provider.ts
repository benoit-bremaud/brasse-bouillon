import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import {
  WaterNetwork,
  WaterQualityProviderPort,
  WaterSample,
} from '../domain/ports/water-quality-provider.port';

import type { WaterConfig } from '../../config/water.config';
import { WATER_CONFIG } from '../water.constants';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';
import { normalizeFrenchLabel } from '../../common/normalize-french-label';

// Hub'Eau v1 renamed the `communes_udi` fields (`code_udi`→`code_reseau`,
// `nom_udi`→`nom_reseau`) and dropped `nb_prelevements`, so this record shape
// tracks the current API.
interface HubEauCommuneUdiRecord {
  readonly code_reseau: string;
  readonly nom_reseau: string | null;
  readonly nom_commune: string | null;
  // Sometimes a « NN% » population-coverage figure for the network, sometimes an
  // arrondissement/quartier description — used as the dominant-network signal
  // only when it parses as a percentage.
  readonly nom_quartier: string | null;
  readonly annee: string | null;
}

interface HubEauCommuneUdiResponse {
  readonly data: HubEauCommuneUdiRecord[];
}

// `resultats_dis` renamed `nom_parametre`→`libelle_parametre`; the old
// `conclusion_conformite_prelevement_pc` short code now lives in
// `conformite_limites_pc_prelevement` (the physico-chemical limits verdict).
interface HubEauResultatsRecord {
  readonly libelle_parametre: string;
  readonly resultat_numerique: number | string | null;
  readonly conformite_limites_pc_prelevement: string | null;
}

interface HubEauResultatsResponse {
  readonly data: HubEauResultatsRecord[];
}

/**
 * SANDRE parameter codes for the brewing-relevant ions. Hub'Eau serves hundreds
 * of parameters and the ions are sampled infrequently, so a generic results
 * page (size N, most-recent first) can miss Calcium/Magnésium entirely — we
 * filter the query to exactly these codes so the profile always sees them.
 */
const ION_PARAMETER_CODES = [
  '1374', // Calcium
  '1372', // Magnésium
  '1338', // Sulfates
  '1337', // Chlorures
  '1327', // Hydrogénocarbonates (bicarbonate / HCO3)
] as const;

@Injectable()
export class HubeauWaterQualityProvider implements WaterQualityProviderPort {
  readonly key = WaterProviderKey.HUBEAU;

  constructor(
    @Inject(WATER_CONFIG) private readonly waterConfig: WaterConfig,
  ) {}

  async findDominantNetworkByInsee(
    codeInsee: string,
  ): Promise<WaterNetwork | null> {
    const response = await this.fetchHubEau<HubEauCommuneUdiResponse>(
      `${this.waterConfig.hubeauBaseUrl}/communes_udi`,
      {
        code_commune: codeInsee,
        size: String(this.waterConfig.hubeauCommunesUdiSize),
      },
      this.waterConfig.hubeauTimeoutMs,
    );

    if (!response.data.length) {
      return null;
    }

    const dominant = this.selectDominantRecord(response.data);
    return {
      code: dominant.code_reseau,
      name: dominant.nom_reseau,
    };
  }

  /**
   * Picks the network that best represents the commune. Hub'Eau dropped
   * `nb_prelevements` (the old "most-sampled" proxy), so we take the most recent
   * year's records and, within them: (1) the network with the highest « NN% »
   * population coverage when Hub'Eau exposes one, else (2) the network named
   * after the commune (the usual main one), else (3) the first record.
   */
  private selectDominantRecord(
    records: HubEauCommuneUdiRecord[],
  ): HubEauCommuneUdiRecord {
    const latestYear = records.reduce<string | null>(
      (max, record) =>
        record.annee && (max === null || record.annee > max)
          ? record.annee
          : max,
      null,
    );

    const inLatestYear = latestYear
      ? records.filter((record) => record.annee === latestYear)
      : records;
    const candidates = inLatestYear.length ? inLatestYear : records;

    // 1. Highest population coverage — the truest "dominant" signal left after
    // `nb_prelevements` was dropped (only some communes expose a « NN% »).
    const byCoverage = candidates
      .map((record) => ({
        record,
        coverage: this.parseCoveragePercent(record.nom_quartier),
      }))
      .filter(
        (
          entry,
        ): entry is { record: HubEauCommuneUdiRecord; coverage: number } =>
          entry.coverage !== null,
      )
      .sort((a, b) => b.coverage - a.coverage);
    if (byCoverage.length) {
      return byCoverage[0].record;
    }

    // 2. The network named after the commune.
    const namedAfterCommune = candidates.find(
      (record) =>
        record.nom_reseau != null &&
        record.nom_commune != null &&
        normalizeFrenchLabel(record.nom_reseau) ===
          normalizeFrenchLabel(record.nom_commune),
    );

    // 3. Deterministic fallback: the first record.
    return namedAfterCommune ?? candidates[0];
  }

  /** Reads a « NN% » population-coverage figure out of `nom_quartier`, if any. */
  private parseCoveragePercent(value: string | null): number | null {
    if (!value) {
      return null;
    }
    const match = /(\d+(?:[.,]\d+)?)\s*%/.exec(value);
    return match ? this.toNullableNumber(match[1]) : null;
  }

  async getNetworkSamples(input: {
    networkCode: string;
    year: number;
    size: number;
  }): Promise<WaterSample[]> {
    const response = await this.fetchHubEau<HubEauResultatsResponse>(
      `${this.waterConfig.hubeauBaseUrl}/resultats_dis`,
      {
        code_reseau: input.networkCode,
        code_parametre: ION_PARAMETER_CODES.join(','),
        fields:
          'libelle_parametre,resultat_numerique,conformite_limites_pc_prelevement',
        date_min_prelevement: `${input.year}-01-01`,
        date_max_prelevement: `${input.year}-12-31`,
        size: String(input.size),
      },
      this.waterConfig.hubeauTimeoutMs,
    );

    return response.data
      .filter(
        (row) =>
          typeof row.libelle_parametre === 'string' &&
          row.libelle_parametre.length > 0,
      )
      .map((row) => ({
        parameterLabel: row.libelle_parametre,
        numericResult: this.toNullableNumber(row.resultat_numerique),
        conformity: row.conformite_limites_pc_prelevement,
      }));
  }

  private async fetchHubEau<T>(
    url: string,
    params: Record<string, string>,
    timeout: number,
  ): Promise<T> {
    const query = new URLSearchParams(params);
    const fullUrl = `${url}?${query.toString()}`;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `Hub'Eau request failed with status ${response.status}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      if (this.isTimeoutError(error)) {
        throw new BadGatewayException("Hub'Eau request timed out");
      }

      if (error instanceof SyntaxError) {
        throw new BadGatewayException("Hub'Eau returned invalid JSON");
      }

      throw new BadGatewayException("Hub'Eau request failed");
    }
  }

  private toNullableNumber(value: number | string | null): number | null {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.replace(',', '.').trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private isTimeoutError(error: unknown): boolean {
    return (
      error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')
    );
  }
}

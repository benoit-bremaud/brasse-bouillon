import { BadGatewayException, Inject, Injectable } from '@nestjs/common';
import {
  WaterNetwork,
  WaterQualityProviderPort,
  WaterSample,
} from '../domain/ports/water-quality-provider.port';

import type { EauConfig } from '../../config/eau.config';
import { EAU_CONFIG } from '../eau.constants';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';

interface HubEauCommuneUdiRecord {
  readonly code_udi: string;
  readonly nom_udi: string | null;
  readonly nb_prelevements: number | string | null;
}

interface HubEauCommuneUdiResponse {
  readonly data: HubEauCommuneUdiRecord[];
}

interface HubEauResultatsRecord {
  readonly nom_parametre: string;
  readonly resultat_numerique: number | string | null;
  readonly conclusion_conformite_prelevement_pc: string | null;
}

interface HubEauResultatsResponse {
  readonly data: HubEauResultatsRecord[];
}

@Injectable()
export class HubeauWaterQualityProvider implements WaterQualityProviderPort {
  readonly key = WaterProviderKey.HUBEAU;

  constructor(@Inject(EAU_CONFIG) private readonly eauConfig: EauConfig) {}

  async findDominantNetworkByInsee(
    codeInsee: string,
  ): Promise<WaterNetwork | null> {
    const response = await this.fetchHubEau<HubEauCommuneUdiResponse>(
      `${this.eauConfig.hubeauBaseUrl}/communes_udi`,
      {
        code_commune: codeInsee,
        size: String(this.eauConfig.hubeauCommunesUdiSize),
      },
      this.eauConfig.hubeauTimeoutMs,
    );

    if (!response.data.length) {
      return null;
    }

    const dominant = response.data.reduce<HubEauCommuneUdiRecord>(
      (currentDominant, record) => {
        const currentMax = this.toSafeNumber(currentDominant.nb_prelevements);
        const value = this.toSafeNumber(record.nb_prelevements);
        return value > currentMax ? record : currentDominant;
      },
      response.data[0],
    );

    return {
      code: dominant.code_udi,
      name: dominant.nom_udi,
    };
  }

  async getNetworkSamples(input: {
    networkCode: string;
    year: number;
    size: number;
  }): Promise<WaterSample[]> {
    const response = await this.fetchHubEau<HubEauResultatsResponse>(
      `${this.eauConfig.hubeauBaseUrl}/resultats_dis`,
      {
        code_udi: input.networkCode,
        fields:
          'nom_parametre,resultat_numerique,conclusion_conformite_prelevement_pc',
        date_min_prelevement: `${input.year}-01-01`,
        date_max_prelevement: `${input.year}-12-31`,
        size: String(input.size),
      },
      this.eauConfig.hubeauTimeoutMs,
    );

    return response.data
      .filter(
        (row) =>
          typeof row.nom_parametre === 'string' && row.nom_parametre.length > 0,
      )
      .map((row) => ({
        parameterLabel: row.nom_parametre,
        numericResult: this.toNullableNumber(row.resultat_numerique),
        conformity: row.conclusion_conformite_prelevement_pc,
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

  private toSafeNumber(value: number | string | null): number {
    const numberValue = this.toNullableNumber(value);
    return numberValue ?? 0;
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

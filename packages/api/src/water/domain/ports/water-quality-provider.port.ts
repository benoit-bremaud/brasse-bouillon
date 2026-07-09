import { WaterProviderKey } from '../enums/water-provider-key.enum';

export interface WaterNetwork {
  readonly code: string;
  readonly name: string | null;
}

export interface WaterSample {
  readonly parameterLabel: string;
  readonly numericResult: number | null;
  readonly conformity: string | null;
  /** SANDRE parameter code — cache key part (slice 2); null on the live path. */
  readonly parameterCode: string | null;
  /** Sampling date `YYYY-MM-DD` — freshness + cache key part (slice 2). */
  readonly datePrelevement: string | null;
  /** Physical-sample id — cache key part (slice 2). */
  readonly codePrelevement: string | null;
}

export interface WaterQualityProviderPort {
  readonly key: WaterProviderKey;

  findDominantNetworkByInsee(codeInsee: string): Promise<WaterNetwork | null>;

  getNetworkSamples(input: {
    networkCode: string;
    year: number;
    size: number;
  }): Promise<WaterSample[]>;

  /**
   * Cheap conditional-sync gate (ADR-0025, slice 2): the most recent sampling
   * date the source holds for this network within the year window, or null when
   * it has none. Keeps latency low (size=1) so most lookups do no heavy fetch.
   */
  getNetworkLatestSampleDate(input: {
    networkCode: string;
    year: number;
  }): Promise<string | null>;
}

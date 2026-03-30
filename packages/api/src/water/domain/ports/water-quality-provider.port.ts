import { WaterProviderKey } from '../enums/water-provider-key.enum';

export interface WaterNetwork {
  readonly code: string;
  readonly name: string | null;
}

export interface WaterSample {
  readonly parameterLabel: string;
  readonly numericResult: number | null;
  readonly conformity: string | null;
}

export interface WaterQualityProviderPort {
  readonly key: WaterProviderKey;

  findDominantNetworkByInsee(codeInsee: string): Promise<WaterNetwork | null>;

  getNetworkSamples(input: {
    networkCode: string;
    year: number;
    size: number;
  }): Promise<WaterSample[]>;
}

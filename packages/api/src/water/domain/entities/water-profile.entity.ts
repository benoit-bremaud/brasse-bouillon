import { WaterConformity } from '../enums/water-conformity.enum';
import { WaterProviderKey } from '../enums/water-provider-key.enum';

export interface WaterMineralsMgL {
  readonly ca: number | null;
  readonly mg: number | null;
  readonly cl: number | null;
  readonly so4: number | null;
  readonly hco3: number | null;
}

export interface WaterProfileEntityProps {
  readonly provider: WaterProviderKey;
  readonly codeInsee: string;
  readonly year: number;
  readonly networkName: string | null;
  readonly sampleCount: number;
  readonly conformity: WaterConformity;
  readonly mineralsMgL: WaterMineralsMgL;
  readonly hardnessFrench: number | null;
  /**
   * Honest data currency — `max(date_prelevement)` of the aggregated samples
   * (`YYYY-MM-DD`), or null when unknown. Never the fetch date (ADR-0025).
   */
  readonly freshnessDate: string | null;
}

export class WaterProfileEntity {
  readonly provider: WaterProviderKey;
  readonly codeInsee: string;
  readonly year: number;
  readonly networkName: string | null;
  readonly sampleCount: number;
  readonly conformity: WaterConformity;
  readonly mineralsMgL: WaterMineralsMgL;
  readonly hardnessFrench: number | null;
  readonly freshnessDate: string | null;

  constructor(props: WaterProfileEntityProps) {
    this.provider = props.provider;
    this.codeInsee = props.codeInsee;
    this.year = props.year;
    this.networkName = props.networkName;
    this.sampleCount = props.sampleCount;
    this.conformity = props.conformity;
    this.mineralsMgL = props.mineralsMgL;
    this.hardnessFrench = props.hardnessFrench;
    this.freshnessDate = props.freshnessDate;
  }
}

import { WaterConformity } from '../enums/water-conformity.enum';
import { WaterProfileEntity } from '../entities/water-profile.entity';
import { WaterProviderKey } from '../enums/water-provider-key.enum';
import { WaterSample } from '../ports/water-quality-provider.port';

type MineralKey = 'ca' | 'mg' | 'cl' | 'so4' | 'hco3';

const PARAMETER_MAP: Record<string, MineralKey> = {
  Calcium: 'ca',
  Magnesium: 'mg',
  Chlorides: 'cl',
  Sulfates: 'so4',
  'Total bicarbonates': 'hco3',
};

interface AggregateBucket {
  sum: number;
  count: number;
}

interface MineralAggregate {
  ca: AggregateBucket;
  mg: AggregateBucket;
  cl: AggregateBucket;
  so4: AggregateBucket;
  hco3: AggregateBucket;
}

const createEmptyAggregate = (): MineralAggregate => ({
  ca: { sum: 0, count: 0 },
  mg: { sum: 0, count: 0 },
  cl: { sum: 0, count: 0 },
  so4: { sum: 0, count: 0 },
  hco3: { sum: 0, count: 0 },
});

const round1 = (value: number): number => Math.round(value * 10) / 10;

const normalizeConformity = (
  value: string | null | undefined,
): WaterConformity => {
  if (!value) {
    return WaterConformity.UNKNOWN;
  }

  const trimmed = value.trim().toUpperCase();
  if (trimmed === 'C') return WaterConformity.C;
  if (trimmed === 'N') return WaterConformity.N;
  if (trimmed === 'D') return WaterConformity.D;
  if (trimmed === 'S') return WaterConformity.S;

  return WaterConformity.UNKNOWN;
};

const CONFORMITY_SEVERITY: Record<WaterConformity, number> = {
  [WaterConformity.C]: 0,
  [WaterConformity.S]: 1,
  [WaterConformity.D]: 2,
  [WaterConformity.N]: 3,
  [WaterConformity.UNKNOWN]: -1,
};

export class WaterAggregationDomainService {
  aggregate(input: {
    provider: WaterProviderKey;
    codeInsee: string;
    year: number;
    networkName: string | null;
    samples: WaterSample[];
    maxSamples: number;
  }): WaterProfileEntity {
    const samples = input.samples.slice(0, input.maxSamples);

    const aggregate = createEmptyAggregate();
    for (const sample of samples) {
      const key = PARAMETER_MAP[sample.parameterLabel];
      if (!key) {
        continue;
      }

      const numeric = sample.numericResult;
      if (numeric === null || !Number.isFinite(numeric)) {
        continue;
      }

      aggregate[key].sum += numeric;
      aggregate[key].count += 1;
    }

    const ca = this.computeAverage(aggregate.ca);
    const mg = this.computeAverage(aggregate.mg);
    const cl = this.computeAverage(aggregate.cl);
    const so4 = this.computeAverage(aggregate.so4);
    const hco3 = this.computeAverage(aggregate.hco3);
    const conformity = this.resolveConformity(samples);

    return new WaterProfileEntity({
      provider: input.provider,
      codeInsee: input.codeInsee,
      year: input.year,
      networkName: input.networkName,
      sampleCount: input.samples.length,
      conformity,
      mineralsMgL: {
        ca,
        mg,
        cl,
        so4,
        hco3,
      },
      hardnessFrench: this.computeHardnessFrench(ca, mg),
    });
  }

  private computeAverage(bucket: AggregateBucket): number | null {
    if (!bucket.count) {
      return null;
    }

    return round1(bucket.sum / bucket.count);
  }

  private computeHardnessFrench(
    ca: number | null,
    mg: number | null,
  ): number | null {
    if (ca === null && mg === null) {
      return null;
    }

    const caValue = ca ?? 0;
    const mgValue = mg ?? 0;
    return round1((caValue * 10 + mgValue * 4.1) / 10);
  }

  private resolveConformity(samples: WaterSample[]): WaterConformity {
    let worst: WaterConformity | null = null;

    for (const sample of samples) {
      const normalized = normalizeConformity(sample.conformity);
      if (normalized === WaterConformity.UNKNOWN) {
        continue;
      }

      if (
        !worst ||
        CONFORMITY_SEVERITY[normalized] > CONFORMITY_SEVERITY[worst]
      ) {
        worst = normalized;
      }
    }

    return worst ?? WaterConformity.UNKNOWN;
  }
}

import { WaterAggregationDomainService } from './water-aggregation-domain.service';
import { WaterConformity } from '../enums/water-conformity.enum';
import { WaterProviderKey } from '../enums/water-provider-key.enum';

describe('WaterAggregationDomainService', () => {
  const service = new WaterAggregationDomainService();

  it('should aggregate mineral samples and compute hardness', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '44109',
      year: 2024,
      networkName: 'NANTES SUD',
      maxSamples: 50,
      samples: [
        {
          parameterLabel: 'Calcium',
          numericResult: 50,
          conformity: 'c',
        },
        {
          parameterLabel: 'Calcium',
          numericResult: 54,
          conformity: 'c',
        },
        {
          parameterLabel: 'Magnesium',
          numericResult: 8,
          conformity: 'C',
        },
        {
          parameterLabel: 'Sulfates',
          numericResult: 27.2,
          conformity: 'C',
        },
        {
          parameterLabel: 'Total bicarbonates',
          numericResult: 141.1,
          conformity: 'C',
        },
      ],
    });

    expect(profile.provider).toBe(WaterProviderKey.HUBEAU);
    expect(profile.codeInsee).toBe('44109');
    expect(profile.year).toBe(2024);
    expect(profile.networkName).toBe('NANTES SUD');
    expect(profile.sampleCount).toBe(5);

    expect(profile.mineralsMgL.ca).toBe(52);
    expect(profile.mineralsMgL.mg).toBe(8);
    expect(profile.mineralsMgL.so4).toBe(27.2);
    expect(profile.mineralsMgL.hco3).toBe(141.1);
    expect(profile.mineralsMgL.cl).toBeNull();

    expect(profile.hardnessFrench).toBe(55.3);
    expect(profile.conformity).toBe(WaterConformity.C);
  });

  it('should ignore unknown or non numeric samples and normalize conformity', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '75056',
      year: 2023,
      networkName: null,
      maxSamples: 10,
      samples: [
        {
          parameterLabel: 'Unknown',
          numericResult: 50,
          conformity: 'X',
        },
        {
          parameterLabel: 'Calcium',
          numericResult: null,
          conformity: null,
        },
      ],
    });

    expect(profile.mineralsMgL.ca).toBeNull();
    expect(profile.mineralsMgL.mg).toBeNull();
    expect(profile.mineralsMgL.cl).toBeNull();
    expect(profile.mineralsMgL.so4).toBeNull();
    expect(profile.mineralsMgL.hco3).toBeNull();
    expect(profile.hardnessFrench).toBeNull();
    expect(profile.conformity).toBe(WaterConformity.UNKNOWN);
  });

  it('should respect maxSamples when aggregating', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '13055',
      year: 2022,
      networkName: 'MARSEILLE',
      maxSamples: 1,
      samples: [
        {
          parameterLabel: 'Calcium',
          numericResult: 10,
          conformity: 'C',
        },
        {
          parameterLabel: 'Calcium',
          numericResult: 100,
          conformity: 'C',
        },
      ],
    });

    expect(profile.sampleCount).toBe(2);
    expect(profile.mineralsMgL.ca).toBe(10);
  });

  it('should keep the worst conformity across retained samples', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '33063',
      year: 2024,
      networkName: 'BORDEAUX',
      maxSamples: 10,
      samples: [
        {
          parameterLabel: 'Calcium',
          numericResult: 40,
          conformity: 'C',
        },
        {
          parameterLabel: 'Magnesium',
          numericResult: 6,
          conformity: 'D',
        },
        {
          parameterLabel: 'Sulfates',
          numericResult: 20,
          conformity: 'N',
        },
      ],
    });

    expect(profile.conformity).toBe(WaterConformity.N);
  });

  it('should map french and accented HubEau parameter labels', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '29232',
      year: 2024,
      networkName: 'QUIMPER',
      maxSamples: 10,
      samples: [
        {
          parameterLabel: 'Magnésium',
          numericResult: 9,
          conformity: 'C',
        },
        {
          parameterLabel: 'Chlorures',
          numericResult: 17,
          conformity: 'C',
        },
        {
          parameterLabel: 'Bicarbonates totaux',
          numericResult: 122,
          conformity: 'C',
        },
      ],
    });

    expect(profile.mineralsMgL.mg).toBe(9);
    expect(profile.mineralsMgL.cl).toBe(17);
    expect(profile.mineralsMgL.hco3).toBe(122);
  });
});

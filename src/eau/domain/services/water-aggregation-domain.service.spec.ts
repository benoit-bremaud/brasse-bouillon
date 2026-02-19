import { WaterAggregationDomainService } from './water-aggregation-domain.service';
import { WaterConformity } from '../enums/water-conformity.enum';
import { WaterProviderKey } from '../enums/water-provider-key.enum';

describe('WaterAggregationDomainService', () => {
  const service = new WaterAggregationDomainService();

  it('should aggregate mineral samples and compute hardness', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '44109',
      annee: 2024,
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
          parameterLabel: 'Magnésium',
          numericResult: 8,
          conformity: 'C',
        },
        {
          parameterLabel: 'Sulfates',
          numericResult: 27.2,
          conformity: 'C',
        },
        {
          parameterLabel: 'Bicarbonates totaux',
          numericResult: 141.1,
          conformity: 'C',
        },
      ],
    });

    expect(profile.provider).toBe(WaterProviderKey.HUBEAU);
    expect(profile.codeInsee).toBe('44109');
    expect(profile.annee).toBe(2024);
    expect(profile.nomReseau).toBe('NANTES SUD');
    expect(profile.nbPrelevements).toBe(5);

    expect(profile.minerauxMgL.ca).toBe(52);
    expect(profile.minerauxMgL.mg).toBe(8);
    expect(profile.minerauxMgL.so4).toBe(27.2);
    expect(profile.minerauxMgL.hco3).toBe(141.1);
    expect(profile.minerauxMgL.cl).toBeNull();

    expect(profile.dureteFrancais).toBe(55.3);
    expect(profile.conformite).toBe(WaterConformity.C);
  });

  it('should ignore unknown or non numeric samples and normalize conformity', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '75056',
      annee: 2023,
      networkName: null,
      maxSamples: 10,
      samples: [
        {
          parameterLabel: 'Inconnu',
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

    expect(profile.minerauxMgL.ca).toBeNull();
    expect(profile.minerauxMgL.mg).toBeNull();
    expect(profile.minerauxMgL.cl).toBeNull();
    expect(profile.minerauxMgL.so4).toBeNull();
    expect(profile.minerauxMgL.hco3).toBeNull();
    expect(profile.dureteFrancais).toBeNull();
    expect(profile.conformite).toBe(WaterConformity.INCONNU);
  });

  it('should respect maxSamples when aggregating', () => {
    const profile = service.aggregate({
      provider: WaterProviderKey.HUBEAU,
      codeInsee: '13055',
      annee: 2022,
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

    expect(profile.nbPrelevements).toBe(2);
    expect(profile.minerauxMgL.ca).toBe(10);
  });
});

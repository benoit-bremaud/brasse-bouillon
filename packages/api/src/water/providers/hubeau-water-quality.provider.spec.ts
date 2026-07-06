import { BadGatewayException } from '@nestjs/common';
import { HubeauWaterQualityProvider } from './hubeau-water-quality.provider';
import type { WaterConfig } from '../../config/water.config';
import { WaterProviderKey } from '../domain/enums/water-provider-key.enum';

const waterConfigFixture: WaterConfig = {
  defaultProvider: WaterProviderKey.HUBEAU,
  hubeauBaseUrl: 'https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable',
  hubeauTimeoutMs: 8000,
  hubeauCacheTtlSeconds: 3600,
  hubeauMaxSamples: 50,
  hubeauCommunesUdiSize: 10,
  hubeauResultatsDisSize: 100,
};

const buildResponse = (
  status: number,
  payloadFactory: () => Promise<unknown>,
): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: payloadFactory,
  }) as unknown as Response;

describe('HubeauWaterQualityProvider', () => {
  let provider: HubeauWaterQualityProvider;
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchMock = jest.spyOn(global, 'fetch');
    fetchMock.mockReset();

    provider = new HubeauWaterQualityProvider(waterConfigFixture);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('selects the dominant network: latest year, preferring the one named after the commune', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () =>
        Promise.resolve({
          data: [
            // An older year — ignored once a later year exists for the commune.
            {
              code_reseau: 'R-OLD',
              nom_reseau: 'NANTES',
              nom_commune: 'NANTES',
              annee: '2019',
            },
            {
              code_reseau: 'R-1',
              nom_reseau: 'Réseau interco',
              nom_commune: 'NANTES',
              annee: '2024',
            },
            {
              code_reseau: 'R-2',
              nom_reseau: 'NANTES',
              nom_commune: 'NANTES',
              annee: '2024',
            },
          ],
        }),
      ),
    );

    const result = await provider.findDominantNetworkByInsee('44109');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = fetchMock.mock.calls[0]?.[0];
    expect(typeof requestUrl).toBe('string');
    if (typeof requestUrl !== 'string') {
      throw new Error('Expected fetch URL to be a string');
    }

    expect(requestUrl).toContain('/communes_udi?');
    expect(requestUrl).toContain('code_commune=44109');
    expect(requestUrl).toContain('size=10');
    // Latest year (2024) + the réseau named after the commune → R-2.
    expect(result).toEqual({ code: 'R-2', name: 'NANTES' });
  });

  it('falls back to the first record of the latest year when none matches the commune name', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () =>
        Promise.resolve({
          data: [
            {
              code_reseau: 'R-1',
              nom_reseau: 'Syndicat A',
              nom_commune: 'PETIT-BOURG',
              annee: '2023',
            },
            {
              code_reseau: 'R-2',
              nom_reseau: 'Syndicat B',
              nom_commune: 'PETIT-BOURG',
              annee: '2023',
            },
          ],
        }),
      ),
    );

    const result = await provider.findDominantNetworkByInsee('97101');

    expect(result).toEqual({ code: 'R-1', name: 'Syndicat A' });
  });

  it('should return null when no network is found', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () => Promise.resolve({ data: [] })),
    );

    await expect(
      provider.findDominantNetworkByInsee('44109'),
    ).resolves.toBeNull();
  });

  it('fetches only the ion parameters and maps + sanitizes the samples', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () =>
        Promise.resolve({
          data: [
            {
              libelle_parametre: 'Calcium',
              resultat_numerique: '42,5',
              conformite_limites_pc_prelevement: 'C',
            },
            {
              libelle_parametre: 'Magnésium',
              resultat_numerique: 9,
              conformite_limites_pc_prelevement: null,
            },
            {
              libelle_parametre: '',
              resultat_numerique: 10,
              conformite_limites_pc_prelevement: 'C',
            },
            {
              libelle_parametre: 'Chlorures',
              resultat_numerique: 'not-a-number',
              conformite_limites_pc_prelevement: 'N',
            },
          ],
        }),
      ),
    );

    const samples = await provider.getNetworkSamples({
      networkCode: 'R-2',
      year: 2024,
      size: 3,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = fetchMock.mock.calls[0]?.[0];
    expect(typeof requestUrl).toBe('string');
    if (typeof requestUrl !== 'string') {
      throw new Error('Expected fetch URL to be a string');
    }

    expect(requestUrl).toContain('/resultats_dis?');
    expect(requestUrl).toContain('code_reseau=R-2');
    // Targeted ion fetch (Ca, Mg, SO4, Cl, HCO3) so infrequently-sampled ions
    // are never missed on a generic page. URLSearchParams encodes the commas.
    expect(requestUrl).toContain(
      'code_parametre=1374%2C1372%2C1338%2C1337%2C1327',
    );
    expect(requestUrl).toContain('date_min_prelevement=2024-01-01');
    expect(requestUrl).toContain('date_max_prelevement=2024-12-31');
    expect(requestUrl).toContain('size=3');

    expect(samples).toEqual([
      { parameterLabel: 'Calcium', numericResult: 42.5, conformity: 'C' },
      { parameterLabel: 'Magnésium', numericResult: 9, conformity: null },
      { parameterLabel: 'Chlorures', numericResult: null, conformity: 'N' },
    ]);
  });

  it('should throw BadGatewayException on non-ok responses', async () => {
    fetchMock.mockResolvedValue(buildResponse(503, () => Promise.resolve({})));

    await expect(provider.findDominantNetworkByInsee('44109')).rejects.toThrow(
      new BadGatewayException("Hub'Eau request failed with status 503"),
    );
  });

  it('should throw timeout BadGatewayException on timeout-like errors', async () => {
    const timeoutError = new Error('Timeout');
    timeoutError.name = 'TimeoutError';
    fetchMock.mockRejectedValue(timeoutError);

    await expect(provider.findDominantNetworkByInsee('44109')).rejects.toThrow(
      new BadGatewayException("Hub'Eau request timed out"),
    );
  });

  it('should throw invalid JSON BadGatewayException on syntax errors', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () => Promise.reject(new SyntaxError('invalid'))),
    );

    await expect(provider.findDominantNetworkByInsee('44109')).rejects.toThrow(
      new BadGatewayException("Hub'Eau returned invalid JSON"),
    );
  });

  it('should throw generic BadGatewayException on unexpected errors', async () => {
    fetchMock.mockRejectedValue(new Error('boom'));

    await expect(provider.findDominantNetworkByInsee('44109')).rejects.toThrow(
      new BadGatewayException("Hub'Eau request failed"),
    );
  });
});

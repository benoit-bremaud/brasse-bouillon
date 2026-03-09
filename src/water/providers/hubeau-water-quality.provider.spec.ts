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

  it('should return dominant network by highest sample count', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () =>
        Promise.resolve({
          data: [
            {
              code_udi: 'UDI-1',
              nom_udi: 'Network A',
              nb_prelevements: '2',
            },
            {
              code_udi: 'UDI-2',
              nom_udi: 'Network B',
              nb_prelevements: 7,
            },
          ],
        }),
      ),
    );

    const result = await provider.findDominantNetworkByInsee('44109');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    const requestUrl = firstCall?.[0];

    expect(typeof requestUrl).toBe('string');
    if (typeof requestUrl !== 'string') {
      throw new Error('Expected fetch URL to be a string');
    }

    expect(requestUrl).toContain('/communes_udi?');
    expect(requestUrl).toContain('code_commune=44109');
    expect(requestUrl).toContain('size=10');
    expect(result).toEqual({ code: 'UDI-2', name: 'Network B' });
  });

  it('should return null when no network is found', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () => Promise.resolve({ data: [] })),
    );

    await expect(
      provider.findDominantNetworkByInsee('44109'),
    ).resolves.toBeNull();
  });

  it('should map and sanitize provider samples', async () => {
    fetchMock.mockResolvedValue(
      buildResponse(200, () =>
        Promise.resolve({
          data: [
            {
              nom_parametre: 'Calcium',
              resultat_numerique: '42,5',
              conclusion_conformite_prelevement_pc: 'C',
            },
            {
              nom_parametre: 'Magnesium',
              resultat_numerique: 9,
              conclusion_conformite_prelevement_pc: null,
            },
            {
              nom_parametre: '',
              resultat_numerique: 10,
              conclusion_conformite_prelevement_pc: 'C',
            },
            {
              nom_parametre: 'Chlorides',
              resultat_numerique: 'not-a-number',
              conclusion_conformite_prelevement_pc: 'D',
            },
          ],
        }),
      ),
    );

    const samples = await provider.getNetworkSamples({
      networkCode: 'UDI-2',
      year: 2024,
      size: 3,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0];
    const requestUrl = firstCall?.[0];

    expect(typeof requestUrl).toBe('string');
    if (typeof requestUrl !== 'string') {
      throw new Error('Expected fetch URL to be a string');
    }

    expect(requestUrl).toContain('/resultats_dis?');
    expect(requestUrl).toContain('code_udi=UDI-2');
    expect(requestUrl).toContain('date_min_prelevement=2024-01-01');
    expect(requestUrl).toContain('date_max_prelevement=2024-12-31');
    expect(requestUrl).toContain('size=3');

    expect(samples).toEqual([
      {
        parameterLabel: 'Calcium',
        numericResult: 42.5,
        conformity: 'C',
      },
      {
        parameterLabel: 'Magnesium',
        numericResult: 9,
        conformity: null,
      },
      {
        parameterLabel: 'Chlorides',
        numericResult: null,
        conformity: 'D',
      },
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

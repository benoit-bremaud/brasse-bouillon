import {
  OpenFoodFactsClient,
  OpenFoodFactsRawProduct,
} from './openfoodfacts.client';

/**
 * Builds a minimal OFF success payload. Override any field with the
 * `overrides` arg to test parser branches without rebuilding the
 * whole shape every time.
 */
function buildPayload(
  overrides: Partial<OpenFoodFactsRawProduct> = {},
): OpenFoodFactsRawProduct {
  return {
    code: '5060277380011',
    status: 1,
    status_verbose: 'product found',
    product: {
      product_name: 'Punk IPA',
      brands: 'BrewDog',
      alcohol_by_volume_value: 5.4,
      categories_tags: ['en:beverages', 'en:alcoholic-beverages', 'en:beers'],
      image_url: 'https://example.test/punk.jpg',
    },
    ...overrides,
  };
}

/**
 * Replaces the global `fetch` with a Jest spy that resolves to the
 * given Response-like object. Returns the spy so tests can assert on
 * URL / headers.
 */
function mockFetchOk(payload: unknown, status = 200): jest.SpyInstance {
  const spy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  } as unknown as Response);
  return spy;
}

describe('OpenFoodFactsClient.lookupByBarcode', () => {
  let client: OpenFoodFactsClient;

  beforeEach(() => {
    client = new OpenFoodFactsClient();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('happy path — found beer', () => {
    it('returns found:true with parsed name / brewery / abv / isBeer', async () => {
      mockFetchOk(buildPayload());

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.found).toBe(true);
      expect(result.name).toBe('Punk IPA');
      expect(result.brewery).toBe('BrewDog');
      expect(result.abv).toBe(5.4);
      expect(result.isBeer).toBe(true);
    });

    it('hits the configured OFF URL with the EAN encoded', async () => {
      const fetchSpy = mockFetchOk(buildPayload());

      await client.lookupByBarcode('5060277380011');

      const calls = fetchSpy.mock.calls as unknown[][];
      const url = calls[0]?.[0] as string;
      expect(url).toContain('5060277380011');
      expect(url).toContain('/product/');
    });

    it('parses ABV when OFF returns it as a string (some products do)', async () => {
      mockFetchOk(
        buildPayload({
          product: {
            ...buildPayload().product,
            alcohol_by_volume_value: '6.2',
          },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.abv).toBe(6.2);
    });

    it('takes only the first brand when OFF returns a comma-joined brands string', async () => {
      mockFetchOk(
        buildPayload({
          product: {
            ...buildPayload().product,
            brands: 'BrewDog, BrewDog Punks LLC, Heineken',
          },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.brewery).toBe('BrewDog');
    });

    it('detects beer category from any tag starting with "en:beer"', async () => {
      mockFetchOk(
        buildPayload({
          product: {
            ...buildPayload().product,
            categories_tags: ['en:beverages', 'en:beer-craft-ipa'],
          },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.isBeer).toBe(true);
    });
  });

  describe('sad path — product missing or non-beer', () => {
    it('returns found:false when OFF responds 200 with status:0 (product not in DB)', async () => {
      mockFetchOk({ code: '0000', status: 0, status_verbose: 'no product' });

      const result = await client.lookupByBarcode('0000');

      expect(result.found).toBe(false);
      expect(result.name).toBeNull();
      expect(result.brewery).toBeNull();
      expect(result.abv).toBeNull();
      expect(result.isBeer).toBe(false);
    });

    it('returns found:false when OFF responds 200 with status:1 but product is missing', async () => {
      mockFetchOk({ status: 1 });

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.found).toBe(false);
    });

    it('flags isBeer:false when categories_tags does not include any beer tag', async () => {
      mockFetchOk(
        buildPayload({
          product: {
            ...buildPayload().product,
            categories_tags: ['en:beverages', 'en:soft-drinks'],
          },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.found).toBe(true);
      expect(result.isBeer).toBe(false);
    });

    it('returns null brewery when brands is missing', async () => {
      mockFetchOk(
        buildPayload({
          product: { ...buildPayload().product, brands: undefined },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.brewery).toBeNull();
    });

    it('returns null name when product_name is empty / whitespace', async () => {
      mockFetchOk(
        buildPayload({
          product: { ...buildPayload().product, product_name: '   ' },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.name).toBeNull();
    });

    it('returns null abv when alcohol_by_volume_value is unparseable', async () => {
      mockFetchOk(
        buildPayload({
          product: {
            ...buildPayload().product,
            alcohol_by_volume_value: 'not-a-number',
          },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.abv).toBeNull();
    });

    it('returns null abv when alcohol_by_volume_value is out of [0, 100] range', async () => {
      mockFetchOk(
        buildPayload({
          product: {
            ...buildPayload().product,
            alcohol_by_volume_value: 250,
          },
        }),
      );

      const result = await client.lookupByBarcode('5060277380011');

      expect(result.abv).toBeNull();
    });
  });

  describe('error contract — transport failures throw', () => {
    it('throws when OFF responds with a non-2xx HTTP status', async () => {
      mockFetchOk({}, 503);

      await expect(client.lookupByBarcode('5060277380011')).rejects.toThrow(
        /HTTP 503/,
      );
    });

    it('throws when fetch itself rejects (network down)', async () => {
      jest
        .spyOn(globalThis, 'fetch')
        .mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(client.lookupByBarcode('5060277380011')).rejects.toThrow(
        'ECONNREFUSED',
      );
    });

    it('throws when the response body is not valid JSON', async () => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Unexpected token < in JSON')),
      } as unknown as Response);

      await expect(client.lookupByBarcode('5060277380011')).rejects.toThrow(
        /Unexpected token/,
      );
    });
  });

  describe('edge cases', () => {
    it('encodes barcode characters in the URL (defence against bad input)', async () => {
      const fetchSpy = mockFetchOk(buildPayload());

      await client.lookupByBarcode('5060277380011/../etc/passwd');

      const calls = fetchSpy.mock.calls as unknown[][];
      const url = calls[0]?.[0] as string;
      // The slashes / dots are encoded so they cannot escape the
      // OFF /product/ path.
      expect(url).not.toContain('/../etc/passwd');
      expect(url).toContain('5060277380011%2F..%2Fetc%2Fpasswd');
    });

    it('sends a User-Agent header so OFF can rate-limit politely', async () => {
      const fetchSpy = mockFetchOk(buildPayload());

      await client.lookupByBarcode('5060277380011');

      const calls = fetchSpy.mock.calls as unknown[][];
      const init = calls[0]?.[1] as RequestInit | undefined;
      const headers = init?.headers as Record<string, string> | undefined;
      expect(headers?.['User-Agent']).toMatch(/brasse-bouillon/);
    });
  });
});

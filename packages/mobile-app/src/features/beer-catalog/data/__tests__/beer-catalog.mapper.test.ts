/**
 * Pure mapper tests: encyclopedia snake_case DTOs → camelCase domain types.
 * Verifies the contract documented in the mapper header — `abv` Decimal
 * string parsed to number, ADR-0017 bounds carried as-is, null names stay
 * null (fallback labels belong to the view-model, never the domain).
 */
import {
  mapBeer,
  mapBeerDetail,
  mapBrewery,
  mapPage,
  mapStyle,
  toNumber,
  type BeerReadDto,
  type BreweryReadDto,
  type PageDto,
  type StyleReadDto,
} from "@/features/beer-catalog/data/beer-catalog.mapper";

function buildBeerDto(overrides: Partial<BeerReadDto> = {}): BeerReadDto {
  return {
    id: "ddc4c2bc-6f5b-4c2f-9f4d-7e0e0a8b1c2d",
    name: "Pelforth Brune",
    slug: "pelforth-brune",
    brewery_id: "b1d2c3e4-1111-2222-3333-444455556666",
    style_id: "5d6e7f80-aaaa-bbbb-cccc-ddddeeee0001",
    brewery_name: "Pelforth",
    style_name: "Brune",
    abv: "6.5",
    ibu_min: 20,
    ibu_max: 28,
    srm_min: 30,
    srm_max: 30,
    description: "Brune intense",
    is_active: true,
    is_verified: true,
    source: "openfoodfacts",
    ean_code: "3760231860119",
    legal_denomination: "biere",
    country_of_origin: "FR",
    allergens: ["gluten"],
    alcohol_group: 3,
    created_at: "2026-05-02T10:00:00.000Z",
    updated_at: "2026-05-02T10:00:00.000Z",
    ...overrides,
  };
}

function buildBreweryDto(
  overrides: Partial<BreweryReadDto> = {},
): BreweryReadDto {
  return {
    id: "b1d2c3e4-1111-2222-3333-444455556666",
    name: "Pelforth",
    slug: "pelforth",
    brewery_type: "industrial",
    city: "Mons-en-Barœul",
    country: "FR",
    founded_year: 1914,
    website_url: "https://pelforth.example",
    description: "Brasserie du Nord",
    ...overrides,
  };
}

function buildStyleDto(overrides: Partial<StyleReadDto> = {}): StyleReadDto {
  return {
    id: "5d6e7f80-aaaa-bbbb-cccc-ddddeeee0001",
    name: "Brune",
    slug: "brune",
    category: "Dark European Lager",
    family: "lager",
    abv_min: "4.5",
    abv_max: "6.0",
    ibu_min: 20,
    ibu_max: 30,
    srm_min: 17,
    srm_max: 30,
    ...overrides,
  };
}

function buildPageDto<TItem>(
  items: TItem[],
  meta: Partial<PageDto<TItem>["meta"]> = {},
): PageDto<TItem> {
  return {
    items,
    meta: { total: items.length, page: 1, per_page: 20, ...meta },
  };
}

describe("beer-catalog.mapper", () => {
  describe("happy: full mapping", () => {
    it("mapBeer parses Decimal-as-string abv, carries ADR-0017 bounds, passes denormalised names through", () => {
      const beer = mapBeer(buildBeerDto());

      expect(beer).toEqual({
        id: "ddc4c2bc-6f5b-4c2f-9f4d-7e0e0a8b1c2d",
        slug: "pelforth-brune",
        name: "Pelforth Brune",
        breweryId: "b1d2c3e4-1111-2222-3333-444455556666",
        styleId: "5d6e7f80-aaaa-bbbb-cccc-ddddeeee0001",
        breweryName: "Pelforth",
        styleName: "Brune",
        abv: 6.5,
        ibuMin: 20,
        ibuMax: 28,
        srmMin: 30,
        srmMax: 30,
        description: "Brune intense",
      });
    });

    it("mapBeerDetail widens the list mapping with the fiche-only fields", () => {
      const detail = mapBeerDetail(buildBeerDto());

      // List-level fields are identical to mapBeer.
      expect(detail).toMatchObject(mapBeer(buildBeerDto()));
      expect(detail.eanCode).toBe("3760231860119");
      expect(detail.legalDenomination).toBe("biere");
      expect(detail.countryOfOrigin).toBe("FR");
      expect(detail.allergens).toEqual(["gluten"]);
      expect(detail.alcoholGroup).toBe(3);
      expect(detail.isVerified).toBe(true);
      expect(detail.source).toBe("openfoodfacts");
      expect(detail.createdAt).toBe("2026-05-02T10:00:00.000Z");
      expect(detail.updatedAt).toBe("2026-05-02T10:00:00.000Z");
    });

    it("mapBrewery renames website_url → website (not just a casing change)", () => {
      const brewery = mapBrewery(buildBreweryDto());

      expect(brewery).toEqual({
        id: "b1d2c3e4-1111-2222-3333-444455556666",
        slug: "pelforth",
        name: "Pelforth",
        breweryType: "industrial",
        city: "Mons-en-Barœul",
        country: "FR",
        foundedYear: 1914,
        website: "https://pelforth.example",
        description: "Brasserie du Nord",
      });
    });

    it("mapStyle parses abv bounds from Decimal strings and keeps ibu/srm bounds numeric", () => {
      const style = mapStyle(buildStyleDto());

      expect(style).toEqual({
        id: "5d6e7f80-aaaa-bbbb-cccc-ddddeeee0001",
        slug: "brune",
        name: "Brune",
        category: "Dark European Lager",
        family: "lager",
        abvMin: 4.5,
        abvMax: 6,
        ibuMin: 20,
        ibuMax: 30,
        srmMin: 17,
        srmMax: 30,
      });
    });

    it("mapPage maps every item and renames meta.per_page → perPage", () => {
      const dto = buildPageDto([buildBeerDto()], {
        total: 45,
        page: 2,
        per_page: 20,
      });

      const page = mapPage(dto, mapBeer);

      expect(page.items).toHaveLength(1);
      expect(page.items[0].name).toBe("Pelforth Brune");
      expect(page.meta).toEqual({ total: 45, page: 2, perPage: 20 });
    });
  });

  describe("sad: all-nullable fields null", () => {
    it("mapBeer keeps null names null — never substitutes placeholder strings (view-model concern)", () => {
      const beer = mapBeer(
        buildBeerDto({
          brewery_id: null,
          style_id: null,
          brewery_name: null,
          style_name: null,
          abv: null,
          ibu_min: null,
          ibu_max: null,
          srm_min: null,
          srm_max: null,
          description: null,
        }),
      );

      expect(beer.breweryId).toBeNull();
      expect(beer.styleId).toBeNull();
      expect(beer.breweryName).toBeNull();
      expect(beer.styleName).toBeNull();
      expect(beer.abv).toBeNull();
      expect(beer.ibuMin).toBeNull();
      expect(beer.ibuMax).toBeNull();
      expect(beer.srmMin).toBeNull();
      expect(beer.srmMax).toBeNull();
      expect(beer.description).toBeNull();
      // Defensive: no fallback label leaked into the domain.
      expect(Object.values(beer)).not.toContain("Brasserie inconnue");
      expect(Object.values(beer)).not.toContain("Style inconnu");
    });

    it("mapBeerDetail keeps the fiche-only nullable fields null", () => {
      const detail = mapBeerDetail(
        buildBeerDto({
          ean_code: null,
          legal_denomination: null,
          country_of_origin: null,
          allergens: null,
          alcohol_group: null,
        }),
      );

      expect(detail.eanCode).toBeNull();
      expect(detail.legalDenomination).toBeNull();
      expect(detail.countryOfOrigin).toBeNull();
      expect(detail.allergens).toBeNull();
      expect(detail.alcoholGroup).toBeNull();
    });

    it("mapBrewery keeps all nullable fields null", () => {
      const brewery = mapBrewery(
        buildBreweryDto({
          brewery_type: null,
          city: null,
          country: null,
          founded_year: null,
          website_url: null,
          description: null,
        }),
      );

      expect(brewery.breweryType).toBeNull();
      expect(brewery.city).toBeNull();
      expect(brewery.country).toBeNull();
      expect(brewery.foundedYear).toBeNull();
      expect(brewery.website).toBeNull();
      expect(brewery.description).toBeNull();
    });

    it("mapStyle keeps all nullable bounds null", () => {
      const style = mapStyle(
        buildStyleDto({
          category: null,
          family: null,
          abv_min: null,
          abv_max: null,
          ibu_min: null,
          ibu_max: null,
          srm_min: null,
          srm_max: null,
        }),
      );

      expect(style.category).toBeNull();
      expect(style.family).toBeNull();
      expect(style.abvMin).toBeNull();
      expect(style.abvMax).toBeNull();
      expect(style.ibuMin).toBeNull();
      expect(style.ibuMax).toBeNull();
      expect(style.srmMin).toBeNull();
      expect(style.srmMax).toBeNull();
    });
  });

  describe("edge: toNumber and empty pages", () => {
    it("toNumber turns an unparsable string into null", () => {
      expect(toNumber("abc")).toBeNull();
    });

    it("toNumber turns an empty or blank string into null (not 0)", () => {
      expect(toNumber("")).toBeNull();
      expect(toNumber("  ")).toBeNull();
    });

    it('toNumber parses "0" as the number 0 (falsy but valid)', () => {
      expect(toNumber("0")).toBe(0);
    });

    it("toNumber keeps null as null", () => {
      expect(toNumber(null)).toBeNull();
    });

    it("mapPage maps an empty items array without touching meta.total", () => {
      const dto = buildPageDto<BeerReadDto>([], { total: 0, page: 1 });

      const page = mapPage(dto, mapBeer);

      expect(page.items).toEqual([]);
      expect(page.meta).toEqual({ total: 0, page: 1, perPage: 20 });
    });
  });
});

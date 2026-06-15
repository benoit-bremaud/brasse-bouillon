/**
 * View-model builder tests (`10-class-view-model.md`): derived scalars
 * (SRM→EBC, interval midpoint), French formatting (decimal comma), the
 * fallback labels for the known null-names divergence, tap targets, and
 * `toPlaceholderDetail` (cache-primed fiche placeholder).
 */
import { colors } from "@/core/theme";

import {
  ebcToHex,
  foregroundOnEbc,
} from "@/features/scan/application/lookup-color";

import {
  BREWERY_FALLBACK_LABEL,
  EMPTY_VALUE_LABEL,
  formatAbv,
  intervalMidpoint,
  srmToEbc,
  STYLE_FALLBACK_LABEL,
  toBeerDetailVM,
  toBeerListItemVM,
  toBreweryFicheVM,
  toStyleFicheVM,
} from "@/features/beer-catalog/application/beer-catalog.view-model";
import { toPlaceholderDetail } from "@/features/beer-catalog/application/use-beer-catalog-details";
import type {
  CatalogBeer,
  CatalogBeerDetail,
  CatalogBrewery,
  CatalogStyle,
} from "@/features/beer-catalog/domain/beer-catalog.types";

function buildCatalogBeer(overrides: Partial<CatalogBeer> = {}): CatalogBeer {
  return {
    id: "beer-1",
    slug: "pelforth-brune",
    name: "Pelforth Brune",
    breweryId: "brewery-1",
    styleId: "style-1",
    breweryName: "Pelforth",
    styleName: "Brune",
    abv: 6.5,
    ibuMin: 20,
    ibuMax: 28,
    srmMin: 30,
    srmMax: 30,
    description: "Brune intense",
    ...overrides,
  };
}

function buildCatalogBeerDetail(
  overrides: Partial<CatalogBeerDetail> = {},
): CatalogBeerDetail {
  return {
    ...buildCatalogBeer(),
    eanCode: "3760231860119",
    legalDenomination: "biere",
    countryOfOrigin: "FR",
    allergens: ["gluten"],
    alcoholGroup: 3,
    isVerified: true,
    source: "openfoodfacts",
    createdAt: "2026-05-02T10:00:00.000Z",
    updatedAt: "2026-05-02T10:00:00.000Z",
    ...overrides,
  };
}

function buildCatalogBrewery(
  overrides: Partial<CatalogBrewery> = {},
): CatalogBrewery {
  return {
    id: "brewery-1",
    slug: "pelforth",
    name: "Pelforth",
    breweryType: "industrial",
    city: "Mons-en-Barœul",
    country: "FR",
    foundedYear: 1914,
    website: "https://pelforth.example",
    description: "Brasserie du Nord",
    ...overrides,
  };
}

function buildCatalogStyle(
  overrides: Partial<CatalogStyle> = {},
): CatalogStyle {
  return {
    id: "style-1",
    slug: "brune",
    name: "Brune",
    category: "Dark European Lager",
    family: "lager",
    abvMin: 4.5,
    abvMax: 5.5,
    ibuMin: 20,
    ibuMax: 30,
    srmMin: 17,
    srmMax: 30,
    ...overrides,
  };
}

describe("beer-catalog.view-model", () => {
  describe("happy: toBeerListItemVM", () => {
    it("builds the full list row from a fully-populated beer", () => {
      const vm = toBeerListItemVM(buildCatalogBeer());

      expect(vm.id).toBe("beer-1");
      expect(vm.title).toBe("Pelforth Brune");
      expect(vm.subtitle).toBe("Pelforth · Brune");
      expect(vm.abvLabel).toBe("6,5 %"); // French decimal comma
      expect(vm.ibuLabel).toBe("20–28");
    });

    it("derives the hero colours from the SRM midpoint converted to EBC", () => {
      // srm 30/30 → midpoint 30 → EBC round(30 × 1.97) = 59.
      const vm = toBeerListItemVM(buildCatalogBeer());

      expect(vm.heroColorHex).toBe(ebcToHex(59));
      expect(vm.foregroundHex).toBe(foregroundOnEbc(59));
    });
  });

  describe("happy: toBeerDetailVM", () => {
    it("computes colorLabel as an EBC range from the SRM bounds (×1.97, rounded)", () => {
      const vm = toBeerDetailVM(
        buildCatalogBeerDetail({ srmMin: 4, srmMax: 8 }),
      );

      // round(4 × 1.97) = 8, round(8 × 1.97) = 16.
      expect(vm.colorLabel).toBe("EBC 8–16");
    });

    it("collapses an exact SRM interval to a single EBC value", () => {
      const vm = toBeerDetailVM(buildCatalogBeerDetail());

      expect(vm.colorLabel).toBe("EBC 59");
    });

    it("builds tap targets routing to the brewery and style fiches", () => {
      const vm = toBeerDetailVM(buildCatalogBeerDetail());

      expect(vm.breweryTap).toEqual({
        id: "brewery-1",
        label: "Pelforth",
        route: "/(app)/beer-catalog/brewery/brewery-1",
      });
      expect(vm.styleTap).toEqual({
        id: "style-1",
        label: "Brune",
        route: "/(app)/beer-catalog/style/style-1",
      });
    });

    it("carries the legal block and the verified badge", () => {
      const vm = toBeerDetailVM(buildCatalogBeerDetail());

      expect(vm.legal).toEqual({
        denomination: "biere",
        country: "FR",
        allergens: ["gluten"],
        alcoholGroupLabel: "Groupe 3",
      });
      expect(vm.isVerifiedBadge).toBe(true);
    });

    it.each([
      ["openfoodfacts", "Open Food Facts"],
      ["internal", "Corpus interne"],
      ["community", "Communauté"],
    ])("maps source %s to label %s", (source, label) => {
      const vm = toBeerDetailVM(buildCatalogBeerDetail({ source }));

      expect(vm.sourceLabel).toBe(label);
    });

    it("returns a null sourceLabel for an unknown source", () => {
      const vm = toBeerDetailVM(
        buildCatalogBeerDetail({ source: "mystery-crawler" }),
      );

      expect(vm.sourceLabel).toBeNull();
    });
  });

  describe("sad: nullable fields fall back", () => {
    it("substitutes the fallback labels for null brewery/style names in the list row", () => {
      const vm = toBeerListItemVM(
        buildCatalogBeer({ breweryName: null, styleName: null }),
      );

      expect(vm.subtitle).toBe(
        `${BREWERY_FALLBACK_LABEL} · ${STYLE_FALLBACK_LABEL}`,
      );
    });

    it("renders the empty label for null abv and null ibu bounds", () => {
      const vm = toBeerListItemVM(
        buildCatalogBeer({ abv: null, ibuMin: null, ibuMax: null }),
      );

      expect(vm.abvLabel).toBe(EMPTY_VALUE_LABEL);
      expect(vm.ibuLabel).toBe(EMPTY_VALUE_LABEL);
    });

    it("falls back to brand-coherent hero colours when SRM is unknown", () => {
      const vm = toBeerListItemVM(
        buildCatalogBeer({ srmMin: null, srmMax: null }),
      );

      expect(vm.heroColorHex).toBe(colors.brand.primary);
      expect(vm.foregroundHex).toBe(colors.neutral.white);
    });

    it("omits the tap targets when the related ids are null", () => {
      const vm = toBeerDetailVM(
        buildCatalogBeerDetail({ breweryId: null, styleId: null }),
      );

      expect(vm.breweryTap).toBeUndefined();
      expect(vm.styleTap).toBeUndefined();
    });

    it("labels the taps with fallback names when ids exist but names are null", () => {
      const vm = toBeerDetailVM(
        buildCatalogBeerDetail({ breweryName: null, styleName: null }),
      );

      expect(vm.breweryName).toBe(BREWERY_FALLBACK_LABEL);
      expect(vm.styleName).toBe(STYLE_FALLBACK_LABEL);
      expect(vm.breweryTap?.label).toBe(BREWERY_FALLBACK_LABEL);
      expect(vm.styleTap?.label).toBe(STYLE_FALLBACK_LABEL);
    });

    it("normalises null allergens to an empty array and keeps null legal fields null", () => {
      const vm = toBeerDetailVM(
        buildCatalogBeerDetail({
          legalDenomination: null,
          countryOfOrigin: null,
          allergens: null,
          alcoholGroup: null,
          srmMin: null,
          srmMax: null,
        }),
      );

      expect(vm.legal).toEqual({
        denomination: null,
        country: null,
        allergens: [],
        alcoholGroupLabel: null,
      });
      expect(vm.colorLabel).toBe(EMPTY_VALUE_LABEL);
    });
  });

  describe("edge: pure helpers", () => {
    it("srmToEbc maps null to null and multiplies by 1.97 rounded", () => {
      expect(srmToEbc(null)).toBeNull();
      expect(srmToEbc(30)).toBe(59); // 59.1 → 59
      expect(srmToEbc(0)).toBe(0);
    });

    it("intervalMidpoint degrades gracefully on partial bounds", () => {
      expect(intervalMidpoint(null, 28)).toBe(28);
      expect(intervalMidpoint(20, null)).toBe(20);
      expect(intervalMidpoint(20, 28)).toBe(24);
      expect(intervalMidpoint(null, null)).toBeNull();
    });

    it("formatAbv renders 0 as a real value, not the empty label", () => {
      expect(formatAbv(0)).toBe("0 %");
      expect(formatAbv(null)).toBe(EMPTY_VALUE_LABEL);
      expect(formatAbv(6.5)).toBe("6,5 %");
    });
  });

  describe("toBreweryFicheVM", () => {
    it("happy: joins city and country and formats the founding year", () => {
      const vm = toBreweryFicheVM(buildCatalogBrewery());

      expect(vm).toEqual({
        title: "Pelforth",
        typeLabel: "industrial",
        locationLabel: "Mons-en-Barœul, FR",
        foundedLabel: "Fondée en 1914",
        website: "https://pelforth.example",
        description: "Brasserie du Nord",
      });
    });

    it("sad: keeps a lone location part without a dangling comma", () => {
      expect(
        toBreweryFicheVM(buildCatalogBrewery({ country: null })).locationLabel,
      ).toBe("Mons-en-Barœul");
      expect(
        toBreweryFicheVM(buildCatalogBrewery({ city: null })).locationLabel,
      ).toBe("FR");
    });

    it("edge: all-null optional fields produce null labels", () => {
      const vm = toBreweryFicheVM(
        buildCatalogBrewery({
          breweryType: null,
          city: null,
          country: null,
          foundedYear: null,
          website: null,
          description: null,
        }),
      );

      expect(vm.typeLabel).toBeNull();
      expect(vm.locationLabel).toBeNull();
      expect(vm.foundedLabel).toBeNull();
      expect(vm.website).toBeNull();
      expect(vm.description).toBeNull();
    });
  });

  describe("toStyleFicheVM", () => {
    it("happy: formats the abv range with a French decimal comma and percent sign", () => {
      const vm = toStyleFicheVM(buildCatalogStyle());

      expect(vm.title).toBe("Brune");
      expect(vm.categoryLabel).toBe("Dark European Lager");
      expect(vm.familyLabel).toBe("lager");
      expect(vm.abvRangeLabel).toBe("4,5–5,5 %");
      expect(vm.ibuRangeLabel).toBe("20–30");
      // round(17 × 1.97) = 33, round(30 × 1.97) = 59.
      expect(vm.colorRangeLabel).toBe("EBC 33–59");
    });

    it("sad: collapses an exact abv interval to a single value", () => {
      const vm = toStyleFicheVM(buildCatalogStyle({ abvMin: 5, abvMax: 5 }));

      expect(vm.abvRangeLabel).toBe("5 %");
    });

    it("edge: null when both bounds of a range are null", () => {
      const vm = toStyleFicheVM(
        buildCatalogStyle({
          abvMin: null,
          abvMax: null,
          ibuMin: null,
          ibuMax: null,
          srmMin: null,
          srmMax: null,
        }),
      );

      expect(vm.abvRangeLabel).toBeNull();
      expect(vm.ibuRangeLabel).toBeNull();
      expect(vm.colorRangeLabel).toBeNull();
    });
  });

  describe("toPlaceholderDetail (cache-primed fiche)", () => {
    it("widens a CatalogBeer with neutral detail fields", () => {
      const beer = buildCatalogBeer();

      const placeholder = toPlaceholderDetail(beer);

      // List-level fields are carried unchanged…
      expect(placeholder).toMatchObject(beer);
      // …and the fiche-only fields are neutral, never fabricated.
      expect(placeholder.eanCode).toBeNull();
      expect(placeholder.legalDenomination).toBeNull();
      expect(placeholder.countryOfOrigin).toBeNull();
      expect(placeholder.allergens).toBeNull();
      expect(placeholder.alcoholGroup).toBeNull();
      expect(placeholder.isVerified).toBe(false);
      expect(placeholder.source).toBe("");
      expect(placeholder.createdAt).toBe("");
      expect(placeholder.updatedAt).toBe("");
    });

    it("renders as a valid detail VM (no badge, no source label) while loading", () => {
      const vm = toBeerDetailVM(toPlaceholderDetail(buildCatalogBeer()));

      expect(vm.isVerifiedBadge).toBe(false);
      expect(vm.sourceLabel).toBeNull();
      expect(vm.legal.allergens).toEqual([]);
    });
  });
});

/**
 * Pure tests of the 1-based pagination math behind the infinite scroll
 * (`computeNextPageParam`): `page × perPage < total ⇒ page + 1`, else
 * `undefined` (TanStack reads undefined as hasNextPage === false).
 */
import type {
  CatalogBeer,
  Page,
} from "@/features/beer-catalog/domain/beer-catalog.types";

import {
  computeNextPageParam,
  FIRST_PAGE,
  MIN_SEARCH_LENGTH,
} from "@/features/beer-catalog/application/use-beer-catalog-pagination";

function buildPage(meta: {
  total: number;
  page: number;
  perPage: number;
}): Page<CatalogBeer> {
  // Items are irrelevant to the math — meta.total bounds the pagination.
  return { items: [], meta };
}

describe("use-beer-catalog-pagination / computeNextPageParam", () => {
  describe("happy: more results remain", () => {
    it("returns 2 after page 1 of 45 results at 20 per page", () => {
      expect(
        computeNextPageParam(buildPage({ total: 45, page: 1, perPage: 20 })),
      ).toBe(2);
    });

    it("returns 3 after page 2 when one result overflows (41 results)", () => {
      expect(
        computeNextPageParam(buildPage({ total: 41, page: 2, perPage: 20 })),
      ).toBe(3);
    });
  });

  describe("sad: the catalogue is exhausted", () => {
    it("returns undefined after the last partial page (45 results, page 3)", () => {
      expect(
        computeNextPageParam(buildPage({ total: 45, page: 3, perPage: 20 })),
      ).toBeUndefined();
    });

    it("returns undefined on an empty catalogue (total 0)", () => {
      expect(
        computeNextPageParam(buildPage({ total: 0, page: 1, perPage: 20 })),
      ).toBeUndefined();
    });

    it("returns undefined when everything fits on the first page (12 results)", () => {
      expect(
        computeNextPageParam(buildPage({ total: 12, page: 1, perPage: 20 })),
      ).toBeUndefined();
    });
  });

  describe("edge: exact boundary", () => {
    it("returns undefined when page × perPage equals total exactly (40 results, page 2)", () => {
      expect(
        computeNextPageParam(buildPage({ total: 40, page: 2, perPage: 20 })),
      ).toBeUndefined();
    });
  });

  describe("exported constants (UC2 extension 1a)", () => {
    it("pagination starts at page 1 and search requires at least 2 characters", () => {
      expect(FIRST_PAGE).toBe(1);
      expect(MIN_SEARCH_LENGTH).toBe(2);
    });
  });
});

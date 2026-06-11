/**
 * The ONE paginated hook serving both browse (UC1) and search (UC2), per
 * the conception (`mobile-catalog/02-sequence-browse.md`, `03-sequence-search.md`):
 * only the query key and endpoint differ between the two modes.
 */
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import {
  listBeers,
  searchBeers,
} from "@/features/beer-catalog/application/beer-catalog.use-cases";
import type { Page } from "@/features/beer-catalog/domain/beer-catalog.types";

export const FIRST_PAGE = 1;
/** UC2 extension 1a: below this length no request is made (also avoids the API 422 on empty q). */
export const MIN_SEARCH_LENGTH = 2;

/**
 * 1-based pagination math, pure and unit-tested in isolation:
 * `page × perPage < total ⇒ page + 1`, otherwise `undefined`
 * (⇒ `hasNextPage === false`, the infinite scroll stops). `meta.total`
 * is what bounds the pagination — the API has no next/prev links.
 */
export function computeNextPageParam<T>(lastPage: Page<T>): number | undefined {
  const { total, page, perPage } = lastPage.meta;
  // Defensive: the API guarantees page ≥ 1 and per_page ≥ 1, but malformed
  // meta (perPage 0) would otherwise paginate forever (0 < total is always true).
  if (page <= 0 || perPage <= 0) {
    return undefined;
  }
  return page * perPage < total ? page + 1 : undefined;
}

export type UseBeerCatalogPaginationArgs =
  | { mode: "browse" }
  | { mode: "search"; query: string };

export function useBeerCatalogPagination(args: UseBeerCatalogPaginationArgs) {
  const trimmed = args.mode === "search" ? args.query.trim() : "";
  const isSearch = args.mode === "search";
  const searchReady = trimmed.length >= MIN_SEARCH_LENGTH;

  return useInfiniteQuery({
    queryKey: isSearch
      ? ["beer-catalog", "search", trimmed]
      : ["beer-catalog", "browse"],
    queryFn: ({ pageParam, signal }) =>
      isSearch
        ? searchBeers(trimmed, pageParam, signal)
        : listBeers(pageParam, signal),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (lastPage) => computeNextPageParam(lastPage),
    // Keep the previous results painted while a new debounced term loads
    // (no empty flash); the superseded key's result is simply ignored.
    placeholderData: keepPreviousData,
    enabled: !isSearch || searchReady,
    select: (data) => ({
      beers: data.pages.flatMap((page) => page.items),
    }),
  });
}

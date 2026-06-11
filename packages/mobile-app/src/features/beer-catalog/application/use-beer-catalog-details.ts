/**
 * Detail hooks for the catalogue fiches (UC3). `useBeer` primes its
 * render from the list row already in cache (conception
 * `mobile-catalog/04-sequence-fiche.md`): the screen paints the partial
 * fiche immediately while `GET /beers/{id}` completes the heavy fields —
 * `isPlaceholderData` tells the screen to hold the detail-only sections.
 */
import {
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import {
  getBeer,
  getBrewery,
  getStyle,
} from "@/features/beer-catalog/application/beer-catalog.use-cases";
import type {
  CatalogBeer,
  CatalogBeerDetail,
  Page,
} from "@/features/beer-catalog/domain/beer-catalog.types";

function findCachedCatalogBeer(
  queryClient: QueryClient,
  beerId: string,
): CatalogBeer | undefined {
  const entries = queryClient.getQueriesData<InfiniteData<Page<CatalogBeer>>>({
    queryKey: ["beer-catalog"],
  });
  for (const [key, data] of entries) {
    const kind = key[1];
    if ((kind !== "browse" && kind !== "search") || !data) {
      continue;
    }
    for (const page of data.pages) {
      const found = page.items.find((beer) => beer.id === beerId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Widens a cached list row into a placeholder fiche with neutral
 * detail fields. Only ever rendered while `isPlaceholderData` is true.
 */
export function toPlaceholderDetail(beer: CatalogBeer): CatalogBeerDetail {
  return {
    ...beer,
    eanCode: null,
    legalDenomination: null,
    countryOfOrigin: null,
    allergens: null,
    alcoholGroup: null,
    isVerified: false,
    source: "",
    createdAt: "",
    updatedAt: "",
  };
}

export function useBeer(beerId: string) {
  const queryClient = useQueryClient();
  return useQuery<CatalogBeerDetail | null>({
    queryKey: ["beer-catalog", "beer", beerId],
    queryFn: ({ signal }) => getBeer(beerId, signal),
    enabled: beerId.trim().length > 0,
    placeholderData: () => {
      const cached = findCachedCatalogBeer(queryClient, beerId);
      return cached ? toPlaceholderDetail(cached) : undefined;
    },
  });
}

export function useBrewery(breweryId: string) {
  return useQuery({
    queryKey: ["beer-catalog", "brewery", breweryId],
    queryFn: ({ signal }) => getBrewery(breweryId, signal),
    enabled: breweryId.trim().length > 0,
  });
}

export function useStyle(styleId: string) {
  return useQuery({
    queryKey: ["beer-catalog", "style", styleId],
    queryFn: ({ signal }) => getStyle(styleId, signal),
    enabled: styleId.trim().length > 0,
  });
}

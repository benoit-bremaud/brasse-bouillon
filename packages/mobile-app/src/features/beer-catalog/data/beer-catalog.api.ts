/**
 * Encyclopedia catalogue endpoints (public reads, ADR-0005): the mobile
 * reads beer facts straight from the Python backend with `auth: false` on
 * `baseUrl: env.encyclopediaUrl`. Single egress through `request()` — never
 * a direct `fetch`. Conforms to the conception sequences
 * (`docs/architecture/diagrams/mobile-catalog/02..05`).
 */
import { env } from "@/core/config/env";
import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";

import { rethrowCatalogError } from "@/features/beer-catalog/data/beer-catalog.errors";
import {
  mapBeer,
  mapBeerDetail,
  mapBrewery,
  mapPage,
  mapStyle,
  type BeerReadDto,
  type BreweryReadDto,
  type PageDto,
  type StyleReadDto,
} from "@/features/beer-catalog/data/beer-catalog.mapper";
import type {
  CatalogBeer,
  CatalogBeerDetail,
  CatalogBrewery,
  CatalogStyle,
  Page,
} from "@/features/beer-catalog/domain/beer-catalog.types";

export const CATALOG_PER_PAGE = 20;

/**
 * Fail fast when the bundle was built without the encyclopedia URL
 * (same guard as the scan feature) instead of timing out on the
 * localhost fallback from a physical device.
 */
function assertEncyclopediaConfigured(): void {
  if (!env.encyclopediaUrlIsConfigured) {
    throw new HttpError(
      503,
      "Beer encyclopedia backend not configured (EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL).",
      null,
    );
  }
}

async function encyclopediaGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  assertEncyclopediaConfigured();
  return request<T>(path, {
    auth: false,
    baseUrl: env.encyclopediaUrl,
    signal,
  });
}

export async function fetchBeersPage(
  page: number,
  signal?: AbortSignal,
): Promise<Page<CatalogBeer>> {
  try {
    const dto = await encyclopediaGet<PageDto<BeerReadDto>>(
      `/beers?page=${page}&per_page=${CATALOG_PER_PAGE}`,
      signal,
    );
    return mapPage(dto, mapBeer);
  } catch (error) {
    rethrowCatalogError(error);
  }
}

export async function searchBeersPage(
  q: string,
  page: number,
  signal?: AbortSignal,
): Promise<Page<CatalogBeer>> {
  try {
    const dto = await encyclopediaGet<PageDto<BeerReadDto>>(
      `/beers/search?q=${encodeURIComponent(q)}&page=${page}&per_page=${CATALOG_PER_PAGE}`,
      signal,
    );
    return mapPage(dto, mapBeer);
  } catch (error) {
    rethrowCatalogError(error);
  }
}

export async function fetchBeerById(
  id: string,
  signal?: AbortSignal,
): Promise<CatalogBeerDetail> {
  try {
    const dto = await encyclopediaGet<BeerReadDto>(
      `/beers/${encodeURIComponent(id)}`,
      signal,
    );
    return mapBeerDetail(dto);
  } catch (error) {
    rethrowCatalogError(error);
  }
}

export async function fetchBreweryById(
  id: string,
  signal?: AbortSignal,
): Promise<CatalogBrewery> {
  try {
    const dto = await encyclopediaGet<BreweryReadDto>(
      `/breweries/${encodeURIComponent(id)}`,
      signal,
    );
    return mapBrewery(dto);
  } catch (error) {
    rethrowCatalogError(error);
  }
}

export async function fetchStyleById(
  id: string,
  signal?: AbortSignal,
): Promise<CatalogStyle> {
  try {
    const dto = await encyclopediaGet<StyleReadDto>(
      `/styles/${encodeURIComponent(id)}`,
      signal,
    );
    return mapStyle(dto);
  } catch (error) {
    rethrowCatalogError(error);
  }
}

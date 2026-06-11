/**
 * Catalogue use-cases — thin orchestration over the data layer, names per
 * the conception component diagram (`mobile-catalog/06-component.md`).
 * No demo-data branch: the encyclopedia has no demo dataset (same as the
 * scan import path); screens always read the live public API.
 */
import {
  fetchBeerById,
  fetchBeersPage,
  fetchBreweryById,
  fetchStyleById,
  searchBeersPage,
} from "@/features/beer-catalog/data/beer-catalog.api";
import type {
  CatalogBeer,
  CatalogBeerDetail,
  CatalogBrewery,
  CatalogStyle,
  Page,
} from "@/features/beer-catalog/domain/beer-catalog.types";

// Re-exported so the presentation layer can discriminate catalogue errors
// without importing from data/ (dependency rule: presentation → application).
export {
  CatalogNotFoundError,
  CatalogUnavailableError,
} from "@/features/beer-catalog/data/beer-catalog.errors";

export async function listBeers(
  page: number,
  signal?: AbortSignal,
): Promise<Page<CatalogBeer>> {
  return fetchBeersPage(page, signal);
}

export async function searchBeers(
  q: string,
  page: number,
  signal?: AbortSignal,
): Promise<Page<CatalogBeer>> {
  return searchBeersPage(q, page, signal);
}

export async function getBeer(
  id: string,
  signal?: AbortSignal,
): Promise<CatalogBeerDetail | null> {
  const trimmed = id.trim();
  if (!trimmed) {
    return null;
  }
  return fetchBeerById(trimmed, signal);
}

export async function getBrewery(
  id: string,
  signal?: AbortSignal,
): Promise<CatalogBrewery | null> {
  const trimmed = id.trim();
  if (!trimmed) {
    return null;
  }
  return fetchBreweryById(trimmed, signal);
}

export async function getStyle(
  id: string,
  signal?: AbortSignal,
): Promise<CatalogStyle | null> {
  const trimmed = id.trim();
  if (!trimmed) {
    return null;
  }
  return fetchStyleById(trimmed, signal);
}

import {
  getMaltDetailsApi,
  listMaltsApi,
} from "@/features/ingredients/data/malts.api";
import {
  MaltFilters,
  MaltProduct,
} from "@/features/ingredients/domain/malt.types";

import { dataSource } from "@/core/data/data-source";
import { demoMalts } from "@/mocks/demo-data";

function normalizeSearch(search?: string): string {
  return search?.trim().toLocaleLowerCase() ?? "";
}

function normalizeFilters(filters?: MaltFilters | string): MaltFilters {
  if (typeof filters === "string") {
    return { search: filters };
  }

  return filters ?? {};
}

function parseNumericValue(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function getColorEbc(malt: MaltProduct): number | null {
  for (const group of malt.specGroups) {
    for (const row of group.rows) {
      const normalizedLabel = row.label.toLocaleLowerCase();
      const normalizedUnit = row.unit?.toLocaleLowerCase();

      if (!normalizedLabel.includes("color")) {
        continue;
      }

      if (normalizedUnit && normalizedUnit !== "ebc") {
        continue;
      }

      const color = parseNumericValue(row.value);
      if (color !== null) {
        return color;
      }
    }
  }

  return null;
}

export async function listMalts(
  filters?: MaltFilters | string,
): Promise<MaltProduct[]> {
  const normalizedFilters = normalizeFilters(filters);
  const normalizedSearch = normalizeSearch(normalizedFilters.search);
  const sourceItems = dataSource.useDemoData ? demoMalts : await listMaltsApi();

  const searchFilteredItems = normalizedSearch
    ? sourceItems.filter((malt) => {
        const searchableChunks = [malt.name, malt.brand, malt.maltType]
          .filter((value): value is string => Boolean(value))
          .map((value) => value.toLocaleLowerCase());

        return searchableChunks.some((value) =>
          value.includes(normalizedSearch),
        );
      })
    : sourceItems;

  if (
    normalizedFilters.colorEbcMin === undefined &&
    normalizedFilters.colorEbcMax === undefined
  ) {
    return searchFilteredItems;
  }

  return searchFilteredItems.filter((malt) => {
    const colorEbc = getColorEbc(malt);
    if (colorEbc === null) {
      return false;
    }

    if (
      normalizedFilters.colorEbcMin !== undefined &&
      colorEbc < normalizedFilters.colorEbcMin
    ) {
      return false;
    }

    if (
      normalizedFilters.colorEbcMax !== undefined &&
      colorEbc > normalizedFilters.colorEbcMax
    ) {
      return false;
    }

    return true;
  });
}

export async function getMaltDetails(
  maltId: string,
): Promise<MaltProduct | null> {
  if (!maltId) {
    return null;
  }

  if (dataSource.useDemoData) {
    return demoMalts.find((malt) => malt.id === maltId) ?? null;
  }

  return getMaltDetailsApi(maltId);
}

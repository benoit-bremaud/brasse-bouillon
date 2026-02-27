import {
  getMaltDetailsApi,
  listMaltsApi,
} from "@/features/ingredients/data/malts.api";

import { dataSource } from "@/core/data/data-source";
import { MaltProduct } from "@/features/ingredients/domain/malt.types";
import { demoMalts } from "@/mocks/demo-data";

function normalizeSearch(search?: string): string {
  return search?.trim().toLocaleLowerCase() ?? "";
}

export async function listMalts(search?: string): Promise<MaltProduct[]> {
  const normalizedSearch = normalizeSearch(search);
  const sourceItems = dataSource.useDemoData ? demoMalts : await listMaltsApi();

  if (!normalizedSearch) {
    return sourceItems;
  }

  return sourceItems.filter((malt) => {
    const searchableChunks = [malt.name, malt.brand, malt.maltType]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.toLocaleLowerCase());

    return searchableChunks.some((value) => value.includes(normalizedSearch));
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

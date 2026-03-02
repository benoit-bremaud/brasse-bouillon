import {
  getHopDetailsApi,
  listHopsApi,
} from "@/features/ingredients/data/hops.api";
import {
  HopFilters,
  HopProduct,
} from "@/features/ingredients/domain/hop.types";

import { dataSource } from "@/core/data/data-source";
import { demoHops } from "@/mocks/demo-data";

function normalizeSearch(search?: string): string {
  return search?.trim().toLocaleLowerCase() ?? "";
}

function normalizeFilters(filters?: HopFilters | string): HopFilters {
  if (typeof filters === "string") {
    return { search: filters };
  }

  return filters ?? {};
}

function parseNumericValue(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRangeAverage(value: string): number | null {
  if (!value.includes("-")) {
    return parseNumericValue(value);
  }

  const [minRaw, maxRaw] = value.split("-");
  const minValue = parseNumericValue(minRaw);
  const maxValue = parseNumericValue(maxRaw);

  if (minValue === null || maxValue === null) {
    return null;
  }

  return (minValue + maxValue) / 2;
}

function getAlphaAcid(hop: HopProduct): number | null {
  for (const group of hop.specGroups) {
    for (const row of group.rows) {
      const normalizedLabel = row.label.toLocaleLowerCase();
      const normalizedUnit = row.unit?.toLocaleLowerCase();

      if (!normalizedLabel.includes("alpha")) {
        continue;
      }

      if (normalizedUnit && !normalizedUnit.includes("%")) {
        continue;
      }

      const alphaAcid = parseRangeAverage(row.value);
      if (alphaAcid !== null) {
        return alphaAcid;
      }
    }
  }

  return null;
}

function getNormalizedHopType(hop: HopProduct): string {
  return hop.hopType?.trim().toLocaleLowerCase() ?? "";
}

export async function listHops(
  filters?: HopFilters | string,
): Promise<HopProduct[]> {
  const normalizedFilters = normalizeFilters(filters);
  const normalizedSearch = normalizeSearch(normalizedFilters.search);
  const sourceItems = dataSource.useDemoData ? demoHops : await listHopsApi();

  const searchFilteredItems = normalizedSearch
    ? sourceItems.filter((hop) => {
        const searchableChunks = [hop.name, hop.brand, hop.hopType]
          .filter((value): value is string => Boolean(value))
          .map((value) => value.toLocaleLowerCase());

        return searchableChunks.some((value) =>
          value.includes(normalizedSearch),
        );
      })
    : sourceItems;

  if (
    normalizedFilters.alphaAcidMin === undefined &&
    normalizedFilters.alphaAcidMax === undefined
  ) {
    return searchFilteredItems;
  }

  return searchFilteredItems.filter((hop) => {
    const alphaAcid = getAlphaAcid(hop);
    if (alphaAcid === null) {
      return false;
    }

    if (
      normalizedFilters.alphaAcidMin !== undefined &&
      alphaAcid < normalizedFilters.alphaAcidMin
    ) {
      return false;
    }

    if (
      normalizedFilters.alphaAcidMax !== undefined &&
      alphaAcid > normalizedFilters.alphaAcidMax
    ) {
      return false;
    }

    return true;
  });
}

export async function getHopDetails(hopId: string): Promise<HopProduct | null> {
  if (!hopId) {
    return null;
  }

  if (dataSource.useDemoData) {
    return demoHops.find((hop) => hop.id === hopId) ?? null;
  }

  return getHopDetailsApi(hopId);
}

export async function listAlternativeHops(
  hopId: string,
  limit = 3,
): Promise<HopProduct[]> {
  if (!hopId) {
    return [];
  }

  const targetHop = await getHopDetails(hopId);
  if (!targetHop) {
    return [];
  }

  const normalizedTargetType = getNormalizedHopType(targetHop);
  const targetAlphaAcid = getAlphaAcid(targetHop);
  const allHops = await listHops();

  const rankedAlternatives = allHops
    .filter((candidate) => candidate.id !== hopId)
    .map((candidate) => {
      const normalizedCandidateType = getNormalizedHopType(candidate);
      const isSameType =
        normalizedTargetType.length > 0 &&
        normalizedCandidateType === normalizedTargetType;
      const candidateAlphaAcid = getAlphaAcid(candidate);
      const alphaDistance =
        targetAlphaAcid !== null && candidateAlphaAcid !== null
          ? Math.abs(candidateAlphaAcid - targetAlphaAcid)
          : Number.POSITIVE_INFINITY;

      return {
        candidate,
        isSameType,
        alphaDistance,
      };
    })
    .sort((left, right) => {
      if (left.isSameType !== right.isSameType) {
        return left.isSameType ? -1 : 1;
      }

      if (left.alphaDistance !== right.alphaDistance) {
        return left.alphaDistance - right.alphaDistance;
      }

      return left.candidate.name.localeCompare(right.candidate.name);
    });

  const normalizedLimit = Math.max(0, limit);

  return rankedAlternatives
    .slice(0, normalizedLimit)
    .map((item) => item.candidate);
}

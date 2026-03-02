import {
  getYeastDetailsApi,
  listYeastsApi,
} from "@/features/ingredients/data/yeasts.api";
import {
  YeastFilters,
  YeastProduct,
} from "@/features/ingredients/domain/yeast.types";

import { dataSource } from "@/core/data/data-source";
import { demoYeasts } from "@/mocks/demo-data";

function normalizeSearch(search?: string): string {
  return search?.trim().toLocaleLowerCase() ?? "";
}

function normalizeFilters(filters?: YeastFilters | string): YeastFilters {
  if (typeof filters === "string") {
    return { search: filters };
  }

  return filters ?? {};
}

function parseNumericValue(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function getAttenuation(yeast: YeastProduct): number | null {
  for (const group of yeast.specGroups) {
    for (const row of group.rows) {
      const normalizedLabel = row.label.toLocaleLowerCase();
      const normalizedUnit = row.unit?.toLocaleLowerCase();

      if (!normalizedLabel.includes("attenuation")) {
        continue;
      }

      if (normalizedUnit && !normalizedUnit.includes("%")) {
        continue;
      }

      // Handle range values like "78-82"
      const value = row.value;
      if (value.includes("-")) {
        const [min, max] = value.split("-");
        const minValue = parseNumericValue(min);
        const maxValue = parseNumericValue(max);
        if (minValue !== null && maxValue !== null) {
          return (minValue + maxValue) / 2; // Return average
        }
      } else {
        const attenuation = parseNumericValue(value);
        if (attenuation !== null) {
          return attenuation;
        }
      }
    }
  }

  return null;
}

function getNormalizedYeastType(yeast: YeastProduct): string {
  return yeast.yeastType?.trim().toLocaleLowerCase() ?? "";
}

export async function listYeasts(
  filters?: YeastFilters | string,
): Promise<YeastProduct[]> {
  const normalizedFilters = normalizeFilters(filters);
  const normalizedSearch = normalizeSearch(normalizedFilters.search);
  const sourceItems = dataSource.useDemoData
    ? demoYeasts
    : await listYeastsApi();

  const searchFilteredItems = normalizedSearch
    ? sourceItems.filter((yeast) => {
        const searchableChunks = [yeast.name, yeast.brand, yeast.yeastType]
          .filter((value): value is string => Boolean(value))
          .map((value) => value.toLocaleLowerCase());

        return searchableChunks.some((value) =>
          value.includes(normalizedSearch),
        );
      })
    : sourceItems;

  if (
    normalizedFilters.attenuationMin === undefined &&
    normalizedFilters.attenuationMax === undefined
  ) {
    return searchFilteredItems;
  }

  return searchFilteredItems.filter((yeast) => {
    const attenuation = getAttenuation(yeast);
    if (attenuation === null) {
      return false;
    }

    if (
      normalizedFilters.attenuationMin !== undefined &&
      attenuation < normalizedFilters.attenuationMin
    ) {
      return false;
    }

    if (
      normalizedFilters.attenuationMax !== undefined &&
      attenuation > normalizedFilters.attenuationMax
    ) {
      return false;
    }

    return true;
  });
}

export async function getYeastDetails(
  yeastId: string,
): Promise<YeastProduct | null> {
  if (!yeastId) {
    return null;
  }

  if (dataSource.useDemoData) {
    return demoYeasts.find((yeast) => yeast.id === yeastId) ?? null;
  }

  return getYeastDetailsApi(yeastId);
}

export async function listAlternativeYeasts(
  yeastId: string,
  limit = 3,
): Promise<YeastProduct[]> {
  if (!yeastId) {
    return [];
  }

  const targetYeast = await getYeastDetails(yeastId);
  if (!targetYeast) {
    return [];
  }

  const normalizedTargetType = getNormalizedYeastType(targetYeast);
  const targetAttenuation = getAttenuation(targetYeast);
  const allYeasts = await listYeasts();

  const rankedAlternatives = allYeasts
    .filter((candidate) => candidate.id !== yeastId)
    .map((candidate) => {
      const normalizedCandidateType = getNormalizedYeastType(candidate);
      const isSameType =
        normalizedTargetType.length > 0 &&
        normalizedCandidateType === normalizedTargetType;
      const candidateAttenuation = getAttenuation(candidate);
      const attenuationDistance =
        targetAttenuation !== null && candidateAttenuation !== null
          ? Math.abs(candidateAttenuation - targetAttenuation)
          : Number.POSITIVE_INFINITY;

      return {
        candidate,
        isSameType,
        attenuationDistance,
      };
    })
    .sort((left, right) => {
      if (left.isSameType !== right.isSameType) {
        return left.isSameType ? -1 : 1;
      }

      if (left.attenuationDistance !== right.attenuationDistance) {
        return left.attenuationDistance - right.attenuationDistance;
      }

      return left.candidate.name.localeCompare(right.candidate.name);
    });

  const normalizedLimit = Math.max(0, limit);

  return rankedAlternatives
    .slice(0, normalizedLimit)
    .map((item) => item.candidate);
}

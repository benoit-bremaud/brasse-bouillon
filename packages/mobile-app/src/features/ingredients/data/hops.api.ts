import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import {
  HopProduct,
  HopSpecGroup,
  HopSpecRow,
} from "@/features/ingredients/domain/hop.types";

import { slugify, toOptionalString } from "./ingredient-api.utils";

/**
 * Catalog DTO matching the API entity `HopOrmEntity`
 * (`packages/api/src/catalog/hop/entities/hop.orm.entity.ts`).
 * Snake_case fields are surfaced verbatim from the catalogue
 * controller; the mapping below converts them into the mobile
 * domain shape (`HopProduct` with `specGroups`).
 */
interface CatalogHopDto {
  id: string;
  name: string;
  origin?: string | null;
  alpha_acid_typical?: number | null;
  beta_acid_typical?: number | null;
  hop_stability_index?: number | null;
  usage_type?: string | null;
  form?: string | null;
  notes?: string | null;
  producer_id?: string | null;
}

function formatNumber(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return String(value);
}

function buildHopSpecGroups(dto: CatalogHopDto): HopSpecGroup[] {
  const acidRows: HopSpecRow[] = [];

  const alphaValue = formatNumber(dto.alpha_acid_typical);
  if (alphaValue) {
    acidRows.push({
      id: "hop-alpha-acid",
      label: "Alpha",
      value: alphaValue,
      unit: "%",
    });
  }

  const betaValue = formatNumber(dto.beta_acid_typical);
  if (betaValue) {
    acidRows.push({
      id: "hop-beta-acid",
      label: "Beta",
      value: betaValue,
      unit: "%",
    });
  }

  const hsiValue = formatNumber(dto.hop_stability_index);
  if (hsiValue) {
    acidRows.push({
      id: "hop-stability-index",
      label: "HSI",
      value: hsiValue,
    });
  }

  const groups: HopSpecGroup[] = [];

  if (acidRows.length > 0) {
    groups.push({
      id: "hop-acids-group",
      title: "Acides & stabilité",
      rows: acidRows,
    });
  }

  const formatRows: HopSpecRow[] = [];
  const formValue = toOptionalString(dto.form);
  if (formValue) {
    formatRows.push({
      id: "hop-form",
      label: "Format",
      value: formValue,
    });
  }

  if (formatRows.length > 0) {
    groups.push({
      id: "hop-format-group",
      title: "Présentation",
      rows: formatRows,
    });
  }

  return groups;
}

function mapCatalogHopDto(dto: CatalogHopDto): HopProduct | null {
  const id = toOptionalString(dto.id);
  const name = toOptionalString(dto.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    slug: slugify(name),
    name,
    originCountry: toOptionalString(dto.origin),
    hopType: toOptionalString(dto.usage_type),
    description: toOptionalString(dto.notes),
    specGroups: buildHopSpecGroups(dto),
  };
}

export async function listHopsApi(): Promise<HopProduct[]> {
  const response = await request<CatalogHopDto[]>("/catalog/hops");

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapCatalogHopDto)
    .filter((hop): hop is HopProduct => hop !== null);
}

export async function getHopDetailsApi(
  hopId: string,
): Promise<HopProduct | null> {
  if (!hopId) {
    return null;
  }

  try {
    const response = await request<CatalogHopDto>(`/catalog/hops/${hopId}`);
    return mapCatalogHopDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

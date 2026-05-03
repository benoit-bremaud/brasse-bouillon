import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import {
  YeastProduct,
  YeastSpecGroup,
  YeastSpecRow,
} from "@/features/ingredients/domain/yeast.types";

import { slugify, toOptionalString } from "./ingredient-api.utils";

/**
 * Catalog DTO matching the API entity `YeastOrmEntity`
 * (`packages/api/src/catalog/yeast/entities/yeast.orm.entity.ts`).
 * The legacy `laboratory` varchar was dropped on PR #905
 * (Issue #904 cleanup) — yeast strains are now linked to a
 * laboratory through `producer_id` FK to the `producers`
 * catalogue. The brewer-recognisable SKU stays as
 * `product_code` (renamed from `product_id`).
 */
interface CatalogYeastDto {
  id: string;
  name: string;
  type?: string | null;
  form?: string | null;
  product_code?: string | null;
  min_temperature_c?: number | null;
  max_temperature_c?: number | null;
  flocculation?: string | null;
  attenuation_percent_typical?: number | null;
  notes?: string | null;
  producer_id?: string | null;
}

function formatNumber(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return String(value);
}

function buildYeastSpecGroups(dto: CatalogYeastDto): YeastSpecGroup[] {
  const fermentationRows: YeastSpecRow[] = [];

  const minTemp = formatNumber(dto.min_temperature_c);
  const maxTemp = formatNumber(dto.max_temperature_c);
  if (minTemp || maxTemp) {
    const value =
      minTemp && maxTemp ? `${minTemp}-${maxTemp}` : (minTemp ?? maxTemp ?? "");

    fermentationRows.push({
      id: "yeast-temperature-range",
      label: "Temperature",
      value,
      unit: "°C",
    });
  }

  const attenuation = formatNumber(dto.attenuation_percent_typical);
  if (attenuation) {
    // Label MUST contain "attenuation" (ASCII, case-insensitive)
    // — the yeasts use-case `getAttenuation` parses this row to
    // apply attenuationMin/Max filters. The accented French
    // "Atténuation" doesn't match `includes("attenuation")` due
    // to the "é". Codex P1 catch on PR #906 review.
    fermentationRows.push({
      id: "yeast-attenuation",
      label: "Attenuation",
      value: attenuation,
      unit: "%",
    });
  }

  const flocculation = toOptionalString(dto.flocculation);
  if (flocculation) {
    fermentationRows.push({
      id: "yeast-flocculation",
      label: "Flocculation",
      value: flocculation,
    });
  }

  const groups: YeastSpecGroup[] = [];

  if (fermentationRows.length > 0) {
    groups.push({
      id: "yeast-fermentation-group",
      title: "Fermentation",
      rows: fermentationRows,
    });
  }

  const productRows: YeastSpecRow[] = [];

  const productCode = toOptionalString(dto.product_code);
  if (productCode) {
    productRows.push({
      id: "yeast-product-code",
      label: "Product code",
      value: productCode,
    });
  }

  const formValue = toOptionalString(dto.form);
  if (formValue) {
    productRows.push({
      id: "yeast-form",
      label: "Form",
      value: formValue,
    });
  }

  if (productRows.length > 0) {
    groups.push({
      id: "yeast-product-group",
      title: "Product",
      rows: productRows,
    });
  }

  return groups;
}

function mapCatalogYeastDto(dto: CatalogYeastDto): YeastProduct | null {
  const id = toOptionalString(dto.id);
  const name = toOptionalString(dto.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    slug: slugify(name),
    name,
    yeastType: toOptionalString(dto.type),
    description: toOptionalString(dto.notes),
    specGroups: buildYeastSpecGroups(dto),
  };
}

export async function listYeastsApi(): Promise<YeastProduct[]> {
  const response = await request<CatalogYeastDto[]>("/catalog/yeasts");

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapCatalogYeastDto)
    .filter((yeast): yeast is YeastProduct => yeast !== null);
}

export async function getYeastDetailsApi(
  yeastId: string,
): Promise<YeastProduct | null> {
  if (!yeastId) {
    return null;
  }

  try {
    const response = await request<CatalogYeastDto>(
      `/catalog/yeasts/${yeastId}`,
    );
    return mapCatalogYeastDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

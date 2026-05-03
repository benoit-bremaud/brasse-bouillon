import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import {
  MaltProduct,
  MaltSpecGroup,
  MaltSpecRow,
} from "@/features/ingredients/domain/malt.types";

import { slugify, toOptionalString } from "./ingredient-api.utils";

/**
 * Catalog DTO matching the API entity `FermentableOrmEntity`
 * (`packages/api/src/catalog/fermentable/entities/fermentable.orm.entity.ts`).
 * The mobile vocabulary keeps "malt" because the picker UX
 * speaks to the brewer's mental model (malts are 95% of
 * fermentables); the API table is named `fermentables` for
 * BeerXML alignment.
 */
interface CatalogFermentableDto {
  id: string;
  name: string;
  type?: string | null;
  origin?: string | null;
  color_ebc_typical?: number | null;
  potential_gravity_typical?: number | null;
  yield_percent_typical?: number | null;
  diastatic_power_lintner?: number | null;
  max_in_batch_percent?: number | null;
  recommend_mash?: boolean | null;
  notes?: string | null;
  producer_id?: string | null;
}

function formatNumber(value: number | null | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return String(value);
}

function buildMaltSpecGroups(dto: CatalogFermentableDto): MaltSpecGroup[] {
  const colourRows: MaltSpecRow[] = [];

  const ebcValue = formatNumber(dto.color_ebc_typical);
  if (ebcValue) {
    colourRows.push({
      id: "malt-color-ebc",
      label: "Couleur",
      value: ebcValue,
      unit: "EBC",
    });
  }

  const gravityValue = formatNumber(dto.potential_gravity_typical);
  if (gravityValue) {
    colourRows.push({
      id: "malt-potential-gravity",
      label: "Densité potentielle",
      value: gravityValue,
    });
  }

  const yieldValue = formatNumber(dto.yield_percent_typical);
  if (yieldValue) {
    colourRows.push({
      id: "malt-yield",
      label: "Rendement",
      value: yieldValue,
      unit: "%",
    });
  }

  const groups: MaltSpecGroup[] = [];

  if (colourRows.length > 0) {
    groups.push({
      id: "malt-color-group",
      title: "Couleur & rendement",
      rows: colourRows,
    });
  }

  const enzymesRows: MaltSpecRow[] = [];

  const diastaticValue = formatNumber(dto.diastatic_power_lintner);
  if (diastaticValue) {
    enzymesRows.push({
      id: "malt-diastatic-power",
      label: "Pouvoir diastasique",
      value: diastaticValue,
      unit: "Lintner",
    });
  }

  const maxInBatchValue = formatNumber(dto.max_in_batch_percent);
  if (maxInBatchValue) {
    enzymesRows.push({
      id: "malt-max-in-batch",
      label: "Max dans la maische",
      value: maxInBatchValue,
      unit: "%",
    });
  }

  if (enzymesRows.length > 0) {
    groups.push({
      id: "malt-enzymes-group",
      title: "Enzymes & dosage",
      rows: enzymesRows,
    });
  }

  return groups;
}

function mapCatalogFermentableDto(
  dto: CatalogFermentableDto,
): MaltProduct | null {
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
    maltType: toOptionalString(dto.type),
    description: toOptionalString(dto.notes),
    specGroups: buildMaltSpecGroups(dto),
  };
}

export async function listMaltsApi(): Promise<MaltProduct[]> {
  const response = await request<CatalogFermentableDto[]>(
    "/catalog/fermentables",
  );

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapCatalogFermentableDto)
    .filter((malt): malt is MaltProduct => malt !== null);
}

export async function getMaltDetailsApi(
  maltId: string,
): Promise<MaltProduct | null> {
  if (!maltId) {
    return null;
  }

  try {
    const response = await request<CatalogFermentableDto>(
      `/catalog/fermentables/${maltId}`,
    );
    return mapCatalogFermentableDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

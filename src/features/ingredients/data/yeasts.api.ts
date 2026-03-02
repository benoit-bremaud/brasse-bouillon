import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import {
    YeastProduct,
    YeastSpecGroup,
    YeastSpecRow,
} from "@/features/ingredients/domain/yeast.types";

type YeastSpecRowDto = {
  id?: string;
  key?: string;
  label?: string;
  value?: string | number | null;
  unit?: string | null;
};

type YeastSpecGroupDto = {
  id?: string;
  title?: string;
  rows?: YeastSpecRowDto[];
};

type YeastDto = {
  id?: string;
  slug?: string;
  name?: string;
  brand?: string | null;
  originCountry?: string | null;
  origin_country?: string | null;
  yeastType?: string | null;
  yeast_type?: string | null;
  description?: string | null;
  specGroups?: YeastSpecGroupDto[];
  spec_groups?: YeastSpecGroupDto[];
  specs?: Record<string, unknown>;
  specifications?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function toDisplayLabel(rawLabel: string): string {
  const normalized = rawLabel
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toDisplayValue(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapSpecRow(
  dto: YeastSpecRowDto,
  groupId: string,
  rowIndex: number,
): YeastSpecRow | null {
  const labelFromDto = toOptionalString(dto.label) ?? toOptionalString(dto.key);
  const value = toDisplayValue(dto.value);

  if (!labelFromDto || !value) {
    return null;
  }

  return {
    id: toOptionalString(dto.id) ?? `${groupId}-row-${rowIndex + 1}`,
    label: toDisplayLabel(labelFromDto),
    value,
    unit: toOptionalString(dto.unit),
  };
}

function mapSpecGroup(
  dto: YeastSpecGroupDto,
  index: number,
): YeastSpecGroup | null {
  const title = toOptionalString(dto.title);
  const rows = (dto.rows ?? [])
    .map((row, rowIndex) =>
      mapSpecRow(
        row,
        toOptionalString(dto.id) ?? `group-${index + 1}`,
        rowIndex,
      ),
    )
    .filter((row): row is YeastSpecRow => row !== null);

  if (!title || rows.length === 0) {
    return null;
  }

  return {
    id: toOptionalString(dto.id) ?? `group-${index + 1}`,
    title,
    rows,
  };
}

function mapFallbackSpecs(specs: Record<string, unknown>): YeastSpecGroup[] {
  const rows = Object.entries(specs)
    .map(([rawKey, rawValue], index) => {
      const value = toDisplayValue(rawValue);

      if (!value) {
        return null;
      }

      return {
        id: `fallback-spec-row-${index + 1}`,
        label: toDisplayLabel(rawKey),
        value,
      } satisfies YeastSpecRow;
    })
    .filter((row): row is YeastSpecRow => row !== null);

  if (rows.length === 0) {
    return [];
  }

  return [
    {
      id: "fallback-specifications",
      title: "Specifications",
      rows,
    },
  ];
}

function mapYeastDto(dto: YeastDto): YeastProduct | null {
  const id = toOptionalString(dto.id);
  const name = toOptionalString(dto.name);

  if (!id || !name) {
    return null;
  }

  const specGroupDtos =
    dto.specGroups ?? dto.spec_groups ?? ([] as YeastSpecGroupDto[]);
  const specGroups = specGroupDtos
    .map(mapSpecGroup)
    .filter((group): group is YeastSpecGroup => group !== null);

  if (specGroups.length === 0) {
    const fallbackSpecsSource =
      (isRecord(dto.specs) && dto.specs) ||
      (isRecord(dto.specifications) && dto.specifications) ||
      null;

    if (fallbackSpecsSource) {
      specGroups.push(...mapFallbackSpecs(fallbackSpecsSource));
    }
  }

  return {
    id,
    slug: toOptionalString(dto.slug) ?? slugify(name),
    name,
    brand: toOptionalString(dto.brand),
    originCountry:
      toOptionalString(dto.originCountry) ??
      toOptionalString(dto.origin_country),
    yeastType:
      toOptionalString(dto.yeastType) ?? toOptionalString(dto.yeast_type),
    description: toOptionalString(dto.description),
    specGroups,
  };
}

export async function listYeastsApi(): Promise<YeastProduct[]> {
  const response = await request<YeastDto[]>("/yeasts");

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapYeastDto)
    .filter((yeast): yeast is YeastProduct => yeast !== null);
}

export async function getYeastDetailsApi(
  yeastId: string,
): Promise<YeastProduct | null> {
  if (!yeastId) {
    return null;
  }

  try {
    const response = await request<YeastDto>(`/yeasts/${yeastId}`);
    return mapYeastDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

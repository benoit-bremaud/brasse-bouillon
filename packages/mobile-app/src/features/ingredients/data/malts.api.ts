import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import {
  MaltProduct,
  MaltSpecGroup,
  MaltSpecRow,
} from "@/features/ingredients/domain/malt.types";

type MaltSpecRowDto = {
  id?: string;
  key?: string;
  label?: string;
  value?: string | number | null;
  unit?: string | null;
};

type MaltSpecGroupDto = {
  id?: string;
  title?: string;
  rows?: MaltSpecRowDto[];
};

type MaltDto = {
  id?: string;
  slug?: string;
  name?: string;
  brand?: string | null;
  originCountry?: string | null;
  origin_country?: string | null;
  maltType?: string | null;
  malt_type?: string | null;
  description?: string | null;
  specGroups?: MaltSpecGroupDto[];
  spec_groups?: MaltSpecGroupDto[];
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
  dto: MaltSpecRowDto,
  groupId: string,
  rowIndex: number,
): MaltSpecRow | null {
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
  dto: MaltSpecGroupDto,
  index: number,
): MaltSpecGroup | null {
  const title = toOptionalString(dto.title);
  const rows = (dto.rows ?? [])
    .map((row, rowIndex) =>
      mapSpecRow(
        row,
        toOptionalString(dto.id) ?? `group-${index + 1}`,
        rowIndex,
      ),
    )
    .filter((row): row is MaltSpecRow => row !== null);

  if (!title || rows.length === 0) {
    return null;
  }

  return {
    id: toOptionalString(dto.id) ?? `group-${index + 1}`,
    title,
    rows,
  };
}

function mapFallbackSpecs(specs: Record<string, unknown>): MaltSpecGroup[] {
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
      } satisfies MaltSpecRow;
    })
    .filter((row): row is MaltSpecRow => row !== null);

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

function mapMaltDto(dto: MaltDto): MaltProduct | null {
  const id = toOptionalString(dto.id);
  const name = toOptionalString(dto.name);

  if (!id || !name) {
    return null;
  }

  const specGroupDtos =
    dto.specGroups ?? dto.spec_groups ?? ([] as MaltSpecGroupDto[]);
  const specGroups = specGroupDtos
    .map(mapSpecGroup)
    .filter((group): group is MaltSpecGroup => group !== null);

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
    maltType: toOptionalString(dto.maltType) ?? toOptionalString(dto.malt_type),
    description: toOptionalString(dto.description),
    specGroups,
  };
}

export async function listMaltsApi(): Promise<MaltProduct[]> {
  const response = await request<MaltDto[]>("/malts");

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapMaltDto)
    .filter((malt): malt is MaltProduct => malt !== null);
}

export async function getMaltDetailsApi(
  maltId: string,
): Promise<MaltProduct | null> {
  if (!maltId) {
    return null;
  }

  try {
    const response = await request<MaltDto>(`/malts/${maltId}`);
    return mapMaltDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

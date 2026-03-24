/**
 * Shared utilities for ingredient API mapping
 */

export interface SpecRowDto {
  id?: string;
  key?: string;
  label?: string;
  value?: string | number | null;
  unit?: string | null;
}

export interface SpecGroupDto {
  id?: string;
  title?: string;
  rows?: SpecRowDto[];
}

export interface BaseIngredientDto {
  id?: string;
  slug?: string;
  name?: string;
  brand?: string | null;
  originCountry?: string | null;
  origin_country?: string | null;
  description?: string | null;
  specGroups?: SpecGroupDto[];
  spec_groups?: SpecGroupDto[];
  specs?: Record<string, unknown>;
  specifications?: Record<string, unknown>;
}

export interface SpecRow {
  id: string;
  label: string;
  value: string;
  unit?: string;
}

export interface SpecGroup {
  id: string;
  title: string;
  rows: SpecRow[];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

export function toDisplayLabel(rawLabel: string): string {
  const normalized = rawLabel
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function toDisplayValue(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  return null;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mapSpecRow(
  dto: SpecRowDto,
  groupId: string,
  rowIndex: number,
): SpecRow | null {
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

export function mapSpecGroup(
  dto: SpecGroupDto,
  index: number,
): SpecGroup | null {
  const title = toOptionalString(dto.title);
  const rows = (dto.rows ?? [])
    .map((row, rowIndex) =>
      mapSpecRow(
        row,
        toOptionalString(dto.id) ?? `group-${index + 1}`,
        rowIndex,
      ),
    )
    .filter((row): row is SpecRow => row !== null);

  if (!title || rows.length === 0) {
    return null;
  }

  return {
    id: toOptionalString(dto.id) ?? `group-${index + 1}`,
    title,
    rows,
  };
}

export function mapFallbackSpecs(specs: Record<string, unknown>): SpecGroup[] {
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
      } satisfies SpecRow;
    })
    .filter((row): row is SpecRow => row !== null);

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

export function mapBaseIngredientFields(dto: BaseIngredientDto) {
  const id = toOptionalString(dto.id);
  const name = toOptionalString(dto.name);

  if (!id || !name) {
    return null;
  }

  const specGroupDtos =
    dto.specGroups ?? dto.spec_groups ?? ([] as SpecGroupDto[]);
  const specGroups = specGroupDtos
    .map(mapSpecGroup)
    .filter((group): group is SpecGroup => group !== null);

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
    description: toOptionalString(dto.description),
    specGroups,
  };
}

import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";

import { slugify, toOptionalString } from "./ingredient-api.utils";

/**
 * Catalog DTO matching the API entity `MiscTemplateOrmEntity`
 * (`packages/api/src/catalog/misc/entities/misc-template.orm.entity.ts`).
 * Misc covers the BeerXML 1.0 `<MISC>` ingredient class:
 * spices, finings, water agents, herbs, flavor adjuncts.
 *
 * The mobile-side `MiscProduct` type is exported from THIS
 * module (kept colocated with the api consumer rather than
 * promoted to a `domain/misc.types.ts` file). Picker UX for
 * misc is simpler than hops/malts/yeasts (no `specGroups`;
 * just flat fields), so a separate domain file is overkill
 * until the picker actually consumes it.
 *
 * **Currently unwired**: this module is the API mirror of the
 * `/catalog/misc-templates` endpoint shipped on PR #899. It's
 * not yet consumed by any screen — `IngredientCategory` only
 * allows `'malt' | 'hop' | 'yeast'` today. Wiring is tracked
 * in issue #624 (`feat(ingredients): CRUD + personalisation`).
 */
interface CatalogMiscDto {
  id: string;
  name: string;
  type?: string | null;
  use_at?: string | null;
  amount?: number | null;
  amount_is_weight?: boolean | null;
  time_min?: number | null;
  use_for?: string | null;
  notes?: string | null;
  producer_id?: string | null;
}

export interface MiscProduct {
  id: string;
  slug: string;
  name: string;
  /** Enum from the BeerXML `<TYPE>` field (spice / fining / water_agent / herb / flavor / other). */
  miscType?: string;
  /** Enum from the BeerXML `<USE>` field (mash / boil / primary / secondary / bottling). */
  useAt?: string;
  /** Raw BeerXML AMOUNT — kg if `amountIsWeight` is true, else L. */
  amount?: number;
  amountIsWeight?: boolean;
  /** Minutes the misc spends in its USE phase. */
  timeMin?: number;
  /** Short purpose category, English ("Clarity", "Belgian Wit"). */
  useFor?: string;
  /** Brewer-friendly description, French. */
  description?: string;
  /** FK to producer (UUID). Resolved separately when surface is rendered. */
  producerId?: string;
}

function mapCatalogMiscDto(dto: CatalogMiscDto): MiscProduct | null {
  const id = toOptionalString(dto.id);
  const name = toOptionalString(dto.name);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    slug: slugify(name),
    name,
    miscType: toOptionalString(dto.type),
    useAt: toOptionalString(dto.use_at),
    amount: typeof dto.amount === "number" ? dto.amount : undefined,
    amountIsWeight:
      typeof dto.amount_is_weight === "boolean"
        ? dto.amount_is_weight
        : undefined,
    timeMin: typeof dto.time_min === "number" ? dto.time_min : undefined,
    useFor: toOptionalString(dto.use_for),
    description: toOptionalString(dto.notes),
    producerId: toOptionalString(dto.producer_id),
  };
}

export async function listMiscApi(): Promise<MiscProduct[]> {
  const response = await request<CatalogMiscDto[]>("/catalog/misc-templates");

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapCatalogMiscDto)
    .filter((misc): misc is MiscProduct => misc !== null);
}

export async function getMiscDetailsApi(
  miscId: string,
): Promise<MiscProduct | null> {
  if (!miscId) {
    return null;
  }

  try {
    const response = await request<CatalogMiscDto>(
      `/catalog/misc-templates/${miscId}`,
    );
    return mapCatalogMiscDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

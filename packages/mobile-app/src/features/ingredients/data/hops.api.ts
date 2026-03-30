import {
  BaseIngredientDto,
  mapBaseIngredientFields,
  toOptionalString,
} from "./ingredient-api.utils";

import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import { HopProduct } from "@/features/ingredients/domain/hop.types";

interface HopDto extends BaseIngredientDto {
  hopType?: string | null;
  hop_type?: string | null;
}

function mapHopDto(dto: HopDto): HopProduct | null {
  const baseFields = mapBaseIngredientFields(dto);

  if (!baseFields) {
    return null;
  }

  return {
    ...baseFields,
    hopType: toOptionalString(dto.hopType) ?? toOptionalString(dto.hop_type),
  };
}

export async function listHopsApi(): Promise<HopProduct[]> {
  const response = await request<HopDto[]>("/hops");

  if (!Array.isArray(response)) {
    return [];
  }

  return response
    .map(mapHopDto)
    .filter((hop): hop is HopProduct => hop !== null);
}

export async function getHopDetailsApi(
  hopId: string,
): Promise<HopProduct | null> {
  if (!hopId) {
    return null;
  }

  try {
    const response = await request<HopDto>(`/hops/${hopId}`);
    return mapHopDto(response);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

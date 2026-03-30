import {
  BaseIngredientDto,
  mapBaseIngredientFields,
  toOptionalString,
} from "./ingredient-api.utils";

import { request } from "@/core/http/http-client";
import { HttpError } from "@/core/http/http-error";
import { YeastProduct } from "@/features/ingredients/domain/yeast.types";

interface YeastDto extends BaseIngredientDto {
  yeastType?: string | null;
  yeast_type?: string | null;
}

function mapYeastDto(dto: YeastDto): YeastProduct | null {
  const baseFields = mapBaseIngredientFields(dto);

  if (!baseFields) {
    return null;
  }

  return {
    ...baseFields,
    yeastType:
      toOptionalString(dto.yeastType) ?? toOptionalString(dto.yeast_type),
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

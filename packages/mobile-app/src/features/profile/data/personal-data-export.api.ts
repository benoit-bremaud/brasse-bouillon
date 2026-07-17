import { request } from "@/core/http/http-client";
import type { ApiPersonalDataExport } from "../domain/personal-data-export.types";

export async function getPersonalDataExport(): Promise<ApiPersonalDataExport> {
  return request<ApiPersonalDataExport>("/auth/me/export");
}

import { request } from "@/core/http/http-client";

export type UserScanSummary = {
  id: string;
  status: string;
  createdAt: string;
};

type ScanRequestDto = {
  id: string;
  status: string;
  created_at: string;
};

export async function listCurrentUserScans(): Promise<UserScanSummary[]> {
  const scans = await request<ScanRequestDto[]>("/scan");
  return scans.map((scan) => ({
    id: scan.id,
    status: scan.status,
    createdAt: scan.created_at,
  }));
}

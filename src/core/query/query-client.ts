import { QueryClient } from "@tanstack/react-query";

const DEFAULT_QUERY_RETRY_COUNT = 1;
const DEFAULT_STALE_TIME_MS = 30 * 1000;
const DEFAULT_GC_TIME_MS = 5 * 60 * 1000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: DEFAULT_QUERY_RETRY_COUNT,
        staleTime: DEFAULT_STALE_TIME_MS,
        gcTime: DEFAULT_GC_TIME_MS,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

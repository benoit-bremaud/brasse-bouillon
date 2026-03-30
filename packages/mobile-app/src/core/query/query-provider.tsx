import React, { useState } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/core/query/query-client";

type QueryProviderProps = {
  children: React.ReactNode;
};

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

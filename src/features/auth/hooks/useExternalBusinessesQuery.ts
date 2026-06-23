"use client";

import { useQuery } from "@tanstack/react-query";
import { getExternalBusinesses } from "@/features/auth/service";
import type { ExternalBusinessRecord } from "@/features/auth/types";

type UseExternalBusinessesQueryOptions = {
  enabled?: boolean;
};

export function useExternalBusinessesQuery(
  accountId: string | null,
  accessToken: string | null,
  options: UseExternalBusinessesQueryOptions = {},
) {
  return useQuery<ExternalBusinessRecord[]>({
    queryKey: ["auth", "external-businesses", accountId],
    queryFn: async () => {
      if (!accountId || !accessToken) {
        return [];
      }

      const response = await getExternalBusinesses(accountId, accessToken);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: (options.enabled ?? true) && Boolean(accountId) && Boolean(accessToken),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: [],
  });
}

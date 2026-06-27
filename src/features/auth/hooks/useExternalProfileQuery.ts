"use client";

import { useQuery } from "@tanstack/react-query";
import { getExternalProfile } from "@/features/auth/service";
import type { ExternalProfileRecord } from "@/features/auth/types";

type UseExternalProfileQueryOptions = {
  enabled?: boolean;
};

export function useExternalProfileQuery(
  profileId: string | null,
  accessToken: string | null,
  options: UseExternalProfileQueryOptions = {},
) {
  return useQuery<ExternalProfileRecord | null>({
    queryKey: ["auth", "external-profile", profileId],
    queryFn: async () => {
      if (!profileId || !accessToken) {
        return null;
      }

      const response = await getExternalProfile(profileId, accessToken);
      return response.data ?? null;
    },
    enabled:
      (options.enabled ?? true) && Boolean(profileId) && Boolean(accessToken),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

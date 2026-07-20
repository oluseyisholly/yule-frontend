"use client";

import { useQuery } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { getHangoutEvent } from "@/features/hangout-events/service";
import type { HangoutEventRecord } from "@/features/hangout-events/types";

type UseHangoutEventQueryOptions = {
  enabled?: boolean;
  refetchOnMount?: boolean | "always";
  refetchOnReconnect?: boolean;
  staleTime?: number;
};

export function useHangoutEventQuery(
  eventId: string | null,
  options: UseHangoutEventQueryOptions = {},
) {
  return useQuery({
    queryKey: hangoutEventQueryKeys.detail(eventId),
    queryFn: async (): Promise<HangoutEventRecord | null> => {
      if (!eventId) {
        return null;
      }

      const response = await getHangoutEvent(eventId);
      return response.data;
    },
    enabled: (options.enabled ?? true) && Boolean(eventId),
    staleTime: options.staleTime ?? 0,
    refetchOnMount: options.refetchOnMount ?? "always",
    refetchOnReconnect: options.refetchOnReconnect ?? true,
    placeholderData: (previousData) => previousData,
  });
}

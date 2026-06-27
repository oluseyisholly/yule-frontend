"use client";

import { useQuery } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { getHangoutEvent } from "@/features/hangout-events/service";
import type { HangoutEventRecord } from "@/features/hangout-events/types";

export function useHangoutEventQuery(eventId: string | null) {
  return useQuery({
    queryKey: hangoutEventQueryKeys.detail(eventId),
    queryFn: async (): Promise<HangoutEventRecord | null> => {
      if (!eventId) {
        return null;
      }

      const response = await getHangoutEvent(eventId);
      return response.data;
    },
    enabled: Boolean(eventId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

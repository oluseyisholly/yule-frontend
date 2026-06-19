"use client";

import { useQuery } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { getGiftingEvents } from "@/features/gifting-events/service";
import type { GiftingEventRecord } from "@/features/gifting-events/types";

export function useGiftingEventQuery(giftingEventId: string | null) {
  return useQuery({
    queryKey: [...giftingEventQueryKeys.all, "detail", giftingEventId ?? ""],
    queryFn: async (): Promise<GiftingEventRecord | null> => {
      const response = await getGiftingEvents({
        page: 1,
        per_page: 250,
      });

      return (
        response.data.data.find((record) => record.id === giftingEventId) ?? null
      );
    },
    enabled: Boolean(giftingEventId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

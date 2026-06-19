"use client";

import { useQuery } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { getGiftingEvents } from "@/features/gifting-events/service";
import type { GiftingEventsParams } from "@/features/gifting-events/types";

type UseGiftingEventsQueryOptions = {
  enabled?: boolean;
};

export function useGiftingEventsQuery(
  params: GiftingEventsParams = {},
  options: UseGiftingEventsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 10,
    page: params.page ?? 1,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: giftingEventQueryKeys.list(normalizedParams),
    queryFn: () => getGiftingEvents(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

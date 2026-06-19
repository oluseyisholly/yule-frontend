"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getEventGivenGroupedGifts } from "@/features/gifts/service";
import type { GivenGroupedGiftsParams } from "@/features/gifts/types";

type UseEventGivenGroupedGiftsQueryOptions = {
  enabled?: boolean;
};

export function useEventGivenGroupedGiftsQuery(
  eventId: string | null,
  params: GivenGroupedGiftsParams = {},
  options: UseEventGivenGroupedGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 25,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: giftQueryKeys.eventGivenGrouped(eventId ?? "", normalizedParams),
    queryFn: () => getEventGivenGroupedGifts(eventId!, normalizedParams),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

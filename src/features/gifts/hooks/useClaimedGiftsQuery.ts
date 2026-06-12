"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getClaimedGifts } from "@/features/gifts/service";
import type { ClaimedGiftsParams } from "@/features/gifts/types";

type UseClaimedGiftsQueryOptions = {
  enabled?: boolean;
};

export function useClaimedGiftsQuery(
  eventId: string | null,
  params: ClaimedGiftsParams = {},
  options: UseClaimedGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 25,
  };

  return useQuery({
    queryKey: giftQueryKeys.claimed(eventId ?? "", normalizedParams),
    queryFn: () => getClaimedGifts(eventId!, normalizedParams),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

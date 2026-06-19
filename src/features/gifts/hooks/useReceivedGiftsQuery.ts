"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getReceivedGifts } from "@/features/gifts/service";
import type { ReceivedGiftsParams } from "@/features/gifts/types";

type UseReceivedGiftsQueryOptions = {
  enabled?: boolean;
};

export function useReceivedGiftsQuery(
  params: ReceivedGiftsParams = {},
  options: UseReceivedGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 25,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: giftQueryKeys.received(normalizedParams),
    queryFn: () => getReceivedGifts(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

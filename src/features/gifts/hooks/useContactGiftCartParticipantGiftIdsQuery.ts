"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getContactGiftCartParticipantGiftIds } from "@/features/gifts/service";

type UseContactGiftCartParticipantGiftIdsQueryOptions = {
  enabled?: boolean;
};

export function useContactGiftCartParticipantGiftIdsQuery(
  options: UseContactGiftCartParticipantGiftIdsQueryOptions = {},
) {
  return useQuery({
    queryKey: giftQueryKeys.cartParticipantGiftIds(),
    queryFn: () => getContactGiftCartParticipantGiftIds(),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

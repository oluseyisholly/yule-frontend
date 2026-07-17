"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getEventGivenGroupedGift } from "@/features/gifts/service";

type UseEventGivenGroupedGiftQueryOptions = {
  enabled?: boolean;
};

export function useEventGivenGroupedGiftQuery(
  eventId: string | null,
  participantGiftId: string | null,
  options: UseEventGivenGroupedGiftQueryOptions = {},
) {
  return useQuery({
    queryKey: giftQueryKeys.eventGivenGroupedGift(
      eventId ?? "",
      participantGiftId ?? "",
    ),
    queryFn: () => getEventGivenGroupedGift(eventId!, participantGiftId!),
    enabled:
      Boolean(eventId) &&
      Boolean(participantGiftId) &&
      (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

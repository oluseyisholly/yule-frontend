"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getMyGiftRecipientGifts } from "@/features/participants/service";
import type { GiftRecipientGiftsParams } from "@/features/participants/types";

type UseGiftRecipientGiftsQueryOptions = {
  enabled?: boolean;
};

export function useGiftRecipientGiftsQuery(
  eventId: string | null,
  params: GiftRecipientGiftsParams = {},
  options: UseGiftRecipientGiftsQueryOptions = {},
) {
  return useQuery({
    queryKey: participantQueryKeys.giftRecipientGifts(eventId ?? "", params),
    queryFn: () => getMyGiftRecipientGifts(eventId!, params),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

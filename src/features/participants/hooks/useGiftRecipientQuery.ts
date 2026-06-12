"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getMyGiftRecipient } from "@/features/participants/service";

type UseGiftRecipientQueryOptions = {
  enabled?: boolean;
};

export function useGiftRecipientQuery(
  eventId: string | null,
  options: UseGiftRecipientQueryOptions = {},
) {
  return useQuery({
    queryKey: participantQueryKeys.giftRecipient(eventId ?? ""),
    queryFn: () => getMyGiftRecipient(eventId!),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

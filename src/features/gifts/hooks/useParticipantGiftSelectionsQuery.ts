"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getParticipantGiftSelections } from "@/features/gifts/service";

type UseParticipantGiftSelectionsQueryOptions = {
  enabled?: boolean;
};

export function useParticipantGiftSelectionsQuery(
  participantId: string | null,
  eventId: string | null,
  options: UseParticipantGiftSelectionsQueryOptions = {},
) {
  return useQuery({
    queryKey: giftQueryKeys.participantSelections(
      participantId ?? "",
      eventId ?? "",
    ),
    queryFn: () => getParticipantGiftSelections(participantId!, eventId!),
    enabled:
      Boolean(participantId) &&
      Boolean(eventId) &&
      (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

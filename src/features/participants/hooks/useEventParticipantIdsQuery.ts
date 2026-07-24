"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getEventParticipantIds } from "@/features/participants/service";

type UseEventParticipantIdsQueryOptions = {
  enabled?: boolean;
};

export function useEventParticipantIdsQuery(
  eventId: string | null,
  options: UseEventParticipantIdsQueryOptions = {},
) {
  return useQuery({
    queryKey: participantQueryKeys.eventParticipantIds(eventId ?? ""),
    queryFn: () => getEventParticipantIds(eventId!),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

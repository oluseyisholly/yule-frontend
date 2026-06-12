"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getMyParticipant } from "@/features/participants/service";

type UseMyParticipantQueryOptions = {
  enabled?: boolean;
};

export function useMyParticipantQuery(
  eventId: string | null,
  options: UseMyParticipantQueryOptions = {},
) {
  return useQuery({
    queryKey: participantQueryKeys.eventMe(eventId ?? ""),
    queryFn: () => getMyParticipant(eventId!),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

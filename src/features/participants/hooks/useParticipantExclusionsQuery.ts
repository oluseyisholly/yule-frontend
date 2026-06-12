"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getParticipantExclusions } from "@/features/participants/service";

type UseParticipantExclusionsQueryOptions = {
  enabled?: boolean;
};

export function useParticipantExclusionsQuery(
  eventId: string | null,
  options: UseParticipantExclusionsQueryOptions = {},
) {
  return useQuery({
    queryKey: participantQueryKeys.exclusionList(eventId ?? ""),
    queryFn: () => getParticipantExclusions(eventId!),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

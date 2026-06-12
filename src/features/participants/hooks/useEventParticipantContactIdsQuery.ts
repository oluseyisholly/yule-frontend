"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getEventParticipantContactIds } from "@/features/participants/service";

type UseEventParticipantContactIdsQueryOptions = {
  enabled?: boolean;
};

export function useEventParticipantContactIdsQuery(
  drawNameEventId: string | null,
  options: UseEventParticipantContactIdsQueryOptions = {},
) {
  return useQuery({
    queryKey: participantQueryKeys.drawNameEventContactIds(
      drawNameEventId ?? "",
    ),
    queryFn: () => getEventParticipantContactIds(drawNameEventId!),
    enabled: Boolean(drawNameEventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

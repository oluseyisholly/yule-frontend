"use client";

import { useQuery } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { getEventParticipants } from "@/features/participants/service";
import type { EventParticipantsParams } from "@/features/participants/types";

type UseEventParticipantsQueryOptions = {
  enabled?: boolean;
};

export function useEventParticipantsQuery(
  eventId: string | null,
  params: EventParticipantsParams = {},
  options: UseEventParticipantsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 20,
    page: params.page ?? 1,
  };

  return useQuery({
    queryKey: participantQueryKeys.list(eventId ?? "", normalizedParams),
    queryFn: () => getEventParticipants(eventId!, normalizedParams),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

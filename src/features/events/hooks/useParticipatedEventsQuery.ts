"use client";

import { useQuery } from "@tanstack/react-query";
import { participatedEventQueryKeys } from "@/features/events/query-keys";
import { getParticipatedEvents } from "@/features/events/service";
import type { ParticipatedEventsParams } from "@/features/events/types";

type UseParticipatedEventsQueryOptions = {
  enabled?: boolean;
};

export function useParticipatedEventsQuery(
  params: ParticipatedEventsParams = {},
  options: UseParticipatedEventsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 6,
    page: params.page ?? 1,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: participatedEventQueryKeys.list(normalizedParams),
    queryFn: () => getParticipatedEvents(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

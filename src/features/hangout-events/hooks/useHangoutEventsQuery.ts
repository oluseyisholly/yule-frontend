"use client";

import { useQuery } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { getHangoutEvents } from "@/features/hangout-events/service";
import type { HangoutEventsParams } from "@/features/hangout-events/types";

type UseHangoutEventsQueryOptions = {
  enabled?: boolean;
};

export function useHangoutEventsQuery(
  params: HangoutEventsParams = {},
  options: UseHangoutEventsQueryOptions = {},
) {
  const normalizedParams = {
    scope: params.scope ?? "all",
    per_page: params.per_page ?? 25,
    page: params.page ?? 1,
    searchQuery: params.searchQuery?.trim() ?? "",
  };

  return useQuery({
    queryKey: hangoutEventQueryKeys.list(normalizedParams),
    queryFn: () => getHangoutEvents(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

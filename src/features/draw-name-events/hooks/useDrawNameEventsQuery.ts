"use client";

import { useQuery } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { getDrawNameEvents } from "@/features/draw-name-events/service";
import type { DrawNameEventsParams } from "@/features/draw-name-events/types";

type UseDrawNameEventsQueryOptions = {
  enabled?: boolean;
};

export function useDrawNameEventsQuery(
  params: DrawNameEventsParams = {},
  options: UseDrawNameEventsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 10,
    page: params.page ?? 1,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: drawNameEventQueryKeys.list(normalizedParams),
    queryFn: () => getDrawNameEvents(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

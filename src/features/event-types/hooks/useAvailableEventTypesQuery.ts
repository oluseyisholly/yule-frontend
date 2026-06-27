"use client";

import { useQuery } from "@tanstack/react-query";
import { eventTypeQueryKeys } from "@/features/event-types/query-keys";
import { getAvailableEventTypes } from "@/features/event-types/service";
import type { AvailableEventTypesParams } from "@/features/event-types/types";

type UseAvailableEventTypesQueryOptions = {
  enabled?: boolean;
};

export function useAvailableEventTypesQuery(
  params: AvailableEventTypesParams = {},
  options: UseAvailableEventTypesQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 10,
    page: params.page ?? 1,
  };

  return useQuery({
    queryKey: eventTypeQueryKeys.available(normalizedParams),
    queryFn: () => getAvailableEventTypes(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}

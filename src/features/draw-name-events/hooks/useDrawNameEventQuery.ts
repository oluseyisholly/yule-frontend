"use client";

import { useQuery } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { getDrawNameEvent } from "@/features/draw-name-events/service";

type UseDrawNameEventQueryOptions = {
  enabled?: boolean;
};

export function useDrawNameEventQuery(
  id: string | null,
  options: UseDrawNameEventQueryOptions = {},
) {
  return useQuery({
    queryKey: drawNameEventQueryKeys.detail(id ?? ""),
    queryFn: () => getDrawNameEvent(id!),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

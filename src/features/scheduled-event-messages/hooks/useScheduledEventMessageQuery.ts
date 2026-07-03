"use client";

import { useQuery } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { getScheduledEventMessage } from "@/features/scheduled-event-messages/service";

type UseScheduledEventMessageQueryOptions = {
  enabled?: boolean;
};

export function useScheduledEventMessageQuery(
  id: string | null,
  options: UseScheduledEventMessageQueryOptions = {},
) {
  return useQuery({
    queryKey: scheduledEventMessageQueryKeys.detail(id),
    queryFn: () => getScheduledEventMessage(id ?? ""),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

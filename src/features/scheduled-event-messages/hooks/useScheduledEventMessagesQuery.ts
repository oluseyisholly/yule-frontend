"use client";

import { useQuery } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { getCreatedScheduledEventMessages } from "@/features/scheduled-event-messages/service";
import type { ScheduledEventMessagesParams } from "@/features/scheduled-event-messages/types";

type UseScheduledEventMessagesQueryOptions = {
  enabled?: boolean;
};

export function useScheduledEventMessagesQuery(
  params: ScheduledEventMessagesParams = {},
  options: UseScheduledEventMessagesQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
    searchQuery: params.searchQuery ?? "",
    eventTiming: params.eventTiming,
  };

  return useQuery({
    queryKey: scheduledEventMessageQueryKeys.list(normalizedParams),
    queryFn: () => getCreatedScheduledEventMessages(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

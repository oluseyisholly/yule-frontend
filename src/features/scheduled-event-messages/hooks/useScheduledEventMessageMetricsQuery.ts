"use client";

import { useQuery } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { getScheduledEventMessageMetrics } from "@/features/scheduled-event-messages/service";
import type { ScheduledEventMessageMetricsData } from "@/features/scheduled-event-messages/types";

const sampleMetrics: ScheduledEventMessageMetricsData = {
  totalEvents: {
    value: 0,
    percentageChangeThisMonth: 0,
    currentMonth: 0,
    previousMonth: 0,
    currentWeek: 0,
  },
  totalRecipients: {
    value: 0,
  },
  totalEventsThisMonth: {
    value: 0,
    newThisWeek: 0,
  },
  amountSpent: {
    value: 0,
    percentageChangeThisMonth: 0,
    currentMonth: 0,
    previousMonth: 0,
    currentWeek: 0,
  },
};

export function useScheduledEventMessageMetricsQuery(enabled = true) {
  return useQuery<ScheduledEventMessageMetricsData>({
    queryKey: scheduledEventMessageQueryKeys.metrics(),
    queryFn: () =>
      getScheduledEventMessageMetrics().then((response) => response.data),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: sampleMetrics,
  });
}

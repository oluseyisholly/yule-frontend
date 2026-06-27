"use client";

import { useQuery } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { getHangoutMetrics } from "@/features/hangout-events/service";
import type { HangoutMetricsData } from "@/features/hangout-events/types";

const sampleMetrics: HangoutMetricsData = {
  totalHangouts: {
    value: 0,
    percentageChangeThisMonth: 0,
    currentMonth: 0,
    previousMonth: 0,
    currentWeek: 0,
  },
  peopleMet: {
    value: 0,
  },
  totalThisMonth: {
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

export function useHangoutMetricsQuery(enabled = true) {
  return useQuery<HangoutMetricsData>({
    queryKey: hangoutEventQueryKeys.metrics(),
    queryFn: () => getHangoutMetrics().then((response) => response.data),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: sampleMetrics,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getDrawNameMetrics } from "@/features/draw-name-events/service";
import type { DrawNameMetricsData } from "@/features/draw-name-events/types";

type DrawNameMetrics = DrawNameMetricsData;

const sampleMetrics: DrawNameMetrics = {
  totalGifts: {
    value: 0,
    percentageChangeThisMonth:0,
    currentMonth: 0,
    previousMonth: 0,
  },
  activeDrawNames: {
    value: 0,
    newThisWeek: 0,
  },
  totalNames: {
    value: 0,
  },
  activeMembers: {
    value: 0,
  },
};

export function useDrawNameMetricsQuery(enabled = true) {
  return useQuery<DrawNameMetrics>({
    queryKey: ["drawName", "metrics"],
    queryFn: () => getDrawNameMetrics().then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: sampleMetrics,
  });
}

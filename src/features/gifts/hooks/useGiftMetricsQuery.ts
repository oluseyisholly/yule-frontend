"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getGiftMetrics } from "@/features/gifts/service";
import type { GiftMetricsData } from "@/features/gifts/types";

const sampleMetrics: GiftMetricsData = {
  totalGifts: {
    value: 0,
    percentageChangeThisMonth: 0,
    currentMonth: 0,
    previousMonth: 0,
  },
  totalAmountSpent: {
    value: 0,
    newThisWeek: 0,
  },
  totalPeople: {
    value: 0,
  },
  totalSellers: {
    value: 0,
  },
};

export function useGiftMetricsQuery(enabled = true) {
  return useQuery<GiftMetricsData>({
    queryKey: giftQueryKeys.metrics(),
    queryFn: () => getGiftMetrics().then((response) => response.data),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: sampleMetrics,
  });
}

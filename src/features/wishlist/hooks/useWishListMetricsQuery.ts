"use client";

import { useQuery } from "@tanstack/react-query";
import { getWishListMetrics } from "@/features/wishlist/service";
import type { WishListMetricsData } from "@/features/wishlist/types";

type WishListMetrics = WishListMetricsData;

const sampleMetrics: WishListMetrics = {
  totalItems: {
    value: 124,
    percentageChangeThisMonth: 8.33,
    currentMonth: 48,
    previousMonth: 44,
  },
  activeWishlists: {
    value: 21,
    newThisWeek: 3,
  },
  totalParticipants: {
    value: 78,
  },
  reservedItems: {
    value: 15,
  },
};

export function useWishListMetricsQuery(enabled = true) {
  return useQuery<WishListMetrics>({
    queryKey: ["wishList", "metrics"],
    queryFn: () => getWishListMetrics().then((r) => r.data),
    enabled,
    staleTime: 60 * 1000,
    placeholderData: sampleMetrics,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getWishListMetrics } from "@/features/wishlist/service";
import type { WishListMetricsData } from "@/features/wishlist/types";

type WishListMetrics = WishListMetricsData;

const sampleMetrics: WishListMetrics = {
  totalItems: {
    value: 0,
    percentageChangeThisMonth: 0,
    currentMonth: 0,
    previousMonth: 0,
  },
  activeWishlists: {
    value: 0,
    newThisWeek: 0,
  },
  totalParticipants: {
    value: 0,
  },
  reservedItems: {
    value: 0,
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

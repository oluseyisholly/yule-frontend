"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { getWishlistEvents } from "@/features/wishlist-events/service";
import type { WishlistEventsParams } from "@/features/wishlist-events/types";

type UseWishlistEventsQueryOptions = {
  enabled?: boolean;
};

export function useWishlistEventsQuery(
  params: WishlistEventsParams = {},
  options: UseWishlistEventsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 10,
    page: params.page ?? 1,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: wishlistEventQueryKeys.list(normalizedParams),
    queryFn: () => getWishlistEvents(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

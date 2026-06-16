"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { getWishlistEventClaimedGiftIds } from "@/features/wishlist-events/service";

type UseWishlistEventClaimedGiftIdsQueryOptions = {
  enabled?: boolean;
};

export function useWishlistEventClaimedGiftIdsQuery(
  wishlistEventId: string | null,
  options: UseWishlistEventClaimedGiftIdsQueryOptions = {},
) {
  return useQuery({
    queryKey: wishlistEventQueryKeys.claimedGiftIdList(wishlistEventId ?? ""),
    queryFn: () => getWishlistEventClaimedGiftIds(wishlistEventId!),
    enabled: Boolean(wishlistEventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

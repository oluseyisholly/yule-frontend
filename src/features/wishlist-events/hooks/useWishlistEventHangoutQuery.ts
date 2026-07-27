"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { getWishlistEventHangout } from "@/features/wishlist-events/service";

type UseWishlistEventHangoutQueryOptions = {
  enabled?: boolean;
};

export function useWishlistEventHangoutQuery(
  wishlistEventId: string | null,
  options: UseWishlistEventHangoutQueryOptions = {},
) {
  return useQuery({
    queryKey: wishlistEventQueryKeys.hangoutDetail(wishlistEventId ?? ""),
    queryFn: () => getWishlistEventHangout(wishlistEventId!),
    enabled: Boolean(wishlistEventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

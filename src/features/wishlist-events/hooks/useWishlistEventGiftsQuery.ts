"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { getWishlistEventGifts } from "@/features/wishlist-events/service";
import type { WishlistEventGiftsParams } from "@/features/wishlist-events/types";

type UseWishlistEventGiftsQueryOptions = {
  enabled?: boolean;
};

export function useWishlistEventGiftsQuery(
  wishlistEventId: string | null,
  params: WishlistEventGiftsParams = {},
  options: UseWishlistEventGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 25,
  };

  return useQuery({
    queryKey: wishlistEventQueryKeys.giftList(
      wishlistEventId ?? "",
      normalizedParams,
    ),
    queryFn: () => getWishlistEventGifts(wishlistEventId!, normalizedParams),
    enabled: Boolean(wishlistEventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

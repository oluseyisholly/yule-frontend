"use client";

import { useQuery } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { getWishlistEvent } from "@/features/wishlist-events/service";

type UseWishlistEventQueryOptions = {
  enabled?: boolean;
};

export function useWishlistEventQuery(
  id: string | null,
  options: UseWishlistEventQueryOptions = {},
) {
  return useQuery({
    queryKey: wishlistEventQueryKeys.detail(id ?? ""),
    queryFn: () => getWishlistEvent(id!),
    enabled: Boolean(id) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

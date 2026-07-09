"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getContactGiftCartCount } from "@/features/gifts/service";

export function useContactGiftCartCountQuery(enabled = true) {
  return useQuery({
    queryKey: giftQueryKeys.cartCount(),
    queryFn: () => getContactGiftCartCount(),
    enabled,
    staleTime: 30 * 1000,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

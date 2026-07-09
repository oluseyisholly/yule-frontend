"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getContactGiftCartItems } from "@/features/gifts/service";
import type { ContactGiftCartItemsParams } from "@/features/gifts/types";

type UseContactGiftCartItemsQueryOptions = {
  enabled?: boolean;
};

export function useContactGiftCartItemsQuery(
  params: ContactGiftCartItemsParams = {},
  options: UseContactGiftCartItemsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 25,
  };

  return useQuery({
    queryKey: giftQueryKeys.cartItems(normalizedParams),
    queryFn: () => getContactGiftCartItems(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

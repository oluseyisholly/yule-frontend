"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getGiftById } from "@/features/gifts/service";

type UseGiftQueryOptions = {
  enabled?: boolean;
};

export function useGiftQuery(
  giftId: string | null,
  options: UseGiftQueryOptions = {},
) {
  return useQuery({
    queryKey: [...giftQueryKeys.all, "gift", giftId ?? ""] as const,
    queryFn: () => getGiftById(giftId!),
    enabled: Boolean(giftId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getEventSelectedGifts } from "@/features/gifts/service";
import type { EventSelectedGiftsParams } from "@/features/gifts/types";

type UseEventSelectedGiftsQueryOptions = {
  enabled?: boolean;
};

export function useEventSelectedGiftsQuery(
  eventId: string | null,
  params: EventSelectedGiftsParams = {},
  options: UseEventSelectedGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 250,
  };

  return useQuery({
    queryKey: giftQueryKeys.eventSelected(eventId ?? "", normalizedParams),
    queryFn: () => getEventSelectedGifts(eventId!, normalizedParams),
    enabled: Boolean(eventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

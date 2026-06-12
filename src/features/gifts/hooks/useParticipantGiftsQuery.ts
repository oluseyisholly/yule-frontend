"use client";

import { useQuery } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { getParticipantGifts } from "@/features/gifts/service";
import type { ParticipantGiftsParams } from "@/features/gifts/types";

type UseParticipantGiftsQueryOptions = {
  enabled?: boolean;
};

export function useParticipantGiftsQuery(
  participantId: string | null,
  eventId: string | null,
  params: ParticipantGiftsParams = {},
  options: UseParticipantGiftsQueryOptions = {},
) {
  const normalizedParams = {
    page: params.page ?? 1,
    per_page: params.per_page ?? 20,
  };

  return useQuery({
    queryKey: giftQueryKeys.participantGifts(
      participantId ?? "",
      eventId ?? "",
      normalizedParams,
    ),
    queryFn: () => getParticipantGifts(participantId!, eventId!, normalizedParams),
    enabled:
      Boolean(participantId) &&
      Boolean(eventId) &&
      (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

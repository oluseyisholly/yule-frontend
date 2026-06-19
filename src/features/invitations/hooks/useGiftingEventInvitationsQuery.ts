"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import { getGiftingEventInvitations } from "@/features/invitations/service";
import type { GiftingEventInvitationsParams } from "@/features/invitations/types";

type UseGiftingEventInvitationsQueryOptions = {
  enabled?: boolean;
};

export function useGiftingEventInvitationsQuery(
  giftingEventId: string | null,
  params: GiftingEventInvitationsParams = {},
  options: UseGiftingEventInvitationsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 25,
    page: params.page ?? 1,
  };

  return useQuery({
    queryKey: invitationQueryKeys.giftingEventList(
      giftingEventId ?? "",
      normalizedParams,
    ),
    queryFn: () => getGiftingEventInvitations(giftingEventId!, normalizedParams),
    enabled: Boolean(giftingEventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

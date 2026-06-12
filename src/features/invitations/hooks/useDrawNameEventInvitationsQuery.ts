"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import { getDrawNameEventInvitations } from "@/features/invitations/service";
import type { DrawNameEventInvitationsParams } from "@/features/invitations/types";

type UseDrawNameEventInvitationsQueryOptions = {
  enabled?: boolean;
};

export function useDrawNameEventInvitationsQuery(
  drawNameEventId: string | null,
  params: DrawNameEventInvitationsParams = {},
  options: UseDrawNameEventInvitationsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 25,
    page: params.page ?? 1,
    searchQuery: params.searchQuery?.trim() ?? "",
  };

  return useQuery({
    queryKey: invitationQueryKeys.drawNameEventList(
      drawNameEventId ?? "",
      normalizedParams,
    ),
    queryFn: () => getDrawNameEventInvitations(drawNameEventId!, normalizedParams),
    enabled: Boolean(drawNameEventId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

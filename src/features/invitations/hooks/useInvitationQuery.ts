"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import { getInvitationByToken } from "@/features/invitations/service";

type UseInvitationQueryOptions = {
  enabled?: boolean;
};

export function useInvitationQuery(
  token: string,
  options: UseInvitationQueryOptions = {},
) {
  return useQuery({
    queryKey: invitationQueryKeys.byToken(token),
    queryFn: () => getInvitationByToken(token),
    enabled: Boolean(token) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import { getInvitationAccountExists } from "@/features/invitations/service";

type UseInvitationAccountExistsQueryOptions = {
  enabled?: boolean;
};

export function useInvitationAccountExistsQuery(
  email: string | null | undefined,
  options: UseInvitationAccountExistsQueryOptions = {},
) {
  const normalizedEmail = email?.trim().toLowerCase() ?? "";

  return useQuery({
    queryKey: invitationQueryKeys.accountExists(normalizedEmail),
    queryFn: () => getInvitationAccountExists(normalizedEmail),
    enabled: Boolean(normalizedEmail) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

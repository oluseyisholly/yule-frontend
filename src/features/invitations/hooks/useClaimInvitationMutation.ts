"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import {
  claimInvitation,
  getInvitationByToken,
} from "@/features/invitations/service";
import type { ClaimInvitationPayload } from "@/features/invitations/types";

export function useClaimInvitationMutation(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["invitations", "claim", token],
    mutationFn: (payload: ClaimInvitationPayload) => claimInvitation(token, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: invitationQueryKeys.byToken(token),
      });
      await queryClient.prefetchQuery({
        queryKey: invitationQueryKeys.byToken(token),
        queryFn: () => getInvitationByToken(token),
      });
    },
  });
}

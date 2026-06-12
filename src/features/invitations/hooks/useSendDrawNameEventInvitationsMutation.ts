"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import { sendDrawNameEventInvitations } from "@/features/invitations/service";
import type { SendDrawNameEventInvitationsPayload } from "@/features/invitations/types";

export function useSendDrawNameEventInvitationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["invitations", "send"],
    mutationFn: ({
      drawNameEventId,
      payload,
    }: {
      drawNameEventId: string;
      payload: SendDrawNameEventInvitationsPayload;
    }) => sendDrawNameEventInvitations(drawNameEventId, payload),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: invitationQueryKeys.drawNameEventList(
          variables.drawNameEventId,
        ),
      });
    },
  });
}

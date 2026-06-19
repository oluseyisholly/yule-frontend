"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationQueryKeys } from "@/features/invitations/query-keys";
import { sendGiftingEventInvitations } from "@/features/invitations/service";
import type { SendGiftingEventInvitationsPayload } from "@/features/invitations/types";

export function useSendGiftingEventInvitationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["invitations", "gifting-send"],
    mutationFn: ({
      giftingEventId,
      payload,
    }: {
      giftingEventId: string;
      payload: SendGiftingEventInvitationsPayload;
    }) => sendGiftingEventInvitations(giftingEventId, payload),
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({
        queryKey: invitationQueryKeys.giftingEventList(
          variables.giftingEventId,
        ),
      });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { createParticipantExclusionsBulk } from "@/features/participants/service";
import type { BulkCreateParticipantExclusionsPayload } from "@/features/participants/types";

export function useCreateParticipantExclusionsBulkMutation(eventId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["participants", "exclusions", "bulk-create", eventId ?? ""],
    mutationFn: (payload: BulkCreateParticipantExclusionsPayload) =>
      createParticipantExclusionsBulk(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });

      if (!eventId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: participantQueryKeys.exclusionList(eventId),
      });
    },
  });
}

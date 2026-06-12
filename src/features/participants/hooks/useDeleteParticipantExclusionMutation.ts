"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { deleteParticipantExclusion } from "@/features/participants/service";

export function useDeleteParticipantExclusionMutation(eventId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["participants", "exclusions", "delete", eventId ?? ""],
    mutationFn: deleteParticipantExclusion,
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

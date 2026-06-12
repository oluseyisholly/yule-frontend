"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { createParticipantsBulk } from "@/features/participants/service";

export function useCreateParticipantsBulkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["participants", "bulk-create"],
    mutationFn: createParticipantsBulk,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
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
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

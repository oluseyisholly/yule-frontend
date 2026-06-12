"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { createDrawNameEventDraft } from "@/features/draw-name-events/service";

export function useCreateDrawNameEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["draw-name-events", "create"],
    mutationFn: createDrawNameEventDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
    },
  });
}

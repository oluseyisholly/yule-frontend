"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { drawNameEvent } from "@/features/draw-name-events/service";

export function useDrawNameEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["draw-name-events", "draw"],
    mutationFn: (id: string) => drawNameEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
    },
  });
}

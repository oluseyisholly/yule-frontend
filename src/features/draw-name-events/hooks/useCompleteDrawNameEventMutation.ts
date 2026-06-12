"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { completeDrawNameEvent } from "@/features/draw-name-events/service";

export function useCompleteDrawNameEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["draw-name-events", "complete"],
    mutationFn: (id: string) => completeDrawNameEvent(id),
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: drawNameEventQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: drawNameEventQueryKeys.detail(id),
        }),
      ]);
    },
  });
}

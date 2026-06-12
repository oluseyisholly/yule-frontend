"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { deleteDrawNameEvent } from "@/features/draw-name-events/service";

export function useDeleteDrawNameEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["draw-name-events", "delete"],
    mutationFn: (id: string) => deleteDrawNameEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
    },
  });
}

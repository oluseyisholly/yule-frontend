"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { deleteGiftingEvent } from "@/features/gifting-events/service";

export function useDeleteGiftingEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifting-events", "delete"],
    mutationFn: (id: string) => deleteGiftingEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
    },
  });
}

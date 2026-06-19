"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { completeGiftingEvent } from "@/features/gifting-events/service";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";

export function useCompleteGiftingEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifting-events", "complete"],
    mutationFn: (id: string) => completeGiftingEvent(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: giftingEventQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: giftQueryKeys.all,
        }),
      ]);
    },
  });
}

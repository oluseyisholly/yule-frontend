"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { createGiftingEvent } from "@/features/gifting-events/service";
import type { GiftingEventCreatePayload } from "@/features/gifting-events/types";

export function useCreateGiftingEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifting-events", "create"],
    mutationFn: (payload: GiftingEventCreatePayload) =>
      createGiftingEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
    },
  });
}

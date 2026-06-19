"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { updateGiftingEvent } from "@/features/gifting-events/service";
import type { GiftingEventPatchPayload } from "@/features/gifting-events/types";

export function useUpdateGiftingEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifting-events", "update"],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: GiftingEventPatchPayload;
    }) => updateGiftingEvent(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
    },
  });
}

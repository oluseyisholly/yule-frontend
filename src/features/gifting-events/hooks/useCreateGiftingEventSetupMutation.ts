"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { createGiftingEventSetup } from "@/features/gifting-events/service";
import type { GiftingEventSetupPayload } from "@/features/gifting-events/types";

export function useCreateGiftingEventSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifting-events", "setup", "create"],
    mutationFn: (payload: GiftingEventSetupPayload) =>
      createGiftingEventSetup(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
    },
  });
}

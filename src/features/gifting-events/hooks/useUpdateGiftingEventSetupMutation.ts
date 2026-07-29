"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { updateGiftingEventSetup } from "@/features/gifting-events/service";
import type { GiftingEventSetupPayload } from "@/features/gifting-events/types";

export function useUpdateGiftingEventSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifting-events", "setup", "update"],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: GiftingEventSetupPayload;
    }) => updateGiftingEventSetup(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
    },
  });
}

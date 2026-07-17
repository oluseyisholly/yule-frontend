"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { updateGiftFulfillment } from "@/features/gifts/service";
import type { UpdateGiftFulfillmentPayload } from "@/features/gifts/types";

export function useUpdateGiftFulfillmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifts", "fulfillment"],
    mutationFn: ({
      giftId,
      payload,
    }: {
      giftId: string;
      payload: UpdateGiftFulfillmentPayload;
    }) => updateGiftFulfillment(giftId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftQueryKeys.all,
      });
    },
  });
}

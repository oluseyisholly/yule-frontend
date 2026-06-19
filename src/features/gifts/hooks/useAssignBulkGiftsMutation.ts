"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { giftingEventQueryKeys } from "@/features/gifting-events/query-keys";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { assignBulkGifts } from "@/features/gifts/service";
import type { AssignBulkGiftsPayload } from "@/features/gifts/types";

export function useAssignBulkGiftsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifts", "assign-bulk"],
    mutationFn: (payload: AssignBulkGiftsPayload) => assignBulkGifts(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
      await queryClient.invalidateQueries({
        queryKey: giftingEventQueryKeys.all,
      });
    },
  });
}

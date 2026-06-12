"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBulkGifts } from "@/features/gifts/service";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import type { CreateBulkGiftsPayload } from "@/features/gifts/types";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";

export function useCreateBulkGiftsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifts", "bulk-create"],
    mutationFn: (payload: CreateBulkGiftsPayload) => createBulkGifts(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
    },
  });
}

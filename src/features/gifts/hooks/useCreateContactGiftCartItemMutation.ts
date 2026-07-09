"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { createContactGiftCartItem } from "@/features/gifts/service";
import type { ContactGiftCartPayload } from "@/features/gifts/types";

export function useCreateContactGiftCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifts", "cart", "create"],
    mutationFn: (payload: ContactGiftCartPayload) =>
      createContactGiftCartItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftQueryKeys.cart(),
      });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { deleteContactGiftCartItem } from "@/features/gifts/service";

export function useDeleteContactGiftCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifts", "cart", "delete"],
    mutationFn: (id: string) => deleteContactGiftCartItem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftQueryKeys.cart(),
      });
    },
  });
}

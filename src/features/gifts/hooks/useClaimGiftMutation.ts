"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimGift } from "@/features/gifts/service";
import { giftQueryKeys } from "@/features/gifts/query-keys";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";

export function useClaimGiftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gifts", "claim"],
    mutationFn: (giftId: string) => claimGift(giftId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: giftQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setupWishlistEvent } from "@/features/wishlist-events/service";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import type { WishlistEventSetupPayload } from "@/features/wishlist-events/types";

export function useSetupWishlistEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["wishlist-events", "setup"],
    mutationFn: (payload: WishlistEventSetupPayload) =>
      setupWishlistEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

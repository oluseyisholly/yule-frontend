"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWishlistEvent } from "@/features/wishlist-events/service";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import type { WishlistEventCreatePayload } from "@/features/wishlist-events/types";

export function useCreateWishlistEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["wishlist-events", "create"],
    mutationFn: (payload: WishlistEventCreatePayload) =>
      createWishlistEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

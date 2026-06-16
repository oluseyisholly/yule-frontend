"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { completeWishlistEvent } from "@/features/wishlist-events/service";

export function useCompleteWishlistEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["wishlist-events", "complete"],
    mutationFn: (id: string) => completeWishlistEvent(id),
    onSuccess: async (_response, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: wishlistEventQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: wishlistEventQueryKeys.detail(id),
        }),
        queryClient.invalidateQueries({
          queryKey: wishlistEventQueryKeys.gifts(),
        }),
      ]);
    },
  });
}

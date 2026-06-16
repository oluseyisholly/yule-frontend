"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { deleteWishlistEvent } from "@/features/wishlist-events/service";

export function useDeleteWishlistEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["wishlist-events", "delete"],
    mutationFn: (id: string) => deleteWishlistEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

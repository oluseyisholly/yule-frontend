"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { updateWishlistEvent } from "@/features/wishlist-events/service";
import type { WishlistEventPatchPayload } from "@/features/wishlist-events/types";

export function useUpdateWishlistEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["wishlist-events", "update"],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: WishlistEventPatchPayload;
    }) => updateWishlistEvent(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

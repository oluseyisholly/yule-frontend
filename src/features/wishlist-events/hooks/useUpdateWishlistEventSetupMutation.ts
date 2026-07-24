"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";
import { updateWishlistEventSetup } from "@/features/wishlist-events/service";
import type { WishlistEventSetupPayload } from "@/features/wishlist-events/types";

export function useUpdateWishlistEventSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["wishlist-events", "setup", "update"],
    mutationFn: ({ id, payload }: { id: string; payload: WishlistEventSetupPayload }) =>
      updateWishlistEventSetup(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

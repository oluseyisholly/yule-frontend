"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { claimHangoutEvent } from "@/features/hangout-events/service";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { wishlistEventQueryKeys } from "@/features/wishlist-events/query-keys";

export function useClaimHangoutEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "claim"],
    mutationFn: (hangoutEventId: string) => claimHangoutEvent(hangoutEventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
      await queryClient.invalidateQueries({
        queryKey: wishlistEventQueryKeys.all,
      });
    },
  });
}

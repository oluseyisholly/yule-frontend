"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { updateHangoutEventFulfillment } from "@/features/hangout-events/service";

export function useUpdateHangoutEventFulfillmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "fulfillment"],
    mutationFn: ({
      hangoutId,
      isFulfilled,
    }: {
      hangoutId: string;
      isFulfilled: boolean;
    }) => updateHangoutEventFulfillment(hangoutId, { isFulfilled }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

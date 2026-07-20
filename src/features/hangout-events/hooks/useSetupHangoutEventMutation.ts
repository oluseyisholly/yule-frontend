"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { setupHangoutEvent } from "@/features/hangout-events/service";
import type { HangoutEventSetupPayload } from "@/features/hangout-events/types";

export function useSetupHangoutEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "setup"],
    mutationFn: (payload: HangoutEventSetupPayload) => setupHangoutEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

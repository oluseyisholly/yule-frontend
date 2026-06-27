"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { createHangoutEvent } from "@/features/hangout-events/service";
import type { HangoutEventCreatePayload } from "@/features/hangout-events/types";

export function useCreateHangoutEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "create"],
    mutationFn: (payload: HangoutEventCreatePayload) =>
      createHangoutEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

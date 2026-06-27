"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { updateHangoutEvent } from "@/features/hangout-events/service";
import type { HangoutEventPatchPayload } from "@/features/hangout-events/types";

export function useUpdateHangoutEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "update"],
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: HangoutEventPatchPayload;
    }) => updateHangoutEvent(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

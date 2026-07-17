"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { updateHangoutEventDetails } from "@/features/hangout-events/service";
import type { HangoutEventDetailsPayload } from "@/features/hangout-events/types";

export function useUpdateHangoutEventDetailsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "update-details"],
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: string;
      payload: HangoutEventDetailsPayload;
    }) => updateHangoutEventDetails(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

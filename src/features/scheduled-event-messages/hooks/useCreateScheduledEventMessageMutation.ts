"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { createScheduledEventMessage } from "@/features/scheduled-event-messages/service";
import type { ScheduledEventMessagePayload } from "@/features/scheduled-event-messages/types";

export function useCreateScheduledEventMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "create"],
    mutationFn: (payload: ScheduledEventMessagePayload) =>
      createScheduledEventMessage(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduledEventMessageQueryKeys.all,
      });
    },
  });
}

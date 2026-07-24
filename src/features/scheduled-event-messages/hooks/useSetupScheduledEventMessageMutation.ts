"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { setupScheduledEventMessage } from "@/features/scheduled-event-messages/service";
import type { ScheduledEventMessageSetupPayload } from "@/features/scheduled-event-messages/types";

export function useSetupScheduledEventMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "setup"],
    mutationFn: (payload: ScheduledEventMessageSetupPayload) =>
      setupScheduledEventMessage(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduledEventMessageQueryKeys.all,
      });
    },
  });
}

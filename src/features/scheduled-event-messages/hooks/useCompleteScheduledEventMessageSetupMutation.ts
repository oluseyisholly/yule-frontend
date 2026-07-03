"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { completeScheduledEventMessageSetup } from "@/features/scheduled-event-messages/service";

export function useCompleteScheduledEventMessageSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "complete"],
    mutationFn: (eventId: string) => completeScheduledEventMessageSetup(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduledEventMessageQueryKeys.all,
      });
    },
  });
}

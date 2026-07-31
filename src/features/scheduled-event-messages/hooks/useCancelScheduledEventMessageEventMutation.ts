"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { cancelScheduledEventMessageEvent } from "@/features/scheduled-event-messages/service";

export function useCancelScheduledEventMessageEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "cancel-event"],
    mutationFn: (eventId: string) => cancelScheduledEventMessageEvent(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduledEventMessageQueryKeys.all,
      });
    },
  });
}

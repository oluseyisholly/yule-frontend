"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { deleteScheduledEventMessage } from "@/features/scheduled-event-messages/service";

export function useDeleteScheduledEventMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "delete"],
    mutationFn: (id: string) => deleteScheduledEventMessage(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: scheduledEventMessageQueryKeys.all,
      });
    },
  });
}

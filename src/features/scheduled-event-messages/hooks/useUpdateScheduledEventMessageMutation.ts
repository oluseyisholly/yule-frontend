"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { updateScheduledEventMessage } from "@/features/scheduled-event-messages/service";
import type { ScheduledEventMessagePayload } from "@/features/scheduled-event-messages/types";

export function useUpdateScheduledEventMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "update"],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ScheduledEventMessagePayload;
    }) => updateScheduledEventMessage(id, payload),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: scheduledEventMessageQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: scheduledEventMessageQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

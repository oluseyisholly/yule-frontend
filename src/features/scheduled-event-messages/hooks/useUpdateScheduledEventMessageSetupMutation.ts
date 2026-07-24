"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduledEventMessageQueryKeys } from "@/features/scheduled-event-messages/query-keys";
import { updateScheduledEventMessageSetup } from "@/features/scheduled-event-messages/service";
import type { ScheduledEventMessageSetupPayload } from "@/features/scheduled-event-messages/types";

export function useUpdateScheduledEventMessageSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["scheduled-event-messages", "update-setup"],
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ScheduledEventMessageSetupPayload;
    }) => updateScheduledEventMessageSetup(id, payload),
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

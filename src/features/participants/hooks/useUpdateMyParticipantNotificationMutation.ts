"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { participantQueryKeys } from "@/features/participants/query-keys";
import { updateMyParticipantNotification } from "@/features/participants/service";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";

type UpdateMyParticipantNotificationVariables = {
  eventId: string;
  payload: {
    isNotified: true | "true";
  };
};

export function useUpdateMyParticipantNotificationMutation(eventId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId: targetEventId,
      payload,
    }: UpdateMyParticipantNotificationVariables) =>
      updateMyParticipantNotification(targetEventId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: participantQueryKeys.list(variables.eventId),
        }),
        queryClient.invalidateQueries({
          queryKey: drawNameEventQueryKeys.lists(),
        }),
      ]);
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { hangoutEventQueryKeys } from "@/features/hangout-events/query-keys";
import { updateHangoutEventSetup } from "@/features/hangout-events/service";
import type { HangoutEventSetupPayload } from "@/features/hangout-events/types";

export function useUpdateHangoutEventSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["hangout-events", "setup", "update"],
    mutationFn: ({
      hangoutId,
      payload,
    }: {
      hangoutId: string;
      payload: HangoutEventSetupPayload;
    }) => updateHangoutEventSetup(hangoutId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: hangoutEventQueryKeys.all,
      });
    },
  });
}

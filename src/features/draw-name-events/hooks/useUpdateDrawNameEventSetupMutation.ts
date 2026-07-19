"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { updateDrawNameEventSetup } from "@/features/draw-name-events/service";
import type { DrawNameEventSetupPayload } from "@/features/draw-name-events/types";

type UpdateDrawNameEventSetupMutationArgs = {
  id: string;
  payload: DrawNameEventSetupPayload;
};

export function useUpdateDrawNameEventSetupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["draw-name-events", "setup", "update"],
    mutationFn: ({ id, payload }: UpdateDrawNameEventSetupMutationArgs) =>
      updateDrawNameEventSetup(id, payload),
    onSuccess: async (_response, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: drawNameEventQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: drawNameEventQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

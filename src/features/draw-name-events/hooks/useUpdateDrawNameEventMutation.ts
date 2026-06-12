"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { drawNameEventQueryKeys } from "@/features/draw-name-events/query-keys";
import { updateDrawNameEventDraft } from "@/features/draw-name-events/service";
import type { DrawNameEventPatchPayload } from "@/features/draw-name-events/types";

type UpdateDrawNameEventMutationArgs = {
  id: string;
  payload: DrawNameEventPatchPayload;
};

export function useUpdateDrawNameEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["draw-name-events", "update"],
    mutationFn: ({ id, payload }: UpdateDrawNameEventMutationArgs) =>
      updateDrawNameEventDraft(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: drawNameEventQueryKeys.lists(),
      });
    },
  });
}

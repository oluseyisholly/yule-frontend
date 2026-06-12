"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { updateContact } from "@/features/contacts/service";
import type { UpdateContactPayload } from "@/features/contacts/types";

type UpdateContactMutationArgs = {
  id: string;
  payload: UpdateContactPayload;
};

export function useUpdateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["contacts", "update"],
    mutationFn: ({ id, payload }: UpdateContactMutationArgs) =>
      updateContact(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(),
      });
    },
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { updateContactConnection } from "@/features/contacts/service";

type UpdateContactConnectionMutationArgs = {
  id: string;
  payload: {
    relationshipId: string;
  };
};

export function useUpdateContactConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["contacts", "update-connection"],
    mutationFn: ({ id, payload }: UpdateContactConnectionMutationArgs) =>
      updateContactConnection(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(),
      });
    },
  });
}

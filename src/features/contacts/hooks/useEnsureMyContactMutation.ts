"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { ensureMyContact } from "@/features/contacts/service";

export function useEnsureMyContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["contacts", "me", "ensure"],
    mutationFn: ensureMyContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(),
      });
    },
  });
}

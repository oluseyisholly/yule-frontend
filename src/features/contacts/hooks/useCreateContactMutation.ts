"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { createContact } from "@/features/contacts/service";

export function useCreateContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["contacts", "create"],
    mutationFn: createContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(),
      });
    },
  });
}

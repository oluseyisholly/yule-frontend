"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { deleteContact } from "@/features/contacts/service";

export function useDeleteContactMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["contacts", "delete"],
    mutationFn: deleteContact,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(),
      });
    },
  });
}

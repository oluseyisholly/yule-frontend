"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { createBulkContacts } from "@/features/contacts/service";

export function useCreateBulkContactsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["contacts", "bulk-create"],
    mutationFn: createBulkContacts,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: contactQueryKeys.lists(),
      });
    },
  });
}

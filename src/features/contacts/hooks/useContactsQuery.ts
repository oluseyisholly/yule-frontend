"use client";

import { useQuery } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { getContacts } from "@/features/contacts/service";
import type { ContactsParams } from "@/features/contacts/types";

type UseContactsQueryOptions = {
  enabled?: boolean;
};

export function useContactsQuery(
  params: ContactsParams = {},
  options: UseContactsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 25,
    page: params.page ?? 1,
    searchQuery: params.searchQuery ?? "",
  };

  return useQuery({
    queryKey: contactQueryKeys.list(normalizedParams),
    queryFn: () => getContacts(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

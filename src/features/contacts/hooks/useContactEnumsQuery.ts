"use client";

import { useQuery } from "@tanstack/react-query";
import { contactQueryKeys } from "@/features/contacts/query-keys";
import { getContactEnums } from "@/features/contacts/service";

export function useContactEnumsQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: contactQueryKeys.enums(),
    queryFn: getContactEnums,
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
}

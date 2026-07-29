"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { relationshipQueryKeys } from "@/features/relationships/query-keys";
import { getAvailableRelationships } from "@/features/relationships/service";
import type { AvailableRelationshipsParams } from "@/features/relationships/types";

type UseAvailableRelationshipsQueryOptions = {
  enabled?: boolean;
};

export function useAvailableRelationshipsQuery(
  params: AvailableRelationshipsParams = {},
  options: UseAvailableRelationshipsQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 25,
    page: params.page ?? 1,
    searchQuery: params.searchQuery?.trim() ?? "",
  };

  return useQuery({
    queryKey: relationshipQueryKeys.available(normalizedParams),
    queryFn: () => getAvailableRelationships(normalizedParams),
    enabled: options.enabled ?? true,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
}

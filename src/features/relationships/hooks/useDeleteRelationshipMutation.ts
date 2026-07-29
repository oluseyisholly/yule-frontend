"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { relationshipQueryKeys } from "@/features/relationships/query-keys";
import { deleteRelationship } from "@/features/relationships/service";
import type { AvailableRelationshipsResponse } from "@/features/relationships/types";

export function useDeleteRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["relationships", "delete"],
    mutationFn: deleteRelationship,
    onSuccess: (_response, deletedId) => {
      queryClient.setQueriesData<AvailableRelationshipsResponse>(
        { queryKey: relationshipQueryKeys.availableLists() },
        (current) => {
          if (!current) {
            return current;
          }

          const hadDeletedItem = current.data.data.some(
            (relationship) => relationship.id === deletedId,
          );
          const nextTotal = hadDeletedItem
            ? Math.max(0, current.data.total - 1)
            : current.data.total;

          return {
            ...current,
            data: {
              ...current.data,
              data: current.data.data.filter(
                (relationship) => relationship.id !== deletedId,
              ),
              total: nextTotal,
              totalPages: Math.max(
                1,
                Math.ceil(nextTotal / current.data.pageSize),
              ),
            },
          };
        },
      );
    },
  });
}

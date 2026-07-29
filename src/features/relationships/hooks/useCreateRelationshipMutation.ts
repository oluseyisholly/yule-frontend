"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { relationshipQueryKeys } from "@/features/relationships/query-keys";
import { createRelationship } from "@/features/relationships/service";
import type {
  AvailableRelationship,
  AvailableRelationshipsResponse,
} from "@/features/relationships/types";

function toAvailableRelationship(
  relationship: NonNullable<
    Awaited<ReturnType<typeof createRelationship>>["data"]
  >,
): AvailableRelationship {
  return {
    id: relationship.id,
    name: relationship.name,
    description: relationship.description ?? "",
    isActive: relationship.isActive ?? true,
    createdAt: relationship.createdAt ?? "",
    updatedAt: relationship.updatedAt ?? "",
  };
}

export function useCreateRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["relationships", "create"],
    mutationFn: createRelationship,
    onSuccess: (response) => {
      if (!response.data) {
        return;
      }

      const createdRelationship = toAvailableRelationship(response.data);

      queryClient.setQueriesData<AvailableRelationshipsResponse>(
        { queryKey: relationshipQueryKeys.availableLists() },
        (current) => {
          if (!current) {
            return current;
          }

          const alreadyExists = current.data.data.some(
            (relationship) => relationship.id === createdRelationship.id,
          );

          const nextItems = alreadyExists
            ? current.data.data.map((relationship) =>
                relationship.id === createdRelationship.id
                  ? createdRelationship
                  : relationship,
              )
            : current.data.page === 1
              ? [createdRelationship, ...current.data.data].slice(
                  0,
                  current.data.pageSize,
                )
              : current.data.data;

          const nextTotal = alreadyExists
            ? current.data.total
            : current.data.total + 1;

          return {
            ...current,
            data: {
              ...current.data,
              data: nextItems,
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

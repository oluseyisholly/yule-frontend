"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { relationshipQueryKeys } from "@/features/relationships/query-keys";
import { updateRelationship } from "@/features/relationships/service";
import type {
  AvailableRelationshipsResponse,
  RelationshipMutationPayload,
} from "@/features/relationships/types";

type UpdateRelationshipMutationVariables = {
  id: string;
  payload: RelationshipMutationPayload;
};

export function useUpdateRelationshipMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["relationships", "update"],
    mutationFn: ({ id, payload }: UpdateRelationshipMutationVariables) =>
      updateRelationship(id, payload),
    onSuccess: (response, variables) => {
      queryClient.setQueriesData<AvailableRelationshipsResponse>(
        { queryKey: relationshipQueryKeys.availableLists() },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              data: current.data.data.map((relationship) =>
                relationship.id === variables.id
                  ? {
                      ...relationship,
                      name: response.data?.name ?? variables.payload.name,
                      description:
                        response.data?.description ??
                        variables.payload.description ??
                        relationship.description,
                      isActive:
                        response.data?.isActive ??
                        variables.payload.isActive ??
                        relationship.isActive,
                      updatedAt:
                        response.data?.updatedAt ?? relationship.updatedAt,
                    }
                  : relationship,
              ),
            },
          };
        },
      );
    },
  });
}

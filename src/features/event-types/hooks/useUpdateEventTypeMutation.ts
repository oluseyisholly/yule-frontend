"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEventType } from "@/features/event-types/service";
import { eventTypeQueryKeys } from "@/features/event-types/query-keys";
import type {
  AvailableEventTypesResponse,
  EventTypeMutationPayload,
} from "@/features/event-types/types";

type UpdateEventTypeMutationVariables = {
  id: string;
  payload: EventTypeMutationPayload;
};

export function useUpdateEventTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["event-types", "update"],
    mutationFn: ({ id, payload }: UpdateEventTypeMutationVariables) =>
      updateEventType(id, payload),
    onSuccess: (response, variables) => {
      queryClient.setQueriesData<AvailableEventTypesResponse>(
        { queryKey: eventTypeQueryKeys.availableLists() },
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              data: current.data.data.map((eventType) =>
                eventType.id === variables.id
                  ? {
                      ...eventType,
                      name: response.data?.name ?? variables.payload.name,
                      description:
                        response.data?.description ?? eventType.description,
                      updatedAt: response.data?.updatedAt ?? eventType.updatedAt,
                      key: response.data?.key ?? eventType.key,
                      createdById:
                        response.data?.createdById ?? eventType.createdById,
                      user_id: response.data?.user_id ?? eventType.user_id,
                    }
                  : eventType,
              ),
            },
          };
        },
      );
    },
  });
}

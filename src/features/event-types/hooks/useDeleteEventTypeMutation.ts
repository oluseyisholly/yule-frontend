"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEventType } from "@/features/event-types/service";
import { eventTypeQueryKeys } from "@/features/event-types/query-keys";
import type { AvailableEventTypesResponse } from "@/features/event-types/types";

export function useDeleteEventTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["event-types", "delete"],
    mutationFn: deleteEventType,
    onSuccess: (_response, deletedId) => {
      queryClient.setQueriesData<AvailableEventTypesResponse>(
        { queryKey: eventTypeQueryKeys.availableLists() },
        (current) => {
          if (!current) {
            return current;
          }

          const hadDeletedItem = current.data.data.some(
            (eventType) => eventType.id === deletedId,
          );
          const nextTotal = hadDeletedItem
            ? Math.max(0, current.data.total - 1)
            : current.data.total;

          return {
            ...current,
            data: {
              ...current.data,
              data: current.data.data.filter(
                (eventType) => eventType.id !== deletedId,
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

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEventType } from "@/features/event-types/service";
import { eventTypeQueryKeys } from "@/features/event-types/query-keys";
import type {
  AvailableEventType,
  AvailableEventTypesResponse,
} from "@/features/event-types/types";

function toAvailableEventType(
  eventType: NonNullable<Awaited<ReturnType<typeof createEventType>>["data"]>,
): AvailableEventType {
  return {
    id: eventType.id,
    name: eventType.name,
    description: eventType.description ?? "",
    isActive: eventType.isActive ?? true,
    createdAt: eventType.createdAt ?? "",
    updatedAt: eventType.updatedAt ?? "",
    deletedAt: null,
    createdById: eventType.createdById ?? null,
    user_id: eventType.user_id ?? null,
    key: eventType.key ?? null,
  };
}

export function useCreateEventTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["event-types", "create"],
    mutationFn: createEventType,
    onSuccess: (response) => {
      if (!response.data) {
        return;
      }

      const createdEventType = toAvailableEventType(response.data);

      queryClient.setQueriesData<AvailableEventTypesResponse>(
        { queryKey: eventTypeQueryKeys.availableLists() },
        (current) => {
          if (!current) {
            return current;
          }

          const alreadyExists = current.data.data.some(
            (eventType) => eventType.id === createdEventType.id,
          );

          const nextItems = alreadyExists
            ? current.data.data.map((eventType) =>
                eventType.id === createdEventType.id
                  ? createdEventType
                  : eventType,
              )
            : current.data.page === 1
              ? [createdEventType, ...current.data.data].slice(
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

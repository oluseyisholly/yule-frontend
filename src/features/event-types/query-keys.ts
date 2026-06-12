import type { AvailableEventTypesParams } from "@/features/event-types/types";

export const eventTypeQueryKeys = {
  all: ["event-types"] as const,
  availableLists: () => [...eventTypeQueryKeys.all, "available"] as const,
  available: (params: AvailableEventTypesParams = {}) =>
    [
      ...eventTypeQueryKeys.availableLists(),
      params.per_page ?? 10,
      params.page ?? 1,
    ] as const,
};

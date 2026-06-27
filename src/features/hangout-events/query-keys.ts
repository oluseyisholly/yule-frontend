import type { HangoutEventsParams } from "@/features/hangout-events/types";

export const hangoutEventQueryKeys = {
  all: ["hangout-events"] as const,
  metrics: () => [...hangoutEventQueryKeys.all, "metrics"] as const,
  lists: () => [...hangoutEventQueryKeys.all, "list"] as const,
  list: (params: HangoutEventsParams = {}) =>
    [
      ...hangoutEventQueryKeys.lists(),
      params.scope ?? "all",
      params.per_page ?? 25,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
  detail: (eventId: string | null) =>
    [...hangoutEventQueryKeys.all, "detail", eventId ?? ""] as const,
};

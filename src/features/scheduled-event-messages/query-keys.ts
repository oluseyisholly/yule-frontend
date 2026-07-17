import type { ScheduledEventMessagesParams } from "@/features/scheduled-event-messages/types";

export const scheduledEventMessageQueryKeys = {
  all: ["scheduled-event-messages"] as const,
  metrics: () => [...scheduledEventMessageQueryKeys.all, "metrics"] as const,
  lists: () => [...scheduledEventMessageQueryKeys.all, "list"] as const,
  list: (params: ScheduledEventMessagesParams = {}) =>
    [
      ...scheduledEventMessageQueryKeys.lists(),
      params.per_page ?? 20,
      params.page ?? 1,
      params.searchQuery ?? "",
      params.eventTiming ?? "",
    ] as const,
  detail: (id: string | null) =>
    [...scheduledEventMessageQueryKeys.all, "detail", id ?? ""] as const,
};

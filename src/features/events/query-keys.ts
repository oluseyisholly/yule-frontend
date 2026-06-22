import type { ParticipatedEventsParams } from "@/features/events/types";

export const participatedEventQueryKeys = {
  all: ["participated-events"] as const,
  lists: () => [...participatedEventQueryKeys.all, "list"] as const,
  list: (params: ParticipatedEventsParams = {}) =>
    [
      ...participatedEventQueryKeys.lists(),
      params.per_page ?? 6,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
};

import type { DrawNameEventsParams } from "@/features/draw-name-events/types";

export const drawNameEventQueryKeys = {
  all: ["draw-name-events"] as const,
  lists: () => [...drawNameEventQueryKeys.all, "list"] as const,
  details: () => [...drawNameEventQueryKeys.all, "detail"] as const,
  list: (params: DrawNameEventsParams = {}) =>
    [
      ...drawNameEventQueryKeys.lists(),
      params.scope ?? "all",
      params.per_page ?? 10,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
  detail: (id: string) => [...drawNameEventQueryKeys.details(), id] as const,
};

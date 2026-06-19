import type { GiftingEventsParams } from "@/features/gifting-events/types";

export const giftingEventQueryKeys = {
  all: ["gifting-events"] as const,
  lists: () => [...giftingEventQueryKeys.all, "list"] as const,
  list: (params: GiftingEventsParams = {}) =>
    [
      ...giftingEventQueryKeys.lists(),
      params.per_page ?? 10,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
};

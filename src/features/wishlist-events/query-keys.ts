import type {
  WishlistEventGiftsParams,
  WishlistEventsParams,
} from "@/features/wishlist-events/types";

export const wishlistEventQueryKeys = {
  all: ["wishlist-events"] as const,
  lists: () => [...wishlistEventQueryKeys.all, "list"] as const,
  details: () => [...wishlistEventQueryKeys.all, "detail"] as const,
  gifts: () => [...wishlistEventQueryKeys.all, "gifts"] as const,
  claimedGiftIds: () =>
    [...wishlistEventQueryKeys.all, "claimed-gift-ids"] as const,
  list: (params: WishlistEventsParams = {}) =>
    [
      ...wishlistEventQueryKeys.lists(),
      params.per_page ?? 10,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
  detail: (id: string) => [...wishlistEventQueryKeys.details(), id] as const,
  giftList: (
    wishlistEventId: string,
    params: WishlistEventGiftsParams = {},
  ) =>
    [
      ...wishlistEventQueryKeys.gifts(),
      wishlistEventId,
      params.page ?? 1,
      params.per_page ?? 25,
      params.searchQuery ?? "",
    ] as const,
  claimedGiftIdList: (wishlistEventId: string) =>
    [...wishlistEventQueryKeys.claimedGiftIds(), wishlistEventId] as const,
};

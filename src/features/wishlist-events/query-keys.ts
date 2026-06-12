import type { WishlistEventGiftsParams } from "@/features/wishlist-events/types";

export const wishlistEventQueryKeys = {
  all: ["wishlist-events"] as const,
  details: () => [...wishlistEventQueryKeys.all, "detail"] as const,
  gifts: () => [...wishlistEventQueryKeys.all, "gifts"] as const,
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
    ] as const,
};

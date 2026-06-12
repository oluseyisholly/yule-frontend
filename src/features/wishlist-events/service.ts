import { getApi, postApi } from "@/lib/api";
import type {
  WishlistEventCreatePayload,
  WishlistEventGiftsParams,
  WishlistEventGiftsResponse,
  WishlistEventMutationResponse,
} from "@/features/wishlist-events/types";

const WISHLIST_EVENTS_ENDPOINT = "/wishlist-event";

export async function createWishlistEvent(payload: WishlistEventCreatePayload) {
  return postApi<WishlistEventMutationResponse, WishlistEventCreatePayload>(
    WISHLIST_EVENTS_ENDPOINT,
    payload,
  );
}

export async function getWishlistEventGifts(
  wishlistEventId: string,
  params: WishlistEventGiftsParams = {},
) {
  return getApi<WishlistEventGiftsResponse>(
    `${WISHLIST_EVENTS_ENDPOINT}/${wishlistEventId}/gifts`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 25,
      },
    },
  );
}

import { getApi, patchApi, postApi } from "@/lib/api";
import type {
  WishlistEventCreatePayload,
  WishlistEventGiftsParams,
  WishlistEventGiftsResponse,
  WishlistEventPatchPayload,
  WishlistEventsParams,
  WishlistEventsResponse,
  WishlistEventMutationResponse,
} from "@/features/wishlist-events/types";

const WISHLIST_EVENTS_ENDPOINT = "/wishlist-event";

export async function getWishlistEvents(params: WishlistEventsParams = {}) {
  return getApi<WishlistEventsResponse>(WISHLIST_EVENTS_ENDPOINT, {
    params: {
      per_page: params.per_page ?? 10,
      page: params.page ?? 1,
      searchQuery: params.searchQuery ?? "",
    },
  });
}

export async function createWishlistEvent(payload: WishlistEventCreatePayload) {
  return postApi<WishlistEventMutationResponse, WishlistEventCreatePayload>(
    WISHLIST_EVENTS_ENDPOINT,
    payload,
  );
}

export async function updateWishlistEvent(
  id: string,
  payload: WishlistEventPatchPayload,
) {
  return patchApi<WishlistEventMutationResponse, WishlistEventPatchPayload>(
    `${WISHLIST_EVENTS_ENDPOINT}/${id}`,
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

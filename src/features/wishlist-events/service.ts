import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  WishlistEventClaimedGiftIdsResponse,
  WishlistEventCompleteResponse,
  WishlistEventCreatePayload,
  WishlistEventDeleteResponse,
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

export async function getWishlistEvent(id: string) {
  return getApi<WishlistEventMutationResponse>(`${WISHLIST_EVENTS_ENDPOINT}/${id}`);
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

export async function completeWishlistEvent(id: string) {
  return patchApi<WishlistEventCompleteResponse>(
    `${WISHLIST_EVENTS_ENDPOINT}/${id}/complete`,
  );
}

export async function deleteWishlistEvent(id: string) {
  return deleteApi<WishlistEventDeleteResponse>(
    `${WISHLIST_EVENTS_ENDPOINT}/${id}`,
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
        searchQuery: params.searchQuery ?? "",
      },
    },
  );
}

export async function getWishlistEventClaimedGiftIds(wishlistEventId: string) {
  return getApi<WishlistEventClaimedGiftIdsResponse>(
    `${WISHLIST_EVENTS_ENDPOINT}/${wishlistEventId}/gifts/claimed-ids`,
  );
}

import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  GiftingEventCompletePayload,
  GiftingEventCreatePayload,
  GiftingEventDeleteResponse,
  GiftingEventMutationResponse,
  GiftingEventsParams,
  GiftingEventsResponse,
  GiftingEventPatchPayload,
} from "@/features/gifting-events/types";

const GIFTING_EVENTS_ENDPOINT = "/gifting-event";

export async function getGiftingEvents(params: GiftingEventsParams = {}) {
  return getApi<GiftingEventsResponse>(GIFTING_EVENTS_ENDPOINT, {
    params: {
      per_page: params.per_page ?? 10,
      page: params.page ?? 1,
      searchQuery: params.searchQuery ?? "",
    },
  });
}

export async function createGiftingEvent(payload: GiftingEventCreatePayload) {
  return postApi<GiftingEventMutationResponse, GiftingEventCreatePayload>(
    GIFTING_EVENTS_ENDPOINT,
    payload,
  );
}

export async function updateGiftingEvent(
  id: string,
  payload: GiftingEventPatchPayload,
) {
  return patchApi<GiftingEventMutationResponse, GiftingEventPatchPayload>(
    `${GIFTING_EVENTS_ENDPOINT}/${id}`,
    payload,
  );
}

export async function deleteGiftingEvent(id: string) {
  return deleteApi<GiftingEventDeleteResponse>(
    `${GIFTING_EVENTS_ENDPOINT}/${id}`,
  );
}

export async function completeGiftingEvent(id: string) {
  return patchApi<GiftingEventMutationResponse, GiftingEventCompletePayload>(
    `${GIFTING_EVENTS_ENDPOINT}/${id}/complete`,
    {
      event: {
        status: "completed",
      },
    },
  );
}

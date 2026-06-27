import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  HangoutEventCompletePayload,
  HangoutEventCreatePayload,
  HangoutEventDeleteResponse,
  HangoutEventMutationResponse,
  HangoutEventPatchPayload,
  HangoutEventResponse,
  HangoutEventsParams,
  HangoutEventsResponse,
  HangoutMetricsResponse,
} from "@/features/hangout-events/types";

const HANGOUT_EVENTS_ENDPOINT = "/hangout-event";

export async function getHangoutMetrics() {
  return getApi<HangoutMetricsResponse>(`/dashboard/hangout-metrics`);
}

export async function getHangoutEvents(params: HangoutEventsParams = {}) {
  const resolvedSearchQuery = params.searchQuery?.trim();
  const endpoint =
    params.scope === "organizer"
      ? `${HANGOUT_EVENTS_ENDPOINT}/created`
      : params.scope === "participant"
        ? `${HANGOUT_EVENTS_ENDPOINT}/participated`
        : HANGOUT_EVENTS_ENDPOINT;

  return getApi<HangoutEventsResponse>(endpoint, {
    params: {
      per_page: params.per_page ?? 25,
      page: params.page ?? 1,
      ...(resolvedSearchQuery ? { searchQuery: resolvedSearchQuery } : {}),
    },
  });
}

export async function getHangoutEvent(eventId: string) {
  return getApi<HangoutEventResponse>(`${HANGOUT_EVENTS_ENDPOINT}/${eventId}`);
}

export async function createHangoutEvent(payload: HangoutEventCreatePayload) {
  return postApi<HangoutEventMutationResponse, HangoutEventCreatePayload>(
    HANGOUT_EVENTS_ENDPOINT,
    payload,
  );
}

export async function updateHangoutEvent(
  eventId: string,
  payload: HangoutEventPatchPayload,
) {
  return patchApi<HangoutEventMutationResponse, HangoutEventPatchPayload>(
    `${HANGOUT_EVENTS_ENDPOINT}/${eventId}`,
    payload,
  );
}

export async function completeHangoutEvent(eventId: string) {
  return patchApi<HangoutEventMutationResponse, HangoutEventCompletePayload>(
    `${HANGOUT_EVENTS_ENDPOINT}/${eventId}/complete`,
    {
      event: {
        status: "completed",
      },
    },
  );
}

export async function deleteHangoutEvent(eventId: string) {
  return deleteApi<HangoutEventDeleteResponse>(
    `${HANGOUT_EVENTS_ENDPOINT}/${eventId}`,
  );
}

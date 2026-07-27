import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  HangoutEventCompletePayload,
  HangoutEventDetailsPayload,
  HangoutEventDetailsResponse,
  HangoutEventCreatePayload,
  HangoutEventDeleteResponse,
  HangoutEventFulfillmentPayload,
  HangoutEventMutationResponse,
  HangoutEventPatchPayload,
  HangoutEventResponse,
  HangoutEventSetupPayload,
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
        : params.scope === "sponsored"
          ? `${HANGOUT_EVENTS_ENDPOINT}/sponsored`
        : HANGOUT_EVENTS_ENDPOINT;

  return getApi<HangoutEventsResponse>(endpoint, {
    params: {
      per_page: params.per_page ?? 25,
      page: params.page ?? 1,
      ...(resolvedSearchQuery ? { searchQuery: resolvedSearchQuery } : {}),
      ...(params.status?.trim() ? { status: params.status.trim() } : {}),
      ...(params.startDate?.trim()
        ? { startDate: params.startDate.trim() }
        : {}),
      ...(params.endDate?.trim() ? { endDate: params.endDate.trim() } : {}),
      ...(params.sortOrder?.trim()
        ? { sortOrder: params.sortOrder.trim() }
        : params.scope === "sponsored"
          ? { sortOrder: "DESC" }
          : {}),
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

export async function setupHangoutEvent(payload: HangoutEventSetupPayload) {
  return postApi<HangoutEventMutationResponse, HangoutEventSetupPayload>(
    `${HANGOUT_EVENTS_ENDPOINT}/setup`,
    payload,
  );
}

export async function updateHangoutEventSetup(
  hangoutId: string,
  payload: HangoutEventSetupPayload,
) {
  return patchApi<HangoutEventMutationResponse, HangoutEventSetupPayload>(
    `${HANGOUT_EVENTS_ENDPOINT}/${hangoutId}/setup`,
    payload,
  );
}

export async function updateHangoutEventDetails(
  eventId: string,
  payload: HangoutEventDetailsPayload,
) {
  return patchApi<HangoutEventDetailsResponse, HangoutEventDetailsPayload>(
    `${HANGOUT_EVENTS_ENDPOINT}/event/${eventId}/details`,
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

export async function updateHangoutEventFulfillment(
  hangoutId: string,
  payload: HangoutEventFulfillmentPayload,
) {
  return patchApi<
    HangoutEventMutationResponse,
    HangoutEventFulfillmentPayload
  >(`${HANGOUT_EVENTS_ENDPOINT}/${hangoutId}/fulfillment`, payload);
}

export async function claimHangoutEvent(hangoutEventId: string) {
  return patchApi<HangoutEventMutationResponse>(
    `${HANGOUT_EVENTS_ENDPOINT}/${hangoutEventId}/claim`,
  );
}

export async function deleteHangoutEvent(eventId: string) {
  return deleteApi<HangoutEventDeleteResponse>(
    `${HANGOUT_EVENTS_ENDPOINT}/${eventId}`,
  );
}

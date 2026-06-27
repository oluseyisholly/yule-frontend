import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  DeleteDrawNameEventResponse,
  DrawNameEventCreatePayload,
  DrawNameEventMutationResponse,
  DrawNameEventPatchPayload,
  DrawNameEventsParams,
  DrawNameEventsResponse,
  DrawNameMetricsResponse,
} from "@/features/draw-name-events/types";

const DRAW_NAME_EVENTS_ENDPOINT = "/draw-name-event";

export async function getDrawNameEvents(params: DrawNameEventsParams = {}) {
  const endpoint =
    params.scope === "organizer"
      ? `${DRAW_NAME_EVENTS_ENDPOINT}/created`
      : params.scope === "participant"
        ? `${DRAW_NAME_EVENTS_ENDPOINT}/participated`
        : DRAW_NAME_EVENTS_ENDPOINT;

  return getApi<DrawNameEventsResponse>(endpoint, {
    params: {
      per_page: params.per_page ?? 10,
      page: params.page ?? 1,
      searchQuery: params.searchQuery ?? "",
    },
  });
}

export async function getDrawNameEvent(id: string) {
  return getApi<DrawNameEventMutationResponse>(`${DRAW_NAME_EVENTS_ENDPOINT}/${id}`);
}

export async function createDrawNameEventDraft(payload: DrawNameEventCreatePayload) {
  return postApi<DrawNameEventMutationResponse, DrawNameEventCreatePayload>(
    DRAW_NAME_EVENTS_ENDPOINT,
    payload,
  );
}

export async function updateDrawNameEventDraft(
  id: string,
  payload: DrawNameEventPatchPayload,
) {
  return patchApi<DrawNameEventMutationResponse, DrawNameEventPatchPayload>(
    `${DRAW_NAME_EVENTS_ENDPOINT}/${id}`,
    payload,
  );
}

export async function drawNameEvent(id: string) {
  return postApi<DrawNameEventMutationResponse>(
    `${DRAW_NAME_EVENTS_ENDPOINT}/${id}/draw`,
  );
}

export async function completeDrawNameEvent(id: string) {
  return patchApi<DrawNameEventMutationResponse>(
    `${DRAW_NAME_EVENTS_ENDPOINT}/${id}/complete`,
  );
}

export async function deleteDrawNameEvent(id: string) {
  return deleteApi<DeleteDrawNameEventResponse>(
    `${DRAW_NAME_EVENTS_ENDPOINT}/${id}`,
  );
}

export async function getDrawNameMetrics() {
  // GET /dashboard/draw-name-metrics
  return getApi<DrawNameMetricsResponse>(`/dashboard/draw-name-metrics`);
}

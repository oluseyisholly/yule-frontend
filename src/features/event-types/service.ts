import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  AvailableEventTypesParams,
  AvailableEventTypesResponse,
  EventTypeMutationPayload,
  EventTypeMutationResponse,
} from "@/features/event-types/types";

const AVAILABLE_EVENT_TYPES_ENDPOINT = "/event-type/available";
const EVENT_TYPES_ENDPOINT = "/event-type";

export async function getAvailableEventTypes(
  params: AvailableEventTypesParams = {},
) {
  return getApi<AvailableEventTypesResponse>(AVAILABLE_EVENT_TYPES_ENDPOINT, {
    params: {
      per_page: params.per_page ?? 10,
      page: params.page ?? 1,
    },
  });
}

export async function createEventType(payload: EventTypeMutationPayload) {
  return postApi<EventTypeMutationResponse, EventTypeMutationPayload>(
    EVENT_TYPES_ENDPOINT,
    payload,
  );
}

export async function updateEventType(
  id: string,
  payload: EventTypeMutationPayload,
) {
  return patchApi<EventTypeMutationResponse, EventTypeMutationPayload>(
    `${EVENT_TYPES_ENDPOINT}/${id}`,
    payload,
  );
}

export async function deleteEventType(id: string) {
  return deleteApi<EventTypeMutationResponse>(`${EVENT_TYPES_ENDPOINT}/${id}`);
}

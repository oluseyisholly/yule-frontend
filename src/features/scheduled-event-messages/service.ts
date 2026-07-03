import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  CompleteScheduledEventMessageSetupResponse,
  ScheduledEventMessageDeleteResponse,
  ScheduledEventMessagePayload,
  ScheduledEventMessageResponse,
  ScheduledEventMessagesParams,
  ScheduledEventMessagesResponse,
} from "@/features/scheduled-event-messages/types";

const SCHEDULED_EVENT_MESSAGES_ENDPOINT = "/scheduled-event-message";

export async function getCreatedScheduledEventMessages(
  params: ScheduledEventMessagesParams = {},
) {
  const resolvedSearchQuery = params.searchQuery?.trim();

  return getApi<ScheduledEventMessagesResponse>(
    `${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/created`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
        ...(params.eventTiming ? { eventTiming: params.eventTiming } : {}),
        ...(resolvedSearchQuery ? { searchQuery: resolvedSearchQuery } : {}),
      },
    },
  );
}

export async function getScheduledEventMessage(id: string) {
  return getApi<ScheduledEventMessageResponse>(
    `${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/${id}`,
  );
}

export async function createScheduledEventMessage(
  payload: ScheduledEventMessagePayload,
) {
  return postApi<ScheduledEventMessageResponse, ScheduledEventMessagePayload>(
    SCHEDULED_EVENT_MESSAGES_ENDPOINT,
    payload,
  );
}

export async function updateScheduledEventMessage(
  id: string,
  payload: ScheduledEventMessagePayload,
) {
  return patchApi<ScheduledEventMessageResponse, ScheduledEventMessagePayload>(
    `${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/${id}`,
    payload,
  );
}

export async function deleteScheduledEventMessage(id: string) {
  return deleteApi<ScheduledEventMessageDeleteResponse>(
    `${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/${id}`,
  );
}

export async function completeScheduledEventMessageSetup(eventId: string) {
  return patchApi<CompleteScheduledEventMessageSetupResponse>(
    `${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/event/${eventId}/complete`,
  );
}

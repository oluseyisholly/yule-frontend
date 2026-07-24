import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  CompleteScheduledEventMessageSetupResponse,
  ScheduledEventMessageDeleteResponse,
  ScheduledEventMessagePayload,
  ScheduledEventMessageSetupPayload,
  ScheduledEventMessageResponse,
  ScheduledEventMessageMetricsResponse,
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

export async function getScheduledEventMessageMetrics() {
  return getApi<ScheduledEventMessageMetricsResponse>(
    "/dashboard/scheduled-event-message-metrics",
  );
}

export async function getScheduledEventMessage(id: string) {
  const response = await getApi<ScheduledEventMessageResponse | ScheduledEventMessageResponse["data"]>(
    `${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/${id}`,
  );

  if ("data" in response && response.data && "id" in response.data) {
    return response as ScheduledEventMessageResponse;
  }

  return {
    code: 200,
    message: "Scheduled event message fetched successfully",
    data: response as ScheduledEventMessageResponse["data"],
  } satisfies ScheduledEventMessageResponse;
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

export async function setupScheduledEventMessage(
  payload: ScheduledEventMessageSetupPayload,
) {
  return postApi<
    ScheduledEventMessageResponse,
    ScheduledEventMessageSetupPayload
  >(`${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/setup`, payload);
}

export async function updateScheduledEventMessageSetup(
  id: string,
  payload: ScheduledEventMessageSetupPayload,
) {
  return patchApi<
    ScheduledEventMessageResponse,
    ScheduledEventMessageSetupPayload
  >(`${SCHEDULED_EVENT_MESSAGES_ENDPOINT}/${id}/setup`, payload);
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

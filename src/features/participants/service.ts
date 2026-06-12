import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  BulkCreateParticipantsPayload,
  BulkCreateParticipantExclusionsPayload,
  BulkCreateParticipantExclusionsResponse,
  BulkCreateParticipantsResponse,
  DeleteParticipantExclusionResponse,
  DrawNameEventParticipantContactIdsResponse,
  EventParticipantExclusionsResponse,
  GiftRecipientGiftsParams,
  GiftRecipientGiftsResponse,
  EventParticipantsParams,
  EventParticipantsResponse,
  GiftRecipientResponse,
  MyParticipantResponse,
  UpdateMyParticipantNotificationPayload,
  UpdateMyParticipantNotificationResponse,
} from "@/features/participants/types";

const PARTICIPANT_BULK_ENDPOINT = "/participant/bulk";
const PARTICIPANT_EXCLUSION_BULK_ENDPOINT = "/participant/exclusion/bulk";
const PARTICIPANT_EXCLUSION_ENDPOINT = "/participant/exclusion";
const PARTICIPANT_EVENT_ME_ENDPOINT = "/participant/event";
const DRAW_NAME_EVENT_PARTICIPANTS_ENDPOINT = "/draw-name-event";

export async function createParticipantsBulk(
  payload: BulkCreateParticipantsPayload,
) {
  return postApi<BulkCreateParticipantsResponse, BulkCreateParticipantsPayload>(
    PARTICIPANT_BULK_ENDPOINT,
    payload,
  );
}

export async function getEventParticipants(
  eventId: string,
  params: EventParticipantsParams = {},
) {
  return getApi<EventParticipantsResponse>(
    `${DRAW_NAME_EVENT_PARTICIPANTS_ENDPOINT}/${eventId}/participant`,
    {
      params: {
        per_page: params.per_page ?? 20,
        page: params.page ?? 1,
      },
    },
  );
}

export async function getEventParticipantContactIds(drawNameEventId: string) {
  return getApi<DrawNameEventParticipantContactIdsResponse>(
    `${DRAW_NAME_EVENT_PARTICIPANTS_ENDPOINT}/${drawNameEventId}/participant/contact-ids`,
  );
}

export async function createParticipantExclusionsBulk(
  payload: BulkCreateParticipantExclusionsPayload,
) {
  return postApi<
    BulkCreateParticipantExclusionsResponse,
    BulkCreateParticipantExclusionsPayload
  >(PARTICIPANT_EXCLUSION_BULK_ENDPOINT, payload);
}

export async function getParticipantExclusions(eventId: string) {
  return getApi<EventParticipantExclusionsResponse>(
    PARTICIPANT_EXCLUSION_ENDPOINT,
    {
      params: {
        eventId,
      },
    },
  );
}

export async function deleteParticipantExclusion(id: string) {
  return deleteApi<DeleteParticipantExclusionResponse>(
    `${PARTICIPANT_EXCLUSION_ENDPOINT}/${id}`,
  );
}

export async function getMyParticipant(eventId: string) {
  return getApi<MyParticipantResponse>(
    `${PARTICIPANT_EVENT_ME_ENDPOINT}/${eventId}/me`,
  );
}

export async function getMyGiftRecipient(eventId: string) {
  return getApi<GiftRecipientResponse>(
    `${PARTICIPANT_EVENT_ME_ENDPOINT}/${eventId}/me/gift-recipient`,
  );
}

export async function getMyGiftRecipientGifts(
  eventId: string,
  params: GiftRecipientGiftsParams = {},
) {
  return getApi<GiftRecipientGiftsResponse>(
    `${PARTICIPANT_EVENT_ME_ENDPOINT}/${eventId}/me/gift-recipient/gifts`,
    {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
      },
    },
  );
}

export async function updateMyParticipantNotification(
  eventId: string,
  payload: UpdateMyParticipantNotificationPayload,
) {
  return patchApi<
    UpdateMyParticipantNotificationResponse,
    UpdateMyParticipantNotificationPayload
  >(`${PARTICIPANT_EVENT_ME_ENDPOINT}/${eventId}/me`, payload);
}

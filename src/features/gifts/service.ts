import { getApi, patchApi, postApi } from "@/lib/api";
import type {
  ClaimGiftResponse,
  ClaimedGiftsParams,
  ClaimedGiftsResponse,
  CreateBulkGiftsPayload,
  CreateBulkGiftsResponse,
  EventSelectedGiftsParams,
  EventSelectedGiftsResponse,
  ParticipantGiftsParams,
  ParticipantGiftsResponse,
  ParticipantGiftSelectionsResponse,
} from "@/features/gifts/types";

const GIFTS_BULK_ENDPOINT = "/gift/bulk";
const GIFTS_ENDPOINT = "/gift";
const PARTICIPANT_ENDPOINT = "/participant";

export async function createBulkGifts(payload: CreateBulkGiftsPayload) {
  return postApi<CreateBulkGiftsResponse, CreateBulkGiftsPayload>(
    GIFTS_BULK_ENDPOINT,
    payload,
  );
}

export async function getParticipantGiftSelections(
  participantId: string,
  eventId: string,
) {
  return getApi<ParticipantGiftSelectionsResponse>(
    `${PARTICIPANT_ENDPOINT}/${participantId}/gift/selections`,
    {
      params: {
        eventId,
      },
    },
  );
}

export async function getParticipantGifts(
  participantId: string,
  eventId: string,
  params: ParticipantGiftsParams = {},
) {
  return getApi<ParticipantGiftsResponse>(
    `${PARTICIPANT_ENDPOINT}/${participantId}/gift`,
    {
      params: {
        eventId,
        page: params.page ?? 1,
        per_page: params.per_page ?? 20,
      },
    },
  );
}

export async function getEventSelectedGifts(
  eventId: string,
  params: EventSelectedGiftsParams = {},
) {
  return getApi<EventSelectedGiftsResponse>(`${GIFTS_ENDPOINT}/event/${eventId}/selected`, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 250,
    },
  });
}

export async function claimGift(giftId: string) {
  return patchApi<ClaimGiftResponse>(`${GIFTS_ENDPOINT}/${giftId}/claim`);
}

export async function getClaimedGifts(
  eventId: string,
  params: ClaimedGiftsParams = {},
) {
  return getApi<ClaimedGiftsResponse>(`${GIFTS_ENDPOINT}/claimed`, {
    params: {
      eventId,
      page: params.page ?? 1,
      per_page: params.per_page ?? 25,
    },
  });
}

import { getApi, postApi } from "@/lib/api";
import type {
  ClaimInvitationPayload,
  ClaimInvitationResponse,
  DrawNameEventInvitationsParams,
  DrawNameEventInvitationsResponse,
  GiftingEventInvitationsParams,
  GiftingEventInvitationsResponse,
  InvitationAccountExistsResponse,
  InvitationResponse,
  SendDrawNameEventInvitationsPayload,
  SendDrawNameEventInvitationsResponse,
  SendGiftingEventInvitationsPayload,
  SendGiftingEventInvitationsResponse,
} from "@/features/invitations/types";

const INVITATIONS_ENDPOINT = "/invitations";
const DRAW_NAME_EVENTS_ENDPOINT = "/draw-name-event";
const GIFTING_EVENTS_ENDPOINT = "/gifting-event";
const USERS_ENDPOINT = "/user";

export async function getInvitationByToken(token: string) {
  return getApi<InvitationResponse>(`${INVITATIONS_ENDPOINT}/${token}`, {
    skipAuthLogout: true,
  });
}

export async function getInvitationAccountExists(email: string) {
  return getApi<InvitationAccountExistsResponse>(
    `${USERS_ENDPOINT}/account-exists`,
    {
      params: {
        email,
      },
      skipAuthLogout: true,
    },
  );
}

export async function claimInvitation(
  token: string,
  payload: ClaimInvitationPayload,
) {
  return postApi<ClaimInvitationResponse, ClaimInvitationPayload>(
    `${INVITATIONS_ENDPOINT}/${token}/claim`,
    payload,
    {
      skipAuthLogout: true,
    },
  );
}

export async function getDrawNameEventInvitations(
  drawNameEventId: string,
  params: DrawNameEventInvitationsParams = {},
) {
  return getApi<DrawNameEventInvitationsResponse>(
    `${DRAW_NAME_EVENTS_ENDPOINT}/${drawNameEventId}/invitations`,
    {
      params: {
        per_page: params.per_page ?? 25,
        page: params.page ?? 1,
        searchQuery: params.searchQuery ?? "",
      },
    },
  );
}

export async function sendDrawNameEventInvitations(
  drawNameEventId: string,
  payload: SendDrawNameEventInvitationsPayload,
) {
  return postApi<
    SendDrawNameEventInvitationsResponse,
    SendDrawNameEventInvitationsPayload
  >(`${DRAW_NAME_EVENTS_ENDPOINT}/${drawNameEventId}/invitations/send`, payload);
}

export async function getGiftingEventInvitations(
  giftingEventId: string,
  params: GiftingEventInvitationsParams = {},
) {
  return getApi<GiftingEventInvitationsResponse>(
    `${GIFTING_EVENTS_ENDPOINT}/${giftingEventId}/invitations`,
    {
      params: {
        per_page: params.per_page ?? 25,
        page: params.page ?? 1,
      },
    },
  );
}

export async function sendGiftingEventInvitations(
  giftingEventId: string,
  payload: SendGiftingEventInvitationsPayload,
) {
  return postApi<
    SendGiftingEventInvitationsResponse,
    SendGiftingEventInvitationsPayload
  >(`${GIFTING_EVENTS_ENDPOINT}/${giftingEventId}/invitations/send`, payload);
}

import { getApi, postApi } from "@/lib/api";
import type {
  ClaimInvitationPayload,
  ClaimInvitationResponse,
  DrawNameEventInvitationsParams,
  DrawNameEventInvitationsResponse,
  InvitationAccountExistsResponse,
  InvitationResponse,
  SendDrawNameEventInvitationsPayload,
  SendDrawNameEventInvitationsResponse,
} from "@/features/invitations/types";

const INVITATIONS_ENDPOINT = "/invitations";
const DRAW_NAME_EVENTS_ENDPOINT = "/draw-name-event";
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

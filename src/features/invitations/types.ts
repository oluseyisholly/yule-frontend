export type InvitationStatus = "pending" | "accepted" | string;

export type InvitationContact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileUrl?: string | null;
};

export type InvitationRecord = {
  invitationId: string;
  token: string;
  status: InvitationStatus;
  drawNameEventId: string;
  eventId: string;
  participantId: string;
  eventTitle: string;
  eventContact: InvitationContact;
  redirectPathAfterAccept: string;
};

export type DrawNameEventInvitationRecord = {
  id: string;
  invitationId?: string;
  participantId: string;
  drawNameEventId: string;
  eventId: string;
  status: InvitationStatus;
  channel: "email" | "whatsapp" | string;
  inviteUrl: string;
  sentAt: string | null;
  acceptedAt: string | null;
  eventContact: InvitationContact;
};

export type GiftingEventInvitationRecord = {
  id: string;
  eventType: "gifting" | string;
  drawNameEventId: null;
  wishlistEventId: null;
  giftingEventId: string;
  eventId: string;
  participantId: string | null;
  eventContactId: string;
  status: InvitationStatus;
  channel: "email" | "whatsapp" | string;
  inviteUrl: string;
  eventTitle: string;
  sentAt: string | null;
  acceptedAt: string | null;
  eventContact: InvitationContact;
};

export type InvitationResponse = {
  code: number;
  message: string;
  data: InvitationRecord | null;
};

export type InvitationAccountExistsResponse = {
  code: number;
  message: string;
  data: {
    exists: boolean;
    email: string;
  };
};

export type DrawNameEventInvitationsResponse = {
  code: number;
  message: string;
  data: {
    data: DrawNameEventInvitationRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type DrawNameEventInvitationsParams = {
  per_page?: number;
  page?: number;
  searchQuery?: string;
};

export type GiftingEventInvitationsParams = {
  per_page?: number;
  page?: number;
};

export type SendDrawNameEventInvitationsPayload = {
  channel: "email" | "whatsapp";
};

export type SendGiftingEventInvitationsPayload = {
  channel: "email" | "whatsapp";
  contactIds: string[];
};

export type SendDrawNameEventInvitationsResponse = {
  code: number;
  message: string;
  data: {
    drawNameEventId: string;
    channel: "email" | "whatsapp" | string;
    sent: Array<{
      participantId: string;
      invitationId: string;
      status: InvitationStatus;
      inviteUrl: string;
      eventContact: InvitationContact;
    }>;
    skipped: Array<{
      participantId: string;
      reason: string;
    }>;
  };
};

export type GiftingEventInvitationsResponse = {
  code: number;
  message: string;
  data: {
    data: GiftingEventInvitationRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type SendGiftingEventInvitationsResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type ClaimInvitationPayload = {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export type ClaimInvitationResponse = {
  code: number;
  message: string;
  data: {
    invitationId: string;
    status: InvitationStatus;
    participantId: string;
    drawNameEventId: string;
    eventId: string;
    acceptedAt: string;
    redirectPath: string;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    };
    tokens?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };
};

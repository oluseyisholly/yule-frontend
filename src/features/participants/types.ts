import type { ParticipantGiftSelection } from "@/features/gifts/types";

export type BulkCreateParticipantsPayload = {
  eventId: string;
  role: "participant";
  contactIds: string[];
};

export type BulkCreateParticipantsResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type UpdateMyParticipantNotificationPayload = {
  isNotified: true | "true";
};

export type UpdateMyParticipantNotificationResponse = {
  code: number;
  message: string;
  data?: EventParticipant | null;
};

export type ParticipantExclusion = {
  participantId: string;
  excludedParticipantId: string;
};

export type BulkCreateParticipantExclusionsPayload = {
  exclusions: ParticipantExclusion[];
};

export type BulkCreateParticipantExclusionsResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type DeleteParticipantExclusionResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type EventParticipantContact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl?: string | null;
};

export type ParticipantPerson = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  profileUrl?: string | null;
};

export type EventParticipant = {
  id: string;
  eventId: string;
  userId?: string | null;
  eventContactId?: string | null;
  user?: ParticipantPerson | null;
  eventContact?: EventParticipantContact | null;
  giftGiverParticipantId?: string | null;
  role: "creator" | "participant" | string;
  isNotified?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventParticipantGiftGiver = {
  id: string;
  eventContactId?: string | null;
  user?: ParticipantPerson | null;
  eventContact?: EventParticipantContact | null;
};

export type EventParticipantMe = {
  id: string;
  eventId: string;
  eventContactId?: string | null;
  giftGiverParticipantId?: string | null;
  role: "creator" | "participant" | string;
  isNotified?: boolean;
  isPairActive?: boolean;
  eventContact?: EventParticipantContact | null;
  giftGiverParticipant?: EventParticipantGiftGiver | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EventParticipantGiftRecipient = {
  id: string;
  eventId: string;
  eventContactId?: string | null;
  eventContact?: EventParticipantContact | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EventParticipantsParams = {
  per_page?: number;
  page?: number;
};

export type EventParticipantsPage = {
  data: EventParticipant[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EventParticipantsResponse = {
  code: number;
  message: string;
  data: EventParticipantsPage;
};

export type DrawNameEventParticipantContactIdsResponse = {
  code: number;
  message: string;
  data: string[];
};

export type EventParticipantExclusion = {
  id: string;
  participantIds: string[];
};

export type EventParticipantExclusionsResponse = {
  code: number;
  message: string;
  data: EventParticipantExclusion[];
};

export type MyParticipantResult = EventParticipantMe | null;
export type GiftRecipientResult = EventParticipantGiftRecipient | null;

export type MyParticipantResponse = {
  code: number;
  message: string;
  data: MyParticipantResult;
};

export type GiftRecipientResponse = {
  code: number;
  message: string;
  data: GiftRecipientResult;
};

export type GiftRecipientGiftsParams = {
  page?: number;
  per_page?: number;
};

export type GiftRecipientGiftsPage = {
  data: ParticipantGiftSelection[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GiftRecipientGiftsResponse = {
  code: number;
  message: string;
  data: GiftRecipientGiftsPage;
};

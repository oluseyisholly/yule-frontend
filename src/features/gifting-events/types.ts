export type GiftingEventStatus = "draft" | "ongoing" | "completed" | string;

export type GiftingEventCurrency = "NGN" | string;

export type GiftingEventCreatePayload = {
  giftBudget?: number;
  currency?: GiftingEventCurrency;
  giftDeadline?: string;
  allowAnonymousGifting?: boolean;
  event: {
    title?: string;
    description?: string;
    eventTypeId: string;
    eventDate?: string;
  };
};

export type GiftingEventPatchPayload = Partial<
  Omit<GiftingEventCreatePayload, "event">
> & {
  event?: Partial<GiftingEventCreatePayload["event"]>;
};

export type GiftingEventCompletePayload = {
  event: {
    status: "completed";
  };
};

export type GiftingEventParticipantActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl?: string | null;
};

export type GiftingEventParticipant = {
  id: string;
  eventId: string;
  eventContactId: string | null;
  giftGiverParticipantId: string | null;
  role: "creator" | "participant" | string;
  isNotified: boolean;
  isPairActive: boolean;
  eventContact?: GiftingEventParticipantActor | null;
};

export type GiftingEventRecord = {
  id: string;
  eventId: string;
  giftBudget: number;
  currency: GiftingEventCurrency;
  giftDeadline: string;
  allowAnonymousGifting: boolean;
  createdAt: string;
  updatedAt: string;
  event: {
    id: string;
    title: string;
    description: string | null;
    eventTypeId: string;
    eventDate: string;
    status: GiftingEventStatus;
    createdBy?: GiftingEventParticipantActor | null;
    participants?: GiftingEventParticipant[];
  };
};

export type GiftingEventMutationResponse = {
  code: number;
  message: string;
  data: GiftingEventRecord;
};

export type GiftingEventDeleteResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type GiftingEventsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
};

export type GiftingEventsPage = {
  data: GiftingEventRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GiftingEventsResponse = {
  code: number;
  message: string;
  data: GiftingEventsPage;
};

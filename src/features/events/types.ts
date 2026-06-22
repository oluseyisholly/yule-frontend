export type ParticipatedEventsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
};

export type ParticipatedEventActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ParticipatedEventType = {
  id: string;
  name: string;
  key?: string | null;
  description?: string | null;
};

export type ParticipatedEventScopedRecord = {
  id: string;
  eventId: string;
};

export type ParticipatedEventParticipant = {
  id: string;
  eventId: string;
  eventContactId: string | null;
  giftGiverParticipantId?: string | null;
  role: "creator" | "participant" | string;
  isNotified?: boolean;
  isPairActive?: boolean;
  eventContact?: ParticipatedEventActor | null;
};

export type ParticipatedEventRecord = {
  id: string;
  title: string;
  description?: string | null;
  eventTypeId: string;
  eventOption?: string | null;
  eventDate: string;
  status?: string | null;
  eventType?: ParticipatedEventType | null;
  drawNameEvent?: ParticipatedEventScopedRecord | null;
  wishlistEvent?: ParticipatedEventScopedRecord | null;
  giftingEvent?: ParticipatedEventScopedRecord | null;
  createdBy?: ParticipatedEventActor | null;
  participants?: ParticipatedEventParticipant[];
  createdAt?: string;
  updatedAt?: string;
};

export type ParticipatedEventsPage = {
  data: ParticipatedEventRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ParticipatedEventsResponse = {
  code: number;
  message: string;
  data: ParticipatedEventsPage;
};

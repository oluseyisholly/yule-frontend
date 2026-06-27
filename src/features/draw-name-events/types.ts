export type DrawNameEventStatus = "draft" | string;

export type DrawNameEventCreatePayload = {
  drawDate: string;
  event: {
    title: string;
    eventTypeId: string;
    eventDate: string;
  };
};

export type DrawNameEventPayload = {
  drawDate: string;
  location: string;
  maximumSpend: number;
  budget: number;
  allowSelfDraw: boolean;
  isDrawCompleted: boolean;
  event: {
    title: string;
    description: string;
    eventTypeId: string;
    eventDate: string;
    status: DrawNameEventStatus;
  };
};

export type DrawNameEventPatchPayload = Partial<
  Omit<DrawNameEventPayload, "event">
> & {
  event?: Partial<DrawNameEventPayload["event"]>;
};

export type DrawNameEventRecord = {
  id: string;
  createdById?: string | null;
  eventId?: string;
  drawDate: string;
  location: string | null;
  maximumSpend: number | string;
  budget: number | string;
  allowSelfDraw: boolean;
  isDrawCompleted: boolean;
  event: {
    id: string;
    createdAt?: string;
    title: string;
    description: string | null;
    eventTypeId: string;
    eventDate: string;
    status: DrawNameEventStatus;
    createdBy?: DrawNameEventListParticipantActor | null;
    participants?: DrawNameEventListParticipant[];
  };
  createdAt: string;
  updatedAt: string;
};

export type DrawNameEventMutationResponse = {
  code: number;
  message: string;
  data: DrawNameEventRecord;
};

export type DeleteDrawNameEventResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type DrawNameEventListParticipantActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type DrawNameEventListParticipant = {
  id: string;
  eventId: string;
  userId: string | null;
  eventContactId: string | null;
  giftGiverParticipantId: string | null;
  isPairActive?: boolean | null;
  role: string;
  user?: DrawNameEventListParticipantActor | null;
  eventContact?: DrawNameEventListParticipantActor | null;
};

export type DrawNameEventListEvent = {
  id: string;
  createdAt: string;
  title: string;
  description: string | null;
  eventTypeId: string;
  eventDate: string;
  status: DrawNameEventStatus;
  createdBy?: DrawNameEventListParticipantActor | null;
  participants: DrawNameEventListParticipant[];
};

export type DrawNameEventListItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: string | null;
  eventId: string;
  location: string | null;
  drawDate: string;
  maximumSpend: string | number;
  budget: string | number;
  isDrawCompleted: boolean;
  event: DrawNameEventListEvent;
};

export type DrawNameEventsParams = {
  per_page?: number;
  page?: number;
  searchQuery?: string;
  scope?: "organizer" | "participant" | "all";
};

export type DrawNameEventsPage = {
  data: DrawNameEventListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type DrawNameEventsResponse = {
  code: number;
  message: string;
  data: DrawNameEventsPage;
};

export type DrawNameMetricsData = {
  totalGifts: {
    value: number;
    percentageChangeThisMonth?: number | null;
    currentMonth?: number | null;
    previousMonth?: number | null;
  };
  activeDrawNames: {
    value: number;
    newThisWeek?: number | null;
  };
  totalDrawNamesParticipated: {
    value: number;
  };
  totalNames: {
    value: number;
  };
  activeMembers: {
    value: number;
  };
};

export type DrawNameMetricsResponse = {
  code: number;
  message: string;
  data: DrawNameMetricsData;
};

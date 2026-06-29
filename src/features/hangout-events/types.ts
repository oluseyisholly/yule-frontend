export type HangoutEventStatus = "draft" | "ongoing" | "completed" | string;

export type HangoutEventSortOrder = "ASC" | "DESC" | string;

export type HangoutEventActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl?: string | null;
};

export type HangoutEventParticipant = {
  id: string;
  eventId: string;
  eventContactId: string | null;
  giftGiverParticipantId: string | null;
  role: "creator" | "participant" | string;
  isNotified?: boolean;
  isPairActive?: boolean;
  eventContact?: HangoutEventActor | null;
};

export type HangoutEventCore = {
  id: string;
  title: string;
  description: string | null;
  eventTypeId: string;
  eventOption?: "hangout" | string;
  eventDate: string;
  status: HangoutEventStatus;
  createdBy?: HangoutEventActor | null;
  participants?: HangoutEventParticipant[];
};

export type HangoutEventRecord = {
  eventId: string;
  location: string | null;
  hangoutEventId: string | null;
  checkInDate: string | null;
  checkOutDate: string | null;
  numberOfGuests: number | null;
  amount: number | string | null;
  imageUrl: string | null;
  maxAttendees: number | null;
  allowPlusOne: boolean | null;
  event: HangoutEventCore;
};

export type HangoutEventCreatePayload = {
  event: {
    title?: string;
    description?: string;
    eventTypeId: string;
    eventDate?: string;
  };
  location?: string;
  hangoutEventId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  amount?: number;
  imageUrl?: string;
  maxAttendees?: number;
  allowPlusOne?: boolean;
};

export type HangoutEventPatchPayload = Partial<
  Omit<HangoutEventCreatePayload, "event">
> & {
  event?: Partial<HangoutEventCreatePayload["event"]>;
};

export type HangoutEventCompletePayload = {
  event: {
    status: "completed";
  };
};

export type HangoutEventMutationResponse = {
  code: number;
  message: string;
  data: HangoutEventRecord;
};

export type HangoutEventDeleteResponse = {
  code: number;
  message: string;
  data?: {
    id: string;
  };
};

export type HangoutEventsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
  scope?: "organizer" | "participant" | "all";
  status?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: HangoutEventSortOrder;
};

export type HangoutEventsPage = {
  data: HangoutEventRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type HangoutEventsResponse = {
  code: number;
  message: string;
  data: HangoutEventsPage;
};

export type HangoutEventResponse = {
  code: number;
  message: string;
  data: HangoutEventRecord;
};

export type HangoutMetricValueWithChange = {
  value: number;
  percentageChangeThisMonth: number;
  currentMonth: number;
  previousMonth: number;
  currentWeek: number;
};

export type HangoutMetricValueWithWeeklyGrowth = {
  value: number;
  newThisWeek: number;
};

export type HangoutMetricValueOnly = {
  value: number;
};

export type HangoutMetricsData = {
  totalHangouts: HangoutMetricValueWithChange;
  peopleMet: HangoutMetricValueOnly;
  totalThisMonth: HangoutMetricValueWithWeeklyGrowth;
  amountSpent: HangoutMetricValueWithChange;
};

export type HangoutMetricsResponse = {
  code: number;
  message: string;
  data: HangoutMetricsData;
};

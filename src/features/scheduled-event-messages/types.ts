import type { ParticipatedEventParticipant } from "@/features/events/types";

export type ScheduledEventMessageStatus =
  | "pending"
  | "sent"
  | "failed"
  | "cancelled"
  | string;

export type ScheduledEventMessageMetadata = Record<string, unknown>;

export type ScheduledEventMessageEvent = {
  id: string;
  title: string;
  description?: string | null;
  eventTypeId: string;
  eventDate: string;
  status?: string | null;
};

export type ScheduledEventMessageRecord = {
  id: string;
  eventId: string;
  participantId?: string | null;
  subject: string;
  message: string;
  recipientEmail?: string | null;
  recipientName?: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  status: ScheduledEventMessageStatus;
  giftUrl?: string | null;
  giftUrlExpiresAt?: string | null;
  metadata: ScheduledEventMessageMetadata | null;
  failureReason: string | null;
  event: ScheduledEventMessageEvent;
  participant?: ParticipatedEventParticipant | null;
  participants?: ParticipatedEventParticipant[];
  createdAt: string;
};

export type ScheduledEventMessagePayload = {
  event?: {
    title?: string;
    description?: string;
    eventTypeId?: string;
    eventDate?: string;
  };
  subject?: string;
  message?: string;
  sendNow?: boolean;
  scheduledAt?: string;
  giftUrl?: string;
  giftUrlExpiresAt?: string;
  metadata?: ScheduledEventMessageMetadata;
};

export type ScheduledEventMessageSetupGiftItem = {
  participantGiftId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  imageUrl?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  condition?: string;
  locationState?: string;
  locationCity?: string;
  sellerId?: string;
  productSlug?: string;
};

export type ScheduledEventMessageSetupParticipant = {
  clientRef: string;
  contactId: string;
  isNotified: boolean;
};

export type ScheduledEventMessageSetupGiftAssignment = {
  recipientRefs: string[];
  gifts: ScheduledEventMessageSetupGiftItem[];
};

export type ScheduledEventMessageSetupPayload = {
  event: {
    title: string;
    description?: string;
    eventTypeId: string;
    eventDate: string;
  };
  message: {
    subject: string;
    message: string;
    scheduledAt: string;
    sendNow: boolean;
    metadata?: ScheduledEventMessageMetadata;
  };
  participants: ScheduledEventMessageSetupParticipant[];
  giftAssignments: ScheduledEventMessageSetupGiftAssignment[];
  giftUrl?: string;
  giftUrlExpiresAt?: string;
};

export type ScheduledEventMessagesParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
  eventTiming?: "upcoming" | "previous";
};

export type ScheduledEventMessagesPage = {
  data: ScheduledEventMessageRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ScheduledEventMessagesResponse = {
  code: number;
  message: string;
  data: ScheduledEventMessagesPage;
};

export type ScheduledEventMessageResponse = {
  code: number;
  message: string;
  data: ScheduledEventMessageRecord;
};

export type ScheduledEventMessageDeleteResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type CompleteScheduledEventMessageSetupResponse = {
  code: number;
  message: string;
  data: {
    id: string;
    status: string;
  };
};

export type ScheduledEventMessageMetricValue = {
  value: number;
};

export type ScheduledEventMessageMetricValueWithChange =
  ScheduledEventMessageMetricValue & {
    percentageChangeThisMonth: number;
    currentMonth: number;
    previousMonth: number;
    currentWeek: number;
  };

export type ScheduledEventMessageMetricValueWithWeeklyChange =
  ScheduledEventMessageMetricValue & {
    newThisWeek: number;
  };

export type ScheduledEventMessageMetricsData = {
  totalEvents: ScheduledEventMessageMetricValueWithChange;
  totalRecipients: ScheduledEventMessageMetricValue;
  totalEventsThisMonth: ScheduledEventMessageMetricValueWithWeeklyChange;
  amountSpent: ScheduledEventMessageMetricValueWithChange;
};

export type ScheduledEventMessageMetricsResponse = {
  code: number;
  message: string;
  data: ScheduledEventMessageMetricsData;
};

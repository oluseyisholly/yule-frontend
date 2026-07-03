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
  participantId: string;
  subject: string;
  message: string;
  recipientEmail: string;
  recipientName: string;
  scheduledAt: string | null;
  sentAt: string | null;
  status: ScheduledEventMessageStatus;
  giftUrl: string | null;
  giftUrlExpiresAt: string | null;
  metadata: ScheduledEventMessageMetadata | null;
  failureReason: string | null;
  event: ScheduledEventMessageEvent;
  participant: ParticipatedEventParticipant;
  createdAt: string;
};

export type ScheduledEventMessagePayload = {
  eventId?: string;
  event?: {
    title?: string;
    description?: string;
    eventTypeId?: string;
    eventDate?: string;
  };
  participantId?: string;
  subject?: string;
  message?: string;
  sendNow?: boolean;
  scheduledAt?: string;
  giftUrl?: string;
  giftUrlExpiresAt?: string;
  metadata?: ScheduledEventMessageMetadata;
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

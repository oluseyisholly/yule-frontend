export type NotificationType =
  | "draw_name_completed"
  | "wishlist_item_claimed_owner"
  | "wishlist_item_claimed_claimer"
  | "gift_fulfilled"
  | "hangout_completed"
  | "scheduled_message_reminder"
  | "pending_fulfillment_reminder";

export type NotificationMetadata = Record<string, unknown> & {
  eventId?: string;
  drawNameEventId?: string;
  wishlistEventId?: string;
  giftingEventId?: string;
  hangoutEventId?: string;
  scheduledEventMessageId?: string;
  giftId?: string;
  participantGiftId?: string;
  unfulfilledGifts?: unknown;
  unfulfilledHangouts?: unknown;
};

export type NotificationRecord = {
  id: string;
  contactId: string;
  title: string;
  description: string;
  type: NotificationType;
  metadata?: NotificationMetadata | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsParams = {
  page?: number;
  per_page?: number;
};

export type NotificationsPage = {
  data: NotificationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type NotificationsResponse = {
  code: number;
  message: string;
  data: NotificationsPage;
};

export type MarkNotificationsReadResponse = {
  code: number;
  message: string;
  data: NotificationRecord[];
};

export type MarkNotificationReadResponse = {
  code: number;
  message: string;
  data: NotificationRecord;
};

export type UnreadNotificationCountResponse = {
  code: number;
  message: string;
  data: {
    unreadCount: number;
  };
};

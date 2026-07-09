export type NotificationRecord = {
  id: string;
  contactId: string;
  title: string;
  description: string;
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

export type UnreadNotificationCountResponse = {
  code: number;
  message: string;
  data: {
    unreadCount: number;
  };
};

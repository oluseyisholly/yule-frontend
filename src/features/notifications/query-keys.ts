import type { NotificationsParams } from "@/features/notifications/types";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: (params: NotificationsParams) =>
    [...notificationQueryKeys.all, "list", params] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
};

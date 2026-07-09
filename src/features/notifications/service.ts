import { getApi, patchApi } from "@/lib/api";
import type {
  MarkNotificationsReadResponse,
  NotificationsParams,
  NotificationsResponse,
  UnreadNotificationCountResponse,
} from "@/features/notifications/types";

const NOTIFICATIONS_ENDPOINT = "/notification";

export function getNotifications(params: NotificationsParams = {}) {
  return getApi<NotificationsResponse>(NOTIFICATIONS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.per_page ?? 25,
    },
  });
}

export function markNotificationsAsRead() {
  return patchApi<MarkNotificationsReadResponse>(
    `${NOTIFICATIONS_ENDPOINT}/read`,
  );
}

export function getUnreadNotificationCount() {
  return getApi<UnreadNotificationCountResponse>(
    `${NOTIFICATIONS_ENDPOINT}/unread-count`,
  );
}

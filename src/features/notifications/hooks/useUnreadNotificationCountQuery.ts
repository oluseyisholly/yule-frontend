"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationQueryKeys } from "@/features/notifications/query-keys";
import { getUnreadNotificationCount } from "@/features/notifications/service";

type UseUnreadNotificationCountQueryOptions = {
  enabled?: boolean;
};

export function useUnreadNotificationCountQuery(
  options: UseUnreadNotificationCountQueryOptions = {},
) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

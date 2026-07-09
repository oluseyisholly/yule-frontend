"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationQueryKeys } from "@/features/notifications/query-keys";
import { getNotifications } from "@/features/notifications/service";
import type { NotificationsParams } from "@/features/notifications/types";

type UseNotificationsInfiniteQueryOptions = {
  enabled?: boolean;
};

export function useNotificationsInfiniteQuery(
  params: NotificationsParams = {},
  options: UseNotificationsInfiniteQueryOptions = {},
) {
  const normalizedParams = {
    per_page: params.per_page ?? 25,
  };

  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(normalizedParams),
    queryFn: ({ pageParam }) =>
      getNotifications({
        ...normalizedParams,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.data.page ?? 1;
      const totalPages = lastPage.data.totalPages ?? 1;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

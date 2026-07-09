"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationQueryKeys } from "@/features/notifications/query-keys";
import { markNotificationsAsRead } from "@/features/notifications/service";

export function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["notifications", "mark-read"],
    mutationFn: () => markNotificationsAsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}

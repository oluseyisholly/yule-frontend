"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationQueryKeys } from "@/features/notifications/query-keys";
import { markNotificationAsRead } from "@/features/notifications/service";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["notifications", "mark-read-one"],
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: notificationQueryKeys.all,
      });
    },
  });
}

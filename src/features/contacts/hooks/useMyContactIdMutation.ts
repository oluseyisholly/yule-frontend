"use client";

import { useMutation } from "@tanstack/react-query";
import { getMyContactId } from "@/features/contacts/service";

export function useMyContactIdMutation() {
  return useMutation({
    mutationKey: ["contacts", "me", "contact-id"],
    mutationFn: getMyContactId,
  });
}

"use client";

import { useMutation } from "@tanstack/react-query";
import { sendEmail } from "@/features/email/service";
import type { SendEmailPayload } from "@/features/email/types";

export function useSendEmailMutation() {
  return useMutation({
    mutationKey: ["email", "send"],
    mutationFn: (payload: SendEmailPayload) => sendEmail(payload),
  });
}

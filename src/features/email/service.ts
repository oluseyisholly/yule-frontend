import { postApi } from "@/lib/api";
import type {
  SendEmailPayload,
  SendEmailResponse,
} from "@/features/email/types";

const EMAIL_ENDPOINT = "/email/send";

export function sendEmail(payload: SendEmailPayload) {
  return postApi<SendEmailResponse, SendEmailPayload>(EMAIL_ENDPOINT, payload);
}

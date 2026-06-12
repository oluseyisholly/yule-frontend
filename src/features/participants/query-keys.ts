import type {
  EventParticipantsParams,
  GiftRecipientGiftsParams,
} from "@/features/participants/types";

export const participantQueryKeys = {
  all: ["participants"] as const,
  lists: () => [...participantQueryKeys.all, "list"] as const,
  list: (eventId: string, params: EventParticipantsParams = {}) =>
    [
      ...participantQueryKeys.lists(),
      eventId,
      params.per_page ?? 20,
      params.page ?? 1,
    ] as const,
  exclusions: () => [...participantQueryKeys.all, "exclusions"] as const,
  exclusionList: (eventId: string) =>
    [...participantQueryKeys.exclusions(), eventId] as const,
  recipients: () => [...participantQueryKeys.all, "recipients"] as const,
  giftRecipient: (eventId: string) =>
    [...participantQueryKeys.recipients(), eventId] as const,
  giftRecipientGifts: (
    eventId: string,
    params: GiftRecipientGiftsParams = {},
  ) =>
    [
      ...participantQueryKeys.recipients(),
      eventId,
      "gifts",
      params.page ?? 1,
      params.per_page ?? 20,
    ] as const,
  me: () => [...participantQueryKeys.all, "me"] as const,
  eventMe: (eventId: string) => [...participantQueryKeys.me(), eventId] as const,
  contactIds: () => [...participantQueryKeys.all, "contact-ids"] as const,
  drawNameEventContactIds: (drawNameEventId: string) =>
    [...participantQueryKeys.contactIds(), drawNameEventId] as const,
};

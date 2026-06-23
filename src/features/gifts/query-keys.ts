export const giftQueryKeys = {
  all: ["gifts"] as const,
  metrics: () => [...giftQueryKeys.all, "metrics"] as const,
  selections: () => [...giftQueryKeys.all, "selections"] as const,
  participantSelections: (participantId: string, eventId: string) =>
    [...giftQueryKeys.selections(), participantId, eventId] as const,
  participantGifts: (
    participantId: string,
    eventId: string,
    params: { page?: number; per_page?: number },
  ) => [...giftQueryKeys.all, "participant-gifts", participantId, eventId, params] as const,
  eventSelected: (eventId: string, params: { page?: number; per_page?: number }) =>
    [...giftQueryKeys.all, "event-selected", eventId, params] as const,
  claimed: (
    eventId: string,
    params: { page?: number; per_page?: number; searchQuery?: string },
  ) =>
    [...giftQueryKeys.all, "claimed", eventId, params] as const,
  received: (params: { page?: number; per_page?: number; searchQuery?: string }) =>
    [...giftQueryKeys.all, "received", params] as const,
  givenGrouped: (params: { page?: number; per_page?: number; searchQuery?: string }) =>
    [...giftQueryKeys.all, "given-grouped", params] as const,
  eventGivenGrouped: (
    eventId: string,
    params: { page?: number; per_page?: number; searchQuery?: string },
  ) => [...giftQueryKeys.all, "event-given-grouped", eventId, params] as const,
};

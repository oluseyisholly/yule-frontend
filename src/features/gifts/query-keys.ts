export const giftQueryKeys = {
  all: ["gifts"] as const,
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
  claimed: (eventId: string, params: { page?: number; per_page?: number }) =>
    [...giftQueryKeys.all, "claimed", eventId, params] as const,
};

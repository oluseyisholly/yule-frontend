export const invitationQueryKeys = {
  all: ["invitations"] as const,
  byToken: (token: string) => [...invitationQueryKeys.all, token] as const,
  accountExists: (email: string) =>
    [...invitationQueryKeys.all, "account-exists", email.trim().toLowerCase()] as const,
  lists: () => [...invitationQueryKeys.all, "list"] as const,
  drawNameEventList: (
    drawNameEventId: string,
    params: { per_page?: number; page?: number; searchQuery?: string } = {},
  ) =>
    [
      ...invitationQueryKeys.lists(),
      drawNameEventId,
      params.per_page ?? 25,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
  giftingEventList: (
    giftingEventId: string,
    params: { per_page?: number; page?: number } = {},
  ) =>
    [
      ...invitationQueryKeys.lists(),
      "gifting",
      giftingEventId,
      params.per_page ?? 25,
      params.page ?? 1,
    ] as const,
};

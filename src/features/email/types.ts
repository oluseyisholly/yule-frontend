export type SendEmailPayload = {
  eventId: string;
  title: string;
  body: string;
  redirectUrl: string;
  emails: string[];
  giftingId?: string;
  drawNameId?: string;
  wishlistId?: string;
  hangoutId?: string;
};

export type SendEmailResponse = {
  code: number;
  message: string;
  data?: unknown;
};

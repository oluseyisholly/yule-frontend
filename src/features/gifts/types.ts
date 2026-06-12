export type CreateBulkGiftItemPayload = {
  participantGiftId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  imageUrl?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  condition?: string;
  locationState?: string;
  locationCity?: string;
  sellerId?: string;
  productSlug?: string;
};

export type CreateBulkGiftsPayload = {
  eventId: string;
  recipientParticipantId: string;
  gifts: CreateBulkGiftItemPayload[];
};

export type CreateBulkGiftsResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type ClaimGiftResponse = {
  code: number;
  message: string;
  data?: ParticipantGiftRow | null;
};

export type ParticipantGiftSelection = {
  id?: string;
  participantGiftId?: string;
  title?: string;
  description?: string;
  amount?: number | string;
  currency?: string;
  imageUrl?: string;
  images?: string[];
  categorySlug?: string;
  subCategorySlug?: string;
  condition?: string;
  locationState?: string;
  locationCity?: string;
  sellerId?: string;
  productSlug?: string;
  slug?: string;
};

export type ParticipantGiftSelectionsResult =
  | ParticipantGiftSelection[]
  | {
      data?: ParticipantGiftSelection[];
    }
  | null;

export type ParticipantGiftSelectionsResponse = {
  code: number;
  message: string;
  data: ParticipantGiftSelectionsResult;
};

export type ParticipantGiftRow = {
  id: string;
  eventId: string;
  recipientParticipantId: string;
  giverParticipantId?: string | null;
  participantGiftId?: string;
  title?: string;
  description?: string;
  amount?: number | string;
  currency?: string;
  imageUrl?: string;
  images?: string[];
  categorySlug?: string;
  subCategorySlug?: string;
  condition?: string;
  locationState?: string;
  locationCity?: string;
  sellerId?: string;
  productSlug?: string;
  slug?: string;
};

export type ParticipantGiftsParams = {
  page?: number;
  per_page?: number;
};

export type ParticipantGiftsPage = {
  data: ParticipantGiftRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ParticipantGiftsResponse = {
  code: number;
  message: string;
  data: ParticipantGiftsPage;
};

export type ClaimedGiftsParams = {
  page?: number;
  per_page?: number;
};

export type ClaimedGiftsPage = {
  data: ParticipantGiftRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ClaimedGiftsResponse = {
  code: number;
  message: string;
  data: ClaimedGiftsPage;
};

export type EventSelectedGift = ParticipantGiftSelection & {
  participantId?: string | null;
  selectedByParticipantId?: string | null;
  recipientParticipantId?: string | null;
  participant?: {
    id?: string | null;
  } | null;
  selectedByParticipant?: {
    id?: string | null;
  } | null;
  recipientParticipant?: {
    id?: string | null;
  } | null;
};

export type EventSelectedGiftsParams = {
  page?: number;
  per_page?: number;
};

export type EventSelectedGiftsPage = {
  data: EventSelectedGift[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type EventSelectedGiftsResponse = {
  code: number;
  message: string;
  data: EventSelectedGiftsPage;
};

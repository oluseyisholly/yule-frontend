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

export type AssignBulkGiftsPayload = {
  eventId: string;
  giverParticipantId?: string;
  recipientParticipantIds: string[];
  gifts: CreateBulkGiftItemPayload[];
};

export type CreateBulkGiftsResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type AssignBulkGiftsResponse = CreateBulkGiftsResponse;

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
  searchQuery?: string;
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

export type GivenGroupedGiftPerson = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileUrl?: string | null;
};

export type GivenGroupedGiftEvent = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  eventTypeId?: string | null;
  eventDate?: string | null;
  status?: string | null;
};

export type GivenGroupedGift = {
  id?: string | null;
  participantGiftId?: string | null;
  title?: string | null;
  description?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  imageUrl?: string | null;
  categorySlug?: string | null;
  subCategorySlug?: string | null;
  condition?: string | null;
  locationState?: string | null;
  locationCity?: string | null;
  sellerId?: string | null;
  productSlug?: string | null;
  recipientCount?: number | null;
  people?: GivenGroupedGiftPerson[] | null;
  event?: GivenGroupedGiftEvent | null;
};

export type GivenGroupedGiftsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
};

export type GivenGroupedGiftsPage = {
  data: GivenGroupedGift[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type GivenGroupedGiftsResponse = {
  code: number;
  message: string;
  data: GivenGroupedGiftsPage;
};

export type ReceivedGiftParticipantContact = {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileUrl?: string | null;
};

export type ReceivedGiftParticipant = {
  id?: string | null;
  eventContactId?: string | null;
  eventContact?: ReceivedGiftParticipantContact | null;
};

export type ReceivedGiftEvent = {
  id?: string | null;
  title?: string | null;
  description?: string | null;
  eventTypeId?: string | null;
  eventDate?: string | null;
  status?: string | null;
};

export type ReceivedGift = {
  id: string;
  eventId?: string | null;
  recipientParticipantId?: string | null;
  giverParticipantId?: string | null;
  participantGiftId?: string | null;
  title?: string | null;
  description?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  imageUrl?: string | null;
  categorySlug?: string | null;
  subCategorySlug?: string | null;
  condition?: string | null;
  locationState?: string | null;
  locationCity?: string | null;
  sellerId?: string | null;
  productSlug?: string | null;
  recipientParticipant?: ReceivedGiftParticipant | null;
  giverParticipant?: ReceivedGiftParticipant | null;
  event?: ReceivedGiftEvent | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ReceivedGiftsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
};

export type ReceivedGiftsPage = {
  data: ReceivedGift[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ReceivedGiftsResponse = {
  code: number;
  message: string;
  data: ReceivedGiftsPage;
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

export type GiftMetricStat = {
  value: number | string;
  percentageChangeThisMonth?: number | null;
  currentMonth?: number | null;
  previousMonth?: number | null;
  newThisWeek?: number | null;
};

export type GiftMetricsData = {
  totalGifts: GiftMetricStat | number | string;
  totalAmountSpent: GiftMetricStat | number | string;
  totalPeople: GiftMetricStat | number | string;
  totalSellers: GiftMetricStat | number | string;
};

export type GiftMetricsResponse = {
  code: number;
  message: string;
  data: GiftMetricsData;
};

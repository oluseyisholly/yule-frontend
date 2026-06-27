import type { ParticipantGiftRow } from "@/features/gifts/types";

export type WishlistEventVisibility = "private" | "public" | string;
export type WishlistEventStatus = "draft" | "ongoing" | "completed" | string;

export type WishlistEventCreatePayload = {
  event: {
    title: string;
    description: string;
    eventTypeId: string;
    eventDate: string;
  };
  allowMultipleItems: boolean;
  visibility: WishlistEventVisibility;
};

export type WishlistEventPatchPayload = Partial<
  Omit<WishlistEventCreatePayload, "event">
> & {
  eventDeadline?: string | null;
  event?: Partial<WishlistEventCreatePayload["event"]>;
};

export type WishlistEventParticipantActor = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type WishlistEventParticipant = {
  id: string;
  eventId: string;
  userId: string | null;
  eventContactId: string | null;
  giftGiverParticipantId?: string | null;
  role: "creator" | "participant" | string;
  user?: WishlistEventParticipantActor | null;
  eventContact?: WishlistEventParticipantActor | null;
};

export type WishlistEventRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdById?: string | null;
  eventId: string;
  allowMultipleItems: boolean;
  eventDeadline?: string | null;
  visibility: WishlistEventVisibility;
  items?: unknown[];
  event: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    title: string;
    description: string | null;
    eventTypeId: string;
    eventDate: string;
    status?: WishlistEventStatus;
    createdBy?: WishlistEventParticipantActor | null;
    participants?: WishlistEventParticipant[];
  };
};

export type PublicWishlistEventRecord = {
  id: string;
  eventId: string;
  title: string;
  description?: string | null;
  eventDate: string;
  visibility: WishlistEventVisibility;
  allowMultipleItems: boolean;
  eventDeadline?: string | null;
  redirectPath?: string | null;
};

export type WishlistEventMutationResponse = {
  code: number;
  message: string;
  data: WishlistEventRecord;
};

export type WishlistEventCompleteResponse = {
  code: number;
  message: string;
  data: {
    id: string;
    eventId: string;
    allowMultipleItems: boolean;
    eventDeadline?: string | null;
    visibility: WishlistEventVisibility;
    event: {
      id: string;
      title: string;
      status: WishlistEventStatus;
    };
  };
};

export type PublicWishlistEventResponse = {
  code: number;
  message: string;
  data: PublicWishlistEventRecord;
};

export type WishlistEventDeleteResponse = {
  code: number;
  message: string;
  data?: unknown;
};

export type WishlistEventGiftsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
};

export type WishlistEventsParams = {
  page?: number;
  per_page?: number;
  searchQuery?: string;
  scope?: "organizer" | "participant" | "all";
};

export type WishlistEventsPage = {
  data: WishlistEventRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type WishlistEventsResponse = {
  code: number;
  message: string;
  data: WishlistEventsPage;
};

export type WishlistEventGiftRow = ParticipantGiftRow;

export type WishlistEventGiftsPage = {
  data: WishlistEventGiftRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type WishlistEventGiftsResponse = {
  code: number;
  message: string;
  data: WishlistEventGiftsPage;
};

export type WishlistEventClaimedGiftIdsResponse = {
  code: number;
  message: string;
  data: string[];
};

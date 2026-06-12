import type { ParticipantGiftRow } from "@/features/gifts/types";

export type WishlistEventVisibility = "private" | "public" | string;

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
  visibility: WishlistEventVisibility;
  event: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    title: string;
    description: string | null;
    eventTypeId: string;
    eventDate: string;
    status?: string;
    createdBy?: WishlistEventParticipantActor | null;
    participants?: WishlistEventParticipant[];
  };
};

export type WishlistEventMutationResponse = {
  code: number;
  message: string;
  data: WishlistEventRecord;
};

export type WishlistEventGiftsParams = {
  page?: number;
  per_page?: number;
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

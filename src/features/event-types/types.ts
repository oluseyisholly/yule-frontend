export type AvailableEventType = {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: string | null;
  user_id?: string | null;
  name: string;
  key: string | null;
  description: string;
  isActive: boolean;
};

export type AvailableEventTypesParams = {
  per_page?: number;
  page?: number;
};

export type AvailableEventTypesPage = {
  data: AvailableEventType[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AvailableEventTypesResponse = {
  code: number;
  message: string;
  data: AvailableEventTypesPage;
};

export type EventTypeMutationPayload = {
  name: string;
};

export type EventTypeMutationData = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  key?: string | null;
  createdById?: string | null;
  user_id?: string | null;
};

export type EventTypeMutationResponse = {
  code: number;
  message: string;
  data: EventTypeMutationData | null;
};

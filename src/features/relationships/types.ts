export type AvailableRelationship = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AvailableRelationshipsParams = {
  per_page?: number;
  page?: number;
  searchQuery?: string;
};

export type AvailableRelationshipsPage = {
  data: AvailableRelationship[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AvailableRelationshipsResponse = {
  code: number;
  message: string;
  data: AvailableRelationshipsPage;
};

export type RelationshipMutationPayload = {
  name: string;
  description: string;
  isActive: boolean;
};

export type RelationshipMutationData = {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdById?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RelationshipMutationResponse = {
  code: number;
  message: string;
  data: RelationshipMutationData | null;
};

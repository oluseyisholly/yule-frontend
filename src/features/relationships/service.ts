import { deleteApi, getApi, patchApi, postApi } from "@/lib/api";
import type {
  AvailableRelationshipsParams,
  AvailableRelationshipsResponse,
  RelationshipMutationPayload,
  RelationshipMutationResponse,
} from "@/features/relationships/types";

const AVAILABLE_RELATIONSHIPS_ENDPOINT = "/relationship/available";
const RELATIONSHIPS_ENDPOINT = "/relationship";

export async function getAvailableRelationships(
  params: AvailableRelationshipsParams = {},
) {
  const searchQuery = params.searchQuery?.trim();

  return getApi<AvailableRelationshipsResponse>(AVAILABLE_RELATIONSHIPS_ENDPOINT, {
    params: {
      per_page: params.per_page ?? 25,
      page: params.page ?? 1,
      ...(searchQuery ? { searchQuery } : {}),
    },
  });
}

export async function createRelationship(
  payload: RelationshipMutationPayload,
) {
  return postApi<RelationshipMutationResponse, RelationshipMutationPayload>(
    RELATIONSHIPS_ENDPOINT,
    payload,
  );
}

export async function updateRelationship(
  id: string,
  payload: RelationshipMutationPayload,
) {
  return patchApi<RelationshipMutationResponse, RelationshipMutationPayload>(
    `${RELATIONSHIPS_ENDPOINT}/${id}`,
    payload,
  );
}

export async function deleteRelationship(id: string) {
  return deleteApi<RelationshipMutationResponse>(
    `${RELATIONSHIPS_ENDPOINT}/${id}`,
  );
}

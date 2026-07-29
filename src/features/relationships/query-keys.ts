import type { AvailableRelationshipsParams } from "@/features/relationships/types";

export const relationshipQueryKeys = {
  all: ["relationships"] as const,
  availableLists: () => [...relationshipQueryKeys.all, "available"] as const,
  available: (params: AvailableRelationshipsParams = {}) =>
    [
      ...relationshipQueryKeys.availableLists(),
      params.per_page ?? 25,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
};

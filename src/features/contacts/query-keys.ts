import type { ContactsParams } from "@/features/contacts/types";

export const contactQueryKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactQueryKeys.all, "list"] as const,
  list: (params: ContactsParams = {}) =>
    [
      ...contactQueryKeys.lists(),
      params.per_page ?? 25,
      params.page ?? 1,
      params.searchQuery ?? "",
    ] as const,
};

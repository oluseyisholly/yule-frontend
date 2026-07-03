import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getExternalBusinessProfiles } from "@/features/auth/service";

export type OnedaProfile = {
  _id: string;
  profilePhotoUrl?: string | null;
  accountId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  hostBusinessId?: {
    _id?: string;
    businessName?: string;
  };
  host?: boolean;
  type?: "BUSINESS" | string;
};

export function useOnedaProfilesQuery(
  hostBusinessId: string | null,
  accessToken: string | null,
  searchQueryOrOptions?:
    | string
    | Omit<UseQueryOptions<OnedaProfile[]>, "queryKey" | "queryFn">,
  options?: Omit<UseQueryOptions<OnedaProfile[]>, "queryKey" | "queryFn">,
) {
  const resolvedSearchQuery =
    typeof searchQueryOrOptions === "string" ? searchQueryOrOptions : "";
  const resolvedOptions =
    typeof searchQueryOrOptions === "string"
      ? options
      : searchQueryOrOptions;

  return useQuery<OnedaProfile[]>({
    queryKey: [
      "onedaProfiles",
      hostBusinessId,
      resolvedSearchQuery.trim(),
    ],
    queryFn: async () => {
      if (!hostBusinessId || !accessToken) {
        return [];
      }

      const response = await getExternalBusinessProfiles(
        hostBusinessId,
        accessToken,
        resolvedSearchQuery,
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }

      return Array.isArray(response.data.profiles)
        ? response.data.profiles
        : [];
    },
    enabled: Boolean(hostBusinessId) && Boolean(accessToken),
    ...(resolvedOptions || {}),
  });
}

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
  options?: Omit<UseQueryOptions<OnedaProfile[]>, "queryKey" | "queryFn">,
) {
  return useQuery<OnedaProfile[]>({
    queryKey: ["onedaProfiles", hostBusinessId],
    queryFn: async () => {
      if (!hostBusinessId || !accessToken) {
        return [];
      }

      const response = await getExternalBusinessProfiles(
        hostBusinessId,
        accessToken,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: Boolean(hostBusinessId) && Boolean(accessToken),
    ...(options || {}),
  });
}

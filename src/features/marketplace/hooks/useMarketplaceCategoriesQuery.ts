import { useQuery } from "@tanstack/react-query";
import { marketplaceQueryKeys } from "@/features/marketplace/query-keys";
import { getMarketplaceCategories } from "@/features/marketplace/service";

type UseMarketplaceCategoriesQueryOptions = {
  enabled?: boolean;
};

export function useMarketplaceCategoriesQuery(
  options: UseMarketplaceCategoriesQueryOptions = {},
) {
  return useQuery({
    queryKey: marketplaceQueryKeys.categories(),
    queryFn: getMarketplaceCategories,
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

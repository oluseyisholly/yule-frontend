import { useQuery } from "@tanstack/react-query";
import { marketplaceQueryKeys } from "@/features/marketplace/query-keys";
import { getMarketplaceProducts } from "@/features/marketplace/service";
import type { GetMarketplaceProductsParams } from "@/features/marketplace/types";

type UseMarketplaceProductsQueryOptions = {
  enabled?: boolean;
};

export function useMarketplaceProductsQuery(
  params: GetMarketplaceProductsParams,
  options: UseMarketplaceProductsQueryOptions = {},
) {
  const normalizedParams = {
    limit: params.limit ?? 8,
    page: params.page ?? 1,
    search: params.search ?? "",
    categorySlug: params.categorySlug ?? "",
    subCategorySlug: params.subCategorySlug ?? "",
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    condition: params.condition,
    sort: params.sort,
    status: params.status ?? "active",
  };

  return useQuery({
    queryKey: marketplaceQueryKeys.products(normalizedParams),
    queryFn: () => getMarketplaceProducts(normalizedParams),
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    placeholderData: (previousData) => previousData,
  });
}

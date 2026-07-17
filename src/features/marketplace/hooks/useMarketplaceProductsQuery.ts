import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
    productIds: params.productIds ?? [],
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

export function useMarketplaceProductsInfiniteQuery(
  params: GetMarketplaceProductsParams,
  options: UseMarketplaceProductsQueryOptions = {},
) {
  const normalizedParams = {
    limit: params.limit ?? 8,
    search: params.search ?? "",
    productIds: params.productIds ?? [],
    categorySlug: params.categorySlug ?? "",
    subCategorySlug: params.subCategorySlug ?? "",
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    condition: params.condition,
    sort: params.sort,
    status: params.status ?? "active",
  };

  return useInfiniteQuery({
    queryKey: marketplaceQueryKeys.infiniteProducts(normalizedParams),
    queryFn: ({ pageParam }) =>
      getMarketplaceProducts({
        ...normalizedParams,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.page ?? 1;
      const totalPages = lastPage.totalPages ?? 1;

      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: options.enabled ?? true,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

import { useQuery } from "@tanstack/react-query";
import { marketplaceQueryKeys } from "@/features/marketplace/query-keys";
import { getMarketplaceProduct } from "@/features/marketplace/service";

type UseMarketplaceProductQueryOptions = {
  enabled?: boolean;
};

export function useMarketplaceProductQuery(
  productId: string | null,
  options: UseMarketplaceProductQueryOptions = {},
) {
  return useQuery({
    queryKey: marketplaceQueryKeys.product(productId ?? ""),
    queryFn: () => getMarketplaceProduct(productId ?? ""),
    enabled: Boolean(productId) && (options.enabled ?? true),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnReconnect: true,
  });
}

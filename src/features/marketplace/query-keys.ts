import type { GetMarketplaceProductsParams } from "@/features/marketplace/types";

export const marketplaceQueryKeys = {
  all: ["marketplace"] as const,
  categories: () => [...marketplaceQueryKeys.all, "categories"] as const,
  products: (params: GetMarketplaceProductsParams) =>
    [...marketplaceQueryKeys.all, "products", params] as const,
  product: (productId: string) =>
    [...marketplaceQueryKeys.all, "product", productId] as const,
};

import { getApi } from "@/lib/api";
import type {
  GetMarketplaceProductsParams,
  MarketplaceCategoriesResponse,
  MarketplaceProductResponse,
  MarketplaceProductsResponse,
} from "@/features/marketplace/types";

const MARKETPLACE_API_BASE_URL = process.env.NEXT_PUBLIC_SHOBU_BASE_URL;
const MARKETPLACE_CATEGORIES_URL = `${MARKETPLACE_API_BASE_URL}/api/categories`;
const MARKETPLACE_PRODUCTS_URL = `${MARKETPLACE_API_BASE_URL}/api/products/ads`;

export async function getMarketplaceCategories() {
  return getApi<MarketplaceCategoriesResponse>(MARKETPLACE_CATEGORIES_URL, {
    skipAuthLogout: true,
  });
}

export async function getMarketplaceProducts(
  params: GetMarketplaceProductsParams,
) {
  return getApi<MarketplaceProductsResponse>(MARKETPLACE_PRODUCTS_URL, {
    params,
    skipAuthLogout: true,
  });
}

export async function getMarketplaceProduct(productId: string) {
  return getApi<MarketplaceProductResponse>(
    `${MARKETPLACE_PRODUCTS_URL}/${productId}`,
    {
    skipAuthLogout: true,
    },
  );
}

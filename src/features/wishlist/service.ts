import { getApi } from "@/lib/api";
import type { WishListMetricsResponse } from "@/features/wishlist/types";

export async function getWishListMetrics() {
  // GET /dashboard/wishlist-metrics
  return getApi<WishListMetricsResponse>(`/dashboard/wishlist-metrics`);
}

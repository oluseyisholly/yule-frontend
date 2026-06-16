import type {
  WishlistEventGiftRow,
  WishlistEventGiftsResponse,
  PublicWishlistEventResponse,
  WishlistEventClaimedGiftIdsResponse,
} from "@/features/wishlist-events/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
const WISHLIST_EVENTS_ENDPOINT = `${API_BASE_URL}/wishlist-event`;

type WishlistEventGiftsDataShape =
  | WishlistEventGiftsResponse["data"]
  | {
      data?: WishlistEventGiftRow[];
      items?: WishlistEventGiftRow[];
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
    }
  | WishlistEventGiftRow[]
  | null
  | undefined;

type RawWishlistEventGiftsResponse = {
  code?: number;
  message?: string;
  data?: WishlistEventGiftsDataShape;
};

export type PublicWishlistEventGiftsPage = {
  data: WishlistEventGiftRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function ensureApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }
}

async function fetchJson<TResponse>(path: string) {
  ensureApiBaseUrl();

  const response = await fetch(`${WISHLIST_EVENTS_ENDPOINT}${path}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

function normalizeWishlistEventGiftsPage(
  response: RawWishlistEventGiftsResponse,
): PublicWishlistEventGiftsPage {
  const rawData = response.data;

  if (Array.isArray(rawData)) {
    return {
      data: rawData,
      total: rawData.length,
      page: 1,
      pageSize: rawData.length,
      totalPages: rawData.length ? 1 : 0,
    };
  }

  if (rawData && typeof rawData === "object") {
    const normalizedRawData = rawData as {
      data?: WishlistEventGiftRow[];
      items?: WishlistEventGiftRow[];
      total?: number;
      page?: number;
      pageSize?: number;
      totalPages?: number;
    };

    const rows = Array.isArray(normalizedRawData.data)
      ? normalizedRawData.data
      : Array.isArray(normalizedRawData.items)
        ? normalizedRawData.items
        : [];

    return {
      data: rows,
      total: normalizedRawData.total ?? rows.length,
      page: normalizedRawData.page ?? 1,
      pageSize: normalizedRawData.pageSize ?? rows.length,
      totalPages: normalizedRawData.totalPages ?? (rows.length ? 1 : 0),
    };
  }

  return {
    data: [],
    total: 0,
    page: 1,
    pageSize: 0,
    totalPages: 0,
  };
}

export async function getPublicWishlistEvent(id: string) {
  return fetchJson<PublicWishlistEventResponse>(`/${id}/public`);
}

export async function getPublicWishlistEventGifts(
  id: string,
  params: { page?: number; per_page?: number } = {},
) {
  const searchParams = new URLSearchParams({
    page: String(params.page ?? 1),
    per_page: String(params.per_page ?? 25),
  });

  const response = await fetchJson<RawWishlistEventGiftsResponse>(
    `/${id}/gifts?${searchParams.toString()}`,
  );

  return {
    code: response.code ?? 200,
    message: response.message ?? "Wishlist event gifts fetched successfully",
    data: normalizeWishlistEventGiftsPage(response),
  };
}

export async function getPublicWishlistClaimedGiftIds(id: string) {
  const response = await fetchJson<WishlistEventClaimedGiftIdsResponse>(
    `/${id}/gifts/claimed-ids`,
  );

  return {
    code: response.code ?? 200,
    message: response.message ?? "Claimed gift ids fetched successfully",
    data: Array.isArray(response.data) ? response.data : [],
  };
}

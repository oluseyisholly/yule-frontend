"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import { EventGiftDetailSkeleton } from "@/components/ui/context-skeletons";
import { canManageWishlistEvent, isWishlistEventParticipant } from "@/features/wishlist-events/access";
import { useWishlistEventQuery } from "@/features/wishlist-events/hooks/useWishlistEventQuery";
import { useWishlistEventGiftsQuery } from "@/features/wishlist-events/hooks/useWishlistEventGiftsQuery";
import type { WishlistEventGiftRow } from "@/features/wishlist-events/types";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useAuthStore } from "@/stores/auth-store";

type WishListGiftViewScreenProps = {
  wishlistEventId: string;
  giftId: string;
  productId?: string | null;
};

type DetailStatus = "Completed" | "Draft" | "Ongoing" | "In Progress";

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB").format(date);
}

function formatMonthYear(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function toStatus(status?: string | null): DetailStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "draft") {
    return "Draft";
  }

  if (normalizedStatus === "ongoing") {
    return "Ongoing";
  }

  return "In Progress";
}

function getGiftImages(gift: WishlistEventGiftRow) {
  if (Array.isArray(gift.images) && gift.images.length > 0) {
    return gift.images.filter((image) => Boolean(image?.trim()));
  }

  const primaryImage = gift.imageUrl?.trim();

  return primaryImage ? [primaryImage] : [];
}

function toMarketplaceCondition(
  value?: string | null,
): MarketplaceProduct["condition"] {
  if (
    value === "new" ||
    value === "used" ||
    value === "foreign_used" ||
    value === "refurbished" ||
    value === "like_new" ||
    value === "good" ||
    value === "fair" ||
    value === "poor"
  ) {
    return value;
  }

  return undefined;
}

function mapWishlistGiftRowToMarketplaceProduct(
  gift: WishlistEventGiftRow,
): MarketplaceProduct {
  return {
    _id: gift.participantGiftId?.trim() || gift.id?.trim() || "selected-gift",
    sellerId: gift.sellerId || undefined,
    categorySlug: gift.categorySlug || undefined,
    subCategorySlug: gift.subCategorySlug || undefined,
    title: gift.title?.trim() || "Selected gift",
    description: gift.description ?? "",
    amount:
      typeof gift.amount === "number"
        ? gift.amount
        : Number(gift.amount?.toString() ?? 0),
    images: getGiftImages(gift),
    location: {
      state: gift.locationState || undefined,
      city: gift.locationCity || undefined,
    },
    condition: toMarketplaceCondition(gift.condition),
    slug: gift.productSlug || gift.slug || undefined,
  };
}

export default function WishListGiftViewScreen({
  wishlistEventId,
  giftId,
  productId = null,
}: WishListGiftViewScreenProps) {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const { data, isLoading, isError, refetch } = useWishlistEventQuery(
    wishlistEventId,
  );
  const {
    data: giftsResponse,
    isLoading: isGiftsLoading,
    isFetching: isGiftsFetching,
    isError: isGiftsError,
    refetch: refetchGifts,
  } = useWishlistEventGiftsQuery(
    wishlistEventId,
    {
      page: 1,
      per_page: 100,
    },
    {
      enabled: Boolean(wishlistEventId),
    },
  );

  const canManageDetail = useMemo(
    () =>
      canManageWishlistEvent(data?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, data?.data],
  );

  const isParticipantDetail = useMemo(
    () =>
      isWishlistEventParticipant(data?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, data?.data],
  );

  const detail = useMemo(() => {
    const record = data?.data;

    if (!record) {
      return null;
    }

    const createdBy = record.event.createdBy
      ? `${record.event.createdBy.firstName} ${record.event.createdBy.lastName}`.trim()
      : "Unknown";

    return {
      title: record.event.title || "Untitled Event",
      createdBy: createdBy || "Unknown",
      createdAt: formatMonthYear(record.createdAt),
      status: toStatus(record.event.status),
      eventDate: formatDate(record.event.eventDate),
      eventDeadline: formatDate(record.eventDeadline),
      gifts: String(giftsResponse?.data?.total ?? record.items?.length ?? 0),
      totalParticipants: String(record.event.participants?.length ?? 0),
    };
  }, [data, giftsResponse?.data?.total]);

  const selectedGiftRow = useMemo(() => {
    const giftRows = giftsResponse?.data?.data ?? [];
    const normalizedGiftId = giftId.trim();

    return (
      giftRows.find((gift) => {
        const rowId = gift.id?.trim() || null;
        const participantGiftId = gift.participantGiftId?.trim() || null;

        return normalizedGiftId === rowId || normalizedGiftId === participantGiftId;
      }) ?? null
    );
  }, [giftId, giftsResponse?.data?.data]);

  const requestedMarketplaceProductId =
    productId?.trim() ||
    selectedGiftRow?.participantGiftId?.trim() ||
    (selectedGiftRow ? null : giftId.trim());

  const {
    data: marketplaceProduct,
    isLoading: isMarketplaceProductLoading,
    isFetching: isMarketplaceProductFetching,
    isError: isMarketplaceProductError,
    refetch: refetchMarketplaceProduct,
  } = useMarketplaceProductQuery(requestedMarketplaceProductId, {
    enabled: Boolean(requestedMarketplaceProductId),
  });

  const selectedGiftDetailProduct = useMemo(() => {
    if (marketplaceProduct) {
      return marketplaceProduct;
    }

    if (selectedGiftRow) {
      return mapWishlistGiftRowToMarketplaceProduct(selectedGiftRow);
    }

    return null;
  }, [marketplaceProduct, selectedGiftRow]);

  if (isLoading) {
    return (
      <EventGiftDetailSkeleton
        backHref={`/dashboard/wish-list/${wishlistEventId}`}
        backLabel="View Gift"
      />
    );
  }

  if (isError || !detail) {
    return (
      <div className="space-y-5">
        <BackLink href={`/dashboard/wish-list/${wishlistEventId}`} label="View Gift" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this wish list right now.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!canManageDetail && !isParticipantDetail) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/wish-list" label="View Gift" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          You cannot access this wish list gift right now.
        </div>
      </div>
    );
  }

  if (isGiftsError || isMarketplaceProductError) {
    return (
      <div className="space-y-5">
        <BackLink href={`/dashboard/wish-list/${wishlistEventId}`} label="View Gift" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this gift right now.
          </p>
          <button
            type="button"
            onClick={() => {
              void refetchGifts();
              void refetchMarketplaceProduct();
            }}
            className="mt-4 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isGiftsLoading || isGiftsFetching || isMarketplaceProductLoading || isMarketplaceProductFetching) {
    return (
      <EventGiftDetailSkeleton
        backHref={`/dashboard/wish-list/${wishlistEventId}`}
        backLabel="View Gift"
      />
    );
  }

  if (!selectedGiftDetailProduct) {
    return (
      <div className="space-y-5">
        <BackLink href={`/dashboard/wish-list/${wishlistEventId}`} label="View Gift" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this gift right now.
        </div>
      </div>
    );
  }

  return (
    <EventGiftDetailView
      backHref={`/dashboard/wish-list/${wishlistEventId}`}
      backLabel="View Gift"
      eventTitle={detail.title}
      createdBy={detail.createdBy}
      createdAt={detail.createdAt}
      status={detail.status}
      avatarInitials={detail.title.slice(0, 2).toUpperCase()}
      summaryItems={[
        { label: "Event Date", value: detail.eventDate },
        { label: "Gift Deadline", value: detail.eventDeadline },
        { label: "Gifts", value: detail.gifts },
        { label: "Total Participants", value: detail.totalParticipants },
      ]}
      product={selectedGiftDetailProduct}
      onDelete={() => {
        toast("Deleting selected gifts is not available yet.");
      }}
      onMessageVendor={() => {
        toast("Vendor messaging is not available yet.");
      }}
      onReportItem={() => {
        toast("Reporting gifts is not available yet.");
      }}
      onShareProduct={() => {
        toast("Product sharing is not available yet.");
      }}
    />
  );
}

"use client";

import { useMemo, useState } from "react";
import { ShoppingCartIcon } from "lucide-react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import Button from "@/components/Button";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import Pagination from "@/components/Pagination";
import { GiftGridLoadingSkeleton } from "@/components/ui/context-skeletons";
import { useContactGiftCartItemsQuery } from "@/features/gifts/hooks/useContactGiftCartItemsQuery";
import type { ContactGiftCartItem } from "@/features/gifts/types";
import type { MarketplaceProduct } from "@/features/marketplace/types";

const PAGE_SIZE = 25;

function formatCurrency(value?: number | string | null) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "₦0";
  }

  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(numericValue)}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Recently added";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently added";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function toMarketplaceProduct(item: ContactGiftCartItem): MarketplaceProduct {
  return {
    _id: item.participantGiftId || item.id,
    title: item.title || "Selected gift",
    description: item.description ?? "",
    amount: Number(item.amount ?? 0),
    images: item.imageUrl ? [item.imageUrl] : [],
    categorySlug: item.categorySlug ?? undefined,
    subCategorySlug: item.subCategorySlug ?? undefined,
    condition: item.condition as MarketplaceProduct["condition"],
    location: {
      state: item.locationState ?? undefined,
      city: item.locationCity ?? undefined,
    },
    sellerId: item.sellerId ?? undefined,
    slug: item.productSlug ?? undefined,
  };
}

function CartItemCard({
  item,
  onView,
}: {
  item: ContactGiftCartItem;
  onView: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[18px] border border-[#EEE9F8] bg-white shadow-[0_10px_28px_rgba(29,18,68,0.05)]">
      <div className="relative h-[160px] bg-[#F6F7FB]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#8A8892]">
            No image available
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate text-[16px] font-semibold text-[#343039]">
            {item.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#7D7D7D]">
            {item.description || "No description available for this gift."}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-[15px] font-semibold text-[#1E1E1E]">
            {formatCurrency(item.amount)}
          </span>
          <Button
            type="button"
            onClick={onView}
            className="rounded-full px-5 py-2 text-[12px]"
          >
            View
          </Button>
        </div>
      </div>
    </article>
  );
}

export default function ContactGiftCartScreen() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<ContactGiftCartItem | null>(
    null,
  );
  const { data, isLoading, isFetching, isError, refetch } =
    useContactGiftCartItemsQuery({
      page: currentPage,
      per_page: PAGE_SIZE,
    });

  const cartItems = data?.data.data ?? [];
  const totalPages = Math.max(data?.data.totalPages ?? 1, 1);
  const selectedProduct = useMemo(
    () => (selectedItem ? toMarketplaceProduct(selectedItem) : null),
    [selectedItem],
  );

  if (selectedItem && selectedProduct) {
    const contactName = [
      selectedItem.contact?.firstName,
      selectedItem.contact?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      <EventGiftDetailView
        backHref="/dashboard/cart"
        backLabel="Back to cart"
        onBack={() => setSelectedItem(null)}
        eventTitle="My Cart"
        createdBy={contactName || "You"}
        createdAt={formatDate(selectedItem.createdAt)}
        status="Ongoing"
        avatarInitials="CT"
        summaryItems={[]}
        showHeader={false}
        showSummaryItems={false}
        product={selectedProduct}
        hideDeleteAction
        onDelete={() => undefined}
        onMessageVendor={() => toast("Vendor messaging is not available yet.")}
        onReportItem={() => toast("Thanks. We will review this item.")}
        onShareProduct={() => toast.success("Product link copied.")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <BackLink href="/dashboard/gifts" label="Cart" />

      <div className="flex flex-col gap-4 rounded-[24px] border border-[#F1EDF9] bg-white p-5 shadow-[0_12px_40px_rgba(29,18,68,0.05)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex size-12 items-center justify-center rounded-[16px] bg-[#F4F0FF] text-[#3300C9]">
              <ShoppingCartIcon className="size-5" />
            </div>
            <h1 className="mt-3 text-[26px] font-semibold text-[#1E1E1E]">
              My Cart
            </h1>
            <p className="mt-1 text-sm text-[#7D7D7D]">
              Review gifts you have saved from the marketplace.
            </p>
          </div>

          <Button href="/dashboard/gifts/flow/gift-selection?mode=create&tab=events&browse=true">
            Browse Gifts
          </Button>
        </div>

        {isError ? (
          <div className="rounded-[16px] border border-[#F2D8D8] bg-[#FFF8F8] p-5 text-center">
            <p className="text-sm text-[#8A5A5A]">
              Unable to load your cart right now.
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-semibold text-[#3300C9] transition-colors hover:text-[#25009A]"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <GiftGridLoadingSkeleton count={8} />
        ) : cartItems.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onView={() => setSelectedItem(item)}
                />
              ))}
            </div>

            <Pagination
              total={totalPages}
              initialPage={currentPage}
              onPageChange={setCurrentPage}
              className="border-t border-[#F1EDF9] pt-5"
            />

            {isFetching ? (
              <p className="text-center text-xs text-[#7D7D7D]">
                Refreshing cart...
              </p>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#E5DFF4] bg-[#FAF8FF] px-6 text-center">
            <ShoppingCartIcon className="size-10 text-[#3300C9]" />
            <h2 className="mt-4 text-[20px] font-semibold text-[#343039]">
              Your cart is empty
            </h2>
            <p className="mt-2 max-w-[420px] text-sm text-[#7D7D7D]">
              Browse gifts and add the ones you would like to keep for later.
            </p>
            <Button
              href="/dashboard/gifts/flow/gift-selection?mode=create&tab=events&browse=true"
              className="mt-5"
            >
              Browse Gifts
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

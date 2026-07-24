"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import { EventGiftDetailSkeleton } from "@/components/ui/context-skeletons";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import { useDeleteContactGiftCartItemMutation } from "@/features/gifts/hooks/useDeleteContactGiftCartItemMutation";
import { useContactGiftCartItemsQuery } from "@/features/gifts/hooks/useContactGiftCartItemsQuery";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";

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

function toMarketplaceProduct(item: {
  participantGiftId?: string | null;
  id?: string | null;
  title?: string | null;
  description?: string | null;
  amount?: number | string | null;
  imageUrl?: string | null;
  categorySlug?: string | null;
  subCategorySlug?: string | null;
  condition?: string | null;
  locationState?: string | null;
  locationCity?: string | null;
  sellerId?: string | null;
  productSlug?: string | null;
}): MarketplaceProduct {
  return {
    _id: item.participantGiftId?.trim() || item.id?.trim() || "selected-gift",
    sellerId: item.sellerId?.trim() || undefined,
    categorySlug: item.categorySlug?.trim() || undefined,
    subCategorySlug: item.subCategorySlug?.trim() || undefined,
    title: item.title?.trim() || "Selected gift",
    description: item.description?.trim() || undefined,
    amount: Number(item.amount ?? 0),
    images: item.imageUrl?.trim() ? [item.imageUrl.trim()] : [],
    location: {
      state: item.locationState?.trim() || undefined,
      city: item.locationCity?.trim() || undefined,
    },
    condition: item.condition?.trim() as MarketplaceProduct["condition"],
    slug: item.productSlug?.trim() || undefined,
  };
}

type ContactGiftCartItemDetailsScreenProps = {
  cartItemId: string;
  productId: string | null;
};

export default function ContactGiftCartItemDetailsScreen({
  cartItemId,
  productId,
}: ContactGiftCartItemDetailsScreenProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteContactGiftCartItemMutation =
    useDeleteContactGiftCartItemMutation();

  const { data: cartItemsResponse } = useContactGiftCartItemsQuery({
    page: 1,
    per_page: 100,
  });

  const cartItem = useMemo(
    () =>
      (cartItemsResponse?.data.data ?? []).find(
        (item) => item.id === cartItemId,
      ) ?? null,
    [cartItemId, cartItemsResponse?.data.data],
  );

  const resolvedProductId =
    productId?.trim() || cartItem?.participantGiftId?.trim() || cartItemId;

  const { data: marketplaceProduct, isLoading, refetch } =
    useMarketplaceProductQuery(resolvedProductId, {
      enabled: Boolean(resolvedProductId),
    });

  const selectedProduct = useMemo(() => {
    if (marketplaceProduct) {
      return marketplaceProduct;
    }

    if (cartItem) {
      return toMarketplaceProduct(cartItem);
    }

    return null;
  }, [cartItem, marketplaceProduct]);

  const handleDelete = async () => {
    try {
      const response = await deleteContactGiftCartItemMutation.mutateAsync(
        cartItemId,
      );
      toast.success(response.message || "Caught My Eye item deleted successfully.");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/cart");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this Caught My Eye item right now.",
      );
    }
  };

  if (isLoading && !selectedProduct) {
    return (
      <EventGiftDetailSkeleton
        backHref="/dashboard/cart"
        backLabel="Back"
      />
    );
  }

  if (!selectedProduct) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/cart" label="Back" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this Caught My Eye item right now.
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <EventGiftDetailView
        backHref="/dashboard/cart"
        backLabel="Back"
        eventTitle="Caught My Eye"
        createdBy="You"
        createdAt={formatDate(cartItem?.createdAt)}
        status="Ongoing"
        avatarInitials="CM"
        summaryItems={[]}
        showSummaryItems={false}
        product={selectedProduct}
        hideDeleteAction
        showInlineDeleteAction
        inlineDeleteActionLabel="Delete"
        onDelete={() => setIsDeleteModalOpen(true)}
        onReportItem={() => toast("Thanks. We will review this item.")}
        onShareProduct={() => toast.success("Product link copied.")}
      />

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete Caught My Eye Item"
        description="Are you sure you want to remove this item from Caught My Eye?"
        confirmText="Delete"
        isLoading={deleteContactGiftCartItemMutation.isPending}
        closeOnOverlayClick={false}
      />
    </div>
  );
}

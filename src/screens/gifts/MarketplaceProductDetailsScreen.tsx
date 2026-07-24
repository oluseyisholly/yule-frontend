"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import { EventGiftDetailSkeleton } from "@/components/ui/context-skeletons";
import { useCreateContactGiftCartItemMutation } from "@/features/gifts/hooks/useCreateContactGiftCartItemMutation";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";

type MarketplaceProductDetailsScreenProps = {
  productId: string;
  backHref?: string | null;
};

export default function MarketplaceProductDetailsScreen({
  productId,
  backHref = "/dashboard/gifts?tab=events",
}: MarketplaceProductDetailsScreenProps) {
  const resolvedBackHref = backHref ?? "/dashboard/gifts?tab=events";
  const createContactGiftCartItemMutation =
    useCreateContactGiftCartItemMutation();

  const {
    data: marketplaceProduct,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useMarketplaceProductQuery(productId, {
    enabled: Boolean(productId),
  });

  const selectedProduct = useMemo(() => marketplaceProduct ?? null, [marketplaceProduct]);

  const handleAddToFavourites = async () => {
    if (!selectedProduct) {
      return;
    }

    try {
      const response = await createContactGiftCartItemMutation.mutateAsync({
        participantGiftId: selectedProduct._id,
        title: selectedProduct.title || "Selected gift",
        description: selectedProduct.description || "",
        amount: Number(selectedProduct.amount ?? 0),
        currency: "NGN",
        imageUrl: selectedProduct.images?.[0] || undefined,
        categorySlug: selectedProduct.categorySlug || undefined,
        subCategorySlug: selectedProduct.subCategorySlug || undefined,
        condition: selectedProduct.condition || undefined,
        locationState: selectedProduct.location?.state || undefined,
        locationCity: selectedProduct.location?.city || undefined,
        sellerId: selectedProduct.sellerId || undefined,
        productSlug: selectedProduct.slug || undefined,
      });

      toast.success(response.message || "Gift added to favourites.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add this gift to favourites right now.",
      );
    }
  };

  if ((isLoading || isFetching) && !selectedProduct) {
    return (
      <EventGiftDetailSkeleton backHref={resolvedBackHref} backLabel="Back" />
    );
  }

  if (isError || !selectedProduct) {
    return (
      <div className="space-y-5">
        <BackLink href={resolvedBackHref} label="Back" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this gift right now.
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
        backHref={resolvedBackHref}
        backLabel="Back"
        eventTitle="Browse Gifts"
        createdBy="Festa marketplace"
        createdAt="Available gifts"
        showHeader={false}
        status="Ongoing"
        avatarInitials="GF"
        summaryItems={[]}
        showSummaryItems={false}
        product={selectedProduct}
        hideDeleteAction
        onDelete={() => undefined}
        onAddToCart={handleAddToFavourites}
        addToCartLabel={
          createContactGiftCartItemMutation.isPending
            ? "Adding..."
            : "Add to Favourites"
        }
        addToCartDisabled={createContactGiftCartItemMutation.isPending}
        onReportItem={() => toast("Thanks. We will review this item.")}
        onShareProduct={() => toast.success("Product link copied.")}
      />
    </div>
  );
}

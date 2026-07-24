"use client";

import { type StaticImageData } from "next/image";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import ModalButton from "@/components/ModalButtons";
import ModalStepLayout from "@/components/ModalStepLayout";
import WishlistGiftItemCard, {
  type WishlistGiftCardItem,
} from "@/components/WishlistGiftItemCard";
import { GiftGridLoadingSkeleton } from "@/components/ui/context-skeletons";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import featureImg5 from "@/assets/icons/featureImg5.svg";
import featureImg6 from "@/assets/icons/featureImg6.svg";
import type { WishlistEventGiftRow } from "@/features/wishlist-events/types";

type WishlistClaimGiftSelectionStepProps = {
  title: string;
  description?: string;
  allowMultipleItems?: boolean;
  gifts: WishlistEventGiftRow[];
  claimedGiftIds: string[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onClaim: () => void;
  claimDisabled?: boolean;
  claimLabel?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const fallbackWishListImages: StaticImageData[] = [
  featureImg1,
  featureImg2,
  featureImg3,
  featureImg4,
  featureImg5,
  featureImg6,
];

function formatCurrency(value?: string | number | null) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatCondition(value?: string | null) {
  if (!value?.trim()) {
    return "Available";
  }

  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("-");
}

function mapGiftToWishListItem(
  gift: WishlistEventGiftRow,
  index: number,
  claimedGiftIds: Set<string>,
): WishlistGiftCardItem {
  const location = [gift.locationCity, gift.locationState]
    .filter((value) => value?.trim())
    .join(", ");
  const isClaimed =
    claimedGiftIds.has(gift.id) || Boolean(gift.giverParticipantId);

  return {
    id: gift.id,
    productId: gift.participantGiftId?.trim() || gift.id,
    title: gift.title?.trim() || "Selected Gift",
    imageUrl: gift.imageUrl?.trim() || gift.images?.[0]?.trim() || "",
    fallbackImage:
      fallbackWishListImages[index % fallbackWishListImages.length],
    condition: formatCondition(gift.condition),
    price: formatCurrency(gift.amount),
    location: location || "Location not specified",
    availability: isClaimed ? "Claimed" : "Available",
    isDisabled: isClaimed,
    note:
      gift.description?.trim() ||
      "A thoughtful gift option selected for this wishlist.",
  };
}

export default function WishlistClaimGiftSelectionStep({
  title,
  description = "Browse the gifts already selected for this wishlist and claim the one you want to buy.",
  allowMultipleItems = true,
  gifts,
  claimedGiftIds,
  selectedIds,
  onSelectedIdsChange,
  onClaim,
  claimDisabled = false,
  claimLabel = "Claim Gift",
  isLoading = false,
  isError = false,
  onRetry,
}: WishlistClaimGiftSelectionStepProps) {
  const router = useRouter();
  const claimedGiftIdsSet = useMemo(() => new Set(claimedGiftIds), [claimedGiftIds]);
  const mappedWishListItems = useMemo(
    () =>
      gifts.map((gift, index) =>
        mapGiftToWishListItem(gift, index, claimedGiftIdsSet),
      ),
    [claimedGiftIdsSet, gifts],
  );

  useEffect(() => {
    const nextSelectedIds = selectedIds.filter(
      (giftId) => !claimedGiftIdsSet.has(giftId),
    );

    if (nextSelectedIds.length !== selectedIds.length) {
      onSelectedIdsChange(nextSelectedIds);
    }
  }, [claimedGiftIdsSet, onSelectedIdsChange, selectedIds]);

  const toggleGiftSelection = (giftId: string, checked: boolean) => {
    if (claimedGiftIdsSet.has(giftId)) {
      return;
    }

    if (!checked) {
      onSelectedIdsChange(selectedIds.filter((id) => id !== giftId));
      return;
    }

    if (selectedIds.includes(giftId)) {
      return;
    }

    if (!allowMultipleItems) {
      onSelectedIdsChange([giftId]);
      return;
    }

    onSelectedIdsChange([...selectedIds, giftId]);
  };

  return (
    <ModalStepLayout
      header={
        <div className="space-y-3 pb-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
              Wishlist Gifts
            </p>
            <h2 className="mt-2 max-w-[820px] font-body text-[26px] font-semibold leading-tight text-charcoal sm:text-[32px]">
              {title}
            </h2>
            <p className="mt-2 max-w-[760px] text-[13px] leading-6 text-charcoal sm:text-[14px]">
              {description}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-center border-t border-[#F1EDF9] mt-3 pt-3">
          <ModalButton
            type="button"
            onClick={onClaim}
            disabled={claimDisabled}
            className="w-full max-w-[140px] !h-[38px] rounded-[16px]"
          >
            {claimLabel}
          </ModalButton>
        </div>
      }
      contentClassName="pr-0 sm:pr-1"
    >
      {isLoading ? (
        <div className="rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] p-4 sm:p-5">
          <GiftGridLoadingSkeleton count={8} />
        </div>
      ) : isError ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center">
          <p className="text-[14px] text-[#7D7D7D]">
            Unable to load wishlist gifts right now.
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 text-[13px] font-semibold text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry
            </button>
          ) : null}
        </div>
      ) : mappedWishListItems.length === 0 ? (
        <div className="flex min-h-[320px] items-start justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center text-[14px] text-[#7D7D7D]">
          No gifts have been added to this wishlist yet.
        </div>
      ) : (
          <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {mappedWishListItems.map((item) => (
              <WishlistGiftItemCard
                key={item.id}
                item={item}
                checked={selectedIds.includes(item.id)}
                onView={() =>
                  router.push(
                    `/dashboard/gifts/product/${encodeURIComponent(item.productId)}?backHref=${encodeURIComponent(window.location.pathname + window.location.search)}`,
                  )
                }
                onCheckedChange={(checked) =>
                  toggleGiftSelection(item.id, checked)
                }
              />
            ))}
          </div>
      )}
    </ModalStepLayout>
  );
}

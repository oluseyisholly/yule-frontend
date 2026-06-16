"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useMemo } from "react";
import Button from "@/components/Button";
import ModalButton from "@/components/ModalButtons";
import ModalStepLayout from "@/components/ModalStepLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import featureImg5 from "@/assets/icons/featureImg5.svg";
import featureImg6 from "@/assets/icons/featureImg6.svg";
import verifiedIcon from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";
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

type WishListClaimItem = {
  id: string;
  title: string;
  imageUrl?: string;
  fallbackImage: StaticImageData;
  condition: string;
  price: string;
  location: string;
  availability: "Available" | "Claimed";
  note: string;
  isDisabled: boolean;
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
): WishListClaimItem {
  const location = [gift.locationCity, gift.locationState]
    .filter((value) => value?.trim())
    .join(", ");
  const isClaimed =
    claimedGiftIds.has(gift.id) || Boolean(gift.giverParticipantId);

  return {
    id: gift.id,
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

function getAvailabilityStyles(availability: WishListClaimItem["availability"]) {
  if (availability === "Claimed") {
    return "bg-[#FDE9E7] text-[#D94C3F]";
  }

  return "bg-[#E8F8EF] text-[#1E9E5A]";
}

function WishListClaimCard({
  item,
  checked,
  onCheckedChange,
}: {
  item: WishListClaimItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const isDisabled = item.isDisabled;

  return (
    <article
      className={cn(
        "relative flex h-full w-full min-w-0 max-w-none flex-col gap-3 overflow-hidden rounded-[18px] border p-3 shadow-[0_2px_6px_rgba(33,16,93,0.04)] transition-colors",
        isDisabled
          ? "border-2 border-[#D94C3F] bg-[#FFF5F4] shadow-[0_8px_24px_rgba(217,76,63,0.12)]"
          : "border-[#EEEAF7] bg-white",
      )}
    >
      {isDisabled ? (
        <div className="absolute top-[18px] right-[-38px] z-20 w-[150px] rotate-45 bg-[#D94C3F] py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_rgba(217,76,63,0.25)]">
          Claimed
        </div>
      ) : null}

      <div className="relative h-[170px] shrink-0 overflow-hidden rounded-[14px] bg-[#F7F6FB]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className={cn(
              "h-full w-full object-cover transition-[filter,transform]",
              isDisabled && "scale-[1.01] grayscale-[0.2] brightness-[0.8]",
            )}
          />
        ) : (
          <Image
            src={item.fallbackImage}
            alt={item.title}
            className={cn(
              "h-full w-full object-cover transition-[filter,transform]",
              isDisabled && "scale-[1.01] grayscale-[0.2] brightness-[0.8]",
            )}
          />
        )}

        {isDisabled ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#191A1F]/22">
            <span className="inline-flex rounded-full bg-[#D94C3F] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_28px_rgba(25,26,31,0.2)]">
              Gift Claimed
            </span>
          </div>
        ) : null}

        <span
          className={cn(
            "absolute left-3 top-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold",
            getAvailabilityStyles(item.availability),
          )}
        >
          {item.availability}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 px-1">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <h3
            className={cn(
              "line-clamp-2 text-[18px] font-semibold leading-tight",
              isDisabled ? "text-[#76707B]" : "text-[#4E4C4D]",
            )}
          >
            {item.title}
          </h3>
          <Image
            src={verifiedIcon}
            alt="Verified"
            className={cn("mt-1 w-[18px] shrink-0", isDisabled && "opacity-70")}
          />
        </div>

        <span
          className={cn(
            "inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-medium",
            isDisabled
              ? "border border-[#E4DDE8] bg-[#F4EFF7] text-[#8E8499]"
              : "border border-[#FF6600] bg-[#FF660014] text-[#FF6600]",
          )}
        >
          {item.condition}
        </span>

        <p
          className={cn(
            "line-clamp-2 min-h-[40px] text-[12px] leading-5",
            isDisabled ? "text-[#98919E]" : "text-[#716F6F]",
          )}
        >
          {item.note}
        </p>

        <div
          className={cn(
            "flex items-center gap-1 text-[11px]",
            isDisabled ? "text-[#A79FAE]" : "text-[#97989A]",
          )}
        >
          <Image
            src={locationIcon}
            alt="Location"
            className="h-[9px] w-[7px]"
          />
          <span className="truncate">{item.location}</span>
        </div>

        <div className="pt-1">
          <span
            className={cn(
              "block truncate text-[15px] font-semibold leading-tight tracking-[0.03em]",
              isDisabled ? "text-[#76707B]" : "text-[#17191C]",
            )}
          >
            {item.price}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pt-2 sm:gap-3">
          <Button
            href="/gifts"
            label="View"
            variant="filled"
            className="h-auto w-full min-w-0 justify-center rounded-[14px] px-3 py-2 text-[10px] font-medium"
          />

          {isDisabled ? (
            <span className="inline-flex h-8 items-center justify-center rounded-full bg-[#D94C3F] px-3.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
              Claimed
            </span>
          ) : (
            <Checkbox
              checked={checked}
              onCheckedChange={(nextChecked) =>
                onCheckedChange(Boolean(nextChecked))
              }
              aria-label={`Select ${item.title}`}
              className="size-5 rounded-[5px] border-[#3300C9] data-[state=checked]:border-[#3300C9] data-[state=checked]:bg-[#3300C9] data-[state=checked]:text-white"
            />
          )}
        </div>
      </div>
    </article>
  );
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
        <div className="flex items-center justify-center border-t border-[#F1EDF9] pt-5">
          <ModalButton
            type="button"
            onClick={onClaim}
            disabled={claimDisabled}
            className="w-full max-w-[420px] !h-[40px] rounded-[18px]"
          >
            {claimLabel}
          </ModalButton>
        </div>
      }
      contentClassName="pr-0 sm:pr-1"
    >
      {isLoading ? (
        <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] text-[14px] text-[#7D7D7D]">
          Loading gifts...
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
        <div className="flex min-h-[320px] items-center justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center text-[14px] text-[#7D7D7D]">
          No gifts have been added to this wishlist yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {mappedWishListItems.map((item) => (
            <WishListClaimCard
              key={item.id}
              item={item}
              checked={selectedIds.includes(item.id)}
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

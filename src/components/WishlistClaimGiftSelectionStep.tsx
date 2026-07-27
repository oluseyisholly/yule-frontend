"use client";

import Image from "next/image";
import { type StaticImageData } from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ModalButton from "@/components/ModalButtons";
import ModalStepLayout from "@/components/ModalStepLayout";
import UserAvatar from "@/components/UserAvatar";
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
  hangoutItem?: WishlistGiftCardItem | null;
  hangoutDateLabel?: string;
  hangoutParticipants?: Array<{
    id: string;
    name: string;
    profileUrl?: string | null;
  }>;
  hangoutViewHref?: string | null;
  onClaimHangout?: () => void;
  claimHangoutDisabled?: boolean;
  claimHangoutLabel?: string;
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

function HangoutClaimCard({
  item,
  dateLabel,
  participants = [],
  onView,
}: {
  item: WishlistGiftCardItem;
  dateLabel?: string;
  participants?: Array<{
    id: string;
    name: string;
    profileUrl?: string | null;
  }>;
  onView: () => void;
}) {
  const visibleParticipants = participants.slice(0, 3);
  const overflowCount = Math.max(participants.length - visibleParticipants.length, 0);

  return (
    <article className="w-full max-w-[320px] rounded-[18px] border border-[#EEEAF7] bg-white p-3 shadow-[0_2px_6px_rgba(33,16,93,0.04)]">
      <div className="relative aspect-[1.58] overflow-hidden rounded-[14px] bg-[#F7F5FF]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 320px"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[#EFE6FD] text-[30px] font-semibold tracking-wide text-[#3300C9]">
            {item.title
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part.charAt(0))
              .join("")
              .toUpperCase() || "HG"}
          </div>
        )}

        <div className="absolute right-2 top-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium",
              item.isDisabled
                ? "bg-[#FDE9E7] text-[#D94C3F]"
                : "bg-[#E8F7ED] text-[#1E9E53]",
            )}
          >
            {item.availability}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-[13px] font-semibold text-[#1E1E1E]">
          {item.title}
        </h3>
        <p className="shrink-0 text-[11px] font-semibold text-[#434343]">
          {item.price}
        </p>
      </div>

      <div className="mt-1.5">
        <span className="inline-flex max-w-full items-center rounded-full border border-[#FF9D1C] bg-[#FFF1DD] px-2 py-0.5 text-[9px] font-medium text-[#FF9D1C]">
          <span className="truncate">{item.location}</span>
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] leading-tight text-[#7D7D7D]">
          <CalendarDaysIcon className="size-3 shrink-0" strokeWidth={1.8} />
          <span className="truncate">{dateLabel || "Date not available"}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] leading-tight text-[#7D7D7D]">
          <UsersIcon className="size-3 shrink-0" strokeWidth={1.8} />
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex items-center -space-x-2">
              {visibleParticipants.map((participant, index) => (
                <UserAvatar
                  key={participant.id}
                  name={participant.name}
                  imageUrl={participant.profileUrl}
                  className="size-6 border border-white text-[8px] font-semibold"
                  bgColor={index % 2 === 0 ? "#EFE6FD" : "#FCEEC8"}
                  textColor={index % 2 === 0 ? "#3300C9" : "#8A5B00"}
                  title={participant.name}
                />
              ))}
              {overflowCount > 0 ? (
                <span className="flex size-6 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[8px] font-semibold text-[#6F6C75]">
                  +{overflowCount}
                </span>
              ) : null}
            </div>
            <span className="truncate">
              {participants.length
                ? participants.length === 1
                  ? participants[0]?.name
                  : `${participants.length} participants`
                : "Participant details unavailable"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-full bg-[#3300C9] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#2D00B4]"
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default function WishlistClaimGiftSelectionStep({
  title,
  description = "Browse the gifts already selected for this wishlist and claim the one you want to buy.",
  allowMultipleItems = true,
  hangoutItem = null,
  hangoutDateLabel,
  hangoutParticipants = [],
  hangoutViewHref,
  onClaimHangout,
  claimHangoutDisabled = false,
  claimHangoutLabel = "Claim Hangout",
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
  const [activeTab, setActiveTab] = useState<"gifts" | "hangout">("gifts");
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

  const hasGifts = mappedWishListItems.length > 0;
  const hasHangout = Boolean(hangoutItem);
  const shouldShowTabs = hasGifts && hasHangout;

  useEffect(() => {
    if (shouldShowTabs) {
      return;
    }

    if (hasHangout && !hasGifts) {
      setActiveTab("hangout");
      return;
    }

    setActiveTab("gifts");
  }, [hasGifts, hasHangout, shouldShowTabs]);

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

          {shouldShowTabs ? (
            <div className="flex items-center gap-5 border-b border-[#F1EDF8]">
              <button
                type="button"
                onClick={() => setActiveTab("gifts")}
                className={cn(
                  "border-b-2 pb-3 text-sm font-medium transition-colors",
                  activeTab === "gifts"
                    ? "border-[#3300C9] text-[#3300C9]"
                    : "border-transparent text-[#9A97A5] hover:text-[#5A4CB8]",
                )}
              >
                Gift Items
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("hangout")}
                className={cn(
                  "border-b-2 pb-3 text-sm font-medium transition-colors",
                  activeTab === "hangout"
                    ? "border-[#3300C9] text-[#3300C9]"
                    : "border-transparent text-[#9A97A5] hover:text-[#5A4CB8]",
                )}
              >
                Hangout
              </button>
            </div>
          ) : null}
        </div>
      }
      footer={
        hasGifts && (!shouldShowTabs || activeTab === "gifts") ? (
          <div className="mt-3 flex items-center justify-center border-t border-[#F1EDF9] pt-3">
            <ModalButton
              type="button"
              onClick={onClaim}
              disabled={claimDisabled}
              className="w-full max-w-[140px] !h-[38px] rounded-[16px]"
            >
              {claimLabel}
            </ModalButton>
          </div>
        ) : null
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
      ) : mappedWishListItems.length === 0 && !hangoutItem ? (
        <div className="flex min-h-[320px] items-start justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center text-[14px] text-[#7D7D7D]">
          No gifts or hangouts have been added to this wishlist yet.
        </div>
      ) : (
        <div className="space-y-6">
          {hangoutItem && (!shouldShowTabs || activeTab === "hangout") ? (
            <section className="space-y-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
                  Wishlist Hangout
                </p>
                <p className="mt-1 text-[13px] leading-6 text-charcoal sm:text-[14px]">
                  Claim the hangout in this wishlist if you want to sponsor it.
                </p>
              </div>

              <div className="grid grid-cols-1 justify-items-start min-[520px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                <HangoutClaimCard
                  item={hangoutItem}
                  dateLabel={hangoutDateLabel}
                  participants={hangoutParticipants}
                  onView={() =>
                    router.push(
                      hangoutViewHref ||
                        `/dashboard/hangouts/${encodeURIComponent(hangoutItem.productId)}?productId=${encodeURIComponent(hangoutItem.productId)}&backHref=${encodeURIComponent(window.location.pathname + window.location.search)}`,
                    )
                  }
                />
              </div>

              {!hangoutItem.isDisabled && onClaimHangout ? (
                <div className="flex justify-center border-b border-[#F1EDF9] pb-5">
                  <ModalButton
                    type="button"
                    onClick={onClaimHangout}
                    disabled={claimHangoutDisabled}
                    className="w-full max-w-[190px] whitespace-nowrap !h-[38px] rounded-[16px] px-5"
                  >
                    {claimHangoutLabel}
                  </ModalButton>
                </div>
              ) : null}
            </section>
          ) : null}

          {mappedWishListItems.length &&
          (!shouldShowTabs || activeTab === "gifts") ? (
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
          ) : null}
        </div>
      )}
    </ModalStepLayout>
  );
}

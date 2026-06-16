"use client";

import Image, { type StaticImageData } from "next/image";
import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  GiftIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import PromoCta from "@/components/PromoCta";
import ContentModal from "@/components/ui/modal";
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
import { useClaimGiftMutation } from "@/features/gifts/hooks/useClaimGiftMutation";
import { useAuthStore } from "@/stores/auth-store";
import type {
  PublicWishlistEventRecord,
  WishlistEventGiftRow,
} from "@/features/wishlist-events/types";

type WishListPublicScreenProps = {
  wishListEventId: string;
  wishlistEvent: PublicWishlistEventRecord | null;
  wishlistGifts: WishlistEventGiftRow[];
  wishlistGiftTotal: number;
  claimedGiftIds: string[];
};

type WishListItem = {
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

function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

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

function formatVisibility(value?: string | null) {
  if (!value?.trim()) {
    return "Private";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getAvailabilityStyles(availability: WishListItem["availability"]) {
  if (availability === "Claimed") {
    return "bg-[#FDE9E7] text-[#D94C3F]";
  }

  return "bg-[#E8F8EF] text-[#1E9E5A]";
}

function mapGiftToWishListItem(
  gift: WishlistEventGiftRow,
  index: number,
  claimedGiftIds: Set<string>,
): WishListItem {
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

function WishListStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#EEEAF7] bg-white p-4 shadow-[0_8px_22px_rgba(39,16,99,0.05)]">
      <div className="flex items-center gap-2 text-[#3300C9]">
        {icon}
        <span className="text-[12px] font-medium text-[#7D7D7D]">{label}</span>
      </div>
      <p className="mt-3 text-[20px] font-semibold text-[#17191C]">{value}</p>
    </div>
  );
}

function WishListItemCard({
  item,
  checked,
  onCheckedChange,
}: {
  item: WishListItem;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const isDisabled = item.isDisabled;

  return (
    <article
      className={cn(
        "relative flex w-full min-w-0 max-w-[290px] flex-col gap-3 overflow-hidden rounded-[18px] border p-3 shadow-[0_2px_6px_rgba(33,16,93,0.04)] transition-colors",
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
            <span className="inline-flex rounded-full bg-[#D94C3F] px-5 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-white uppercase shadow-[0_10px_28px_rgba(25,26,31,0.2)]">
              Gift Claimed
            </span>
          </div>
        ) : null}

        <span
          className={`absolute left-3 top-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${getAvailabilityStyles(
            item.availability,
          )}`}
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

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 pt-2">
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
              disabled={item.availability === "Claimed"}
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

function EmptyWishlistState() {
  return (
    <div className="rounded-[20px] border border-dashed border-[#D9D0F4] bg-[#FBFAFF] px-6 py-12 text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
        No Gifts Yet
      </p>
      <h3 className="mt-2 text-[24px] font-semibold text-[#17191C]">
        This wishlist has not added any gift items yet.
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#716F6F]">
        Check back shortly or browse the gifts page for ideas while this
        wishlist is being updated.
      </p>
    </div>
  );
}

export default function WishListPublicScreen({
  wishListEventId,
  wishlistEvent,
  wishlistGifts,
  wishlistGiftTotal,
  claimedGiftIds,
}: WishListPublicScreenProps) {
  const router = useRouter();
  const claimGiftMutation = useClaimGiftMutation();
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] =
    useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const resolvedTitle = wishlistEvent?.title?.trim() || "Shared Wishlist";
  const resolvedDescription =
    wishlistEvent?.description?.trim() ||
    "Browse the selected gift ideas on this shared wishlist and find something thoughtful without the guesswork.";
  const resolvedEventDate = formatDate(wishlistEvent?.eventDate);
  const resolvedDeadline = formatDate(wishlistEvent?.eventDeadline);
  const resolvedVisibility = formatVisibility(wishlistEvent?.visibility);
  const resolvedAllowMultiple = wishlistEvent?.allowMultipleItems
    ? "Multiple items allowed"
    : "One item at a time";
  const allowMultipleItems = wishlistEvent?.allowMultipleItems ?? true;
  const claimedGiftIdsSet = new Set(claimedGiftIds);
  const mappedWishListItems = wishlistGifts.map((gift, index) =>
    mapGiftToWishListItem(gift, index, claimedGiftIdsSet),
  );

  const toggleGiftSelection = (giftId: string, checked: boolean) => {
    if (claimedGiftIdsSet.has(giftId)) {
      return;
    }

    setSelectedGiftIds((current) => {
      if (!checked) {
        return current.filter((id) => id !== giftId);
      }

      if (current.includes(giftId)) {
        return current;
      }

      if (!allowMultipleItems) {
        return [giftId];
      }

      return [...current, giftId];
    });
  };

  const handleClaimGift = async () => {
    if (!selectedGiftIds.length) {
      return;
    }

    if (!isAuthenticated) {
      setIsLoginRequiredModalOpen(true);
      return;
    }

    const giftIdsToClaim = Array.from(
      new Set(
        selectedGiftIds.filter((giftId) => !claimedGiftIdsSet.has(giftId)),
      ),
    );

    if (!giftIdsToClaim.length) {
      toast.error("The selected gift has already been claimed.");
      setSelectedGiftIds([]);
      return;
    }

    setIsClaiming(true);

    try {
      let lastResponseMessage = "Gift claimed successfully";

      for (const giftId of giftIdsToClaim) {
        const response = await claimGiftMutation.mutateAsync(giftId);
        lastResponseMessage = response.message || lastResponseMessage;
      }

      toast.success(
        giftIdsToClaim.length > 1
          ? `${giftIdsToClaim.length} gifts claimed successfully`
          : lastResponseMessage,
      );
      setSelectedGiftIds([]);
      router.refresh();
    } catch {
      // Request errors are already normalized and surfaced by the API layer.
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <main className="overflow-x-hidden bg-white">
      <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pb-10 pt-8 sm:px-6 md:gap-10 md:px-8 md:pb-14 md:pt-10 lg:px-12 lg:pb-16 lg:pt-12">
        <div className="flex flex-col gap-6 md:gap-8">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
              Shared Wishlist
            </p>
            <h1 className="mt-2 break-words font-title text-[26px] leading-tight text-[#17191C] sm:text-[30px] md:text-[34px] lg:text-[36px]">
              {resolvedTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] text-[#716F6F] sm:text-[14px]">
              {resolvedDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 ">
            <div className="rounded-[20px] border border-[#EEEAF7] bg-[#FBFAFF] p-5 shadow-[0_8px_22px_rgba(39,16,99,0.04)] sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words text-[22px] font-semibold text-[#17191C] sm:text-[24px]">
                    {resolvedTitle}
                  </p>
                  <p className="mt-1 text-[14px] text-[#716F6F]">
                    A shared celebration wishlist
                  </p>
                  {/* <p className="mt-2 break-all text-[11px] text-[#9A98A3]">
                    Wishlist ID: {wishListEventId}
                  </p> */}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-[#EEE6FF] px-3 py-1.5 text-[11px] font-semibold text-[#3300C9]">
                    {resolvedVisibility}
                  </span>
                  <span className="inline-flex rounded-full bg-[#E8F8EF] px-3 py-1.5 text-[11px] font-semibold text-[#1E9E5A]">
                    {resolvedAllowMultiple}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <WishListStat
                  icon={
                    <CalendarDaysIcon className="size-4" strokeWidth={1.8} />
                  }
                  label="Celebration Date"
                  value={resolvedEventDate}
                />
                <WishListStat
                  icon={<SparklesIcon className="size-4" strokeWidth={1.8} />}
                  label="Gift Deadline"
                  value={resolvedDeadline}
                />
                <WishListStat
                  icon={<GiftIcon className="size-4" strokeWidth={1.8} />}
                  label="Wish List Items"
                  value={String(wishlistGiftTotal)}
                />
                <WishListStat
                  icon={
                    <ShieldCheckIcon className="size-4" strokeWidth={1.8} />
                  }
                  label="Access"
                  value={resolvedVisibility}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
                Wish List Items
              </p>
              <h2 className="mt-2 font-title text-[26px] leading-tight text-[#17191C] sm:text-[30px] md:text-[34px]">
                A curated list of things they would genuinely enjoy.
              </h2>

              <p className=" text-[14px] leading-6 text-[#716F6F]">
                Browse the gifts already selected for this wishlist and get a
                clearer sense of what would make the celebration feel
                thoughtful.
              </p>
            </div>
          </div>

          {mappedWishListItems.length ? (
            <>
              <div className="grid justify-items-center grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {mappedWishListItems.map((item) => (
                  <WishListItemCard
                    key={item.id}
                    item={item}
                    checked={selectedGiftIds.includes(item.id)}
                    onCheckedChange={(checked) =>
                      toggleGiftSelection(item.id, checked)
                    }
                  />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleClaimGift}
                  disabled={!selectedGiftIds.length || isClaiming}
                  className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-[#3300C9] px-8 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isClaiming ? "Claiming..." : "Claim Gift"}
                </button>
              </div>
            </>
          ) : (
            <EmptyWishlistState />
          )}
        </div>
      </section>

      <PromoCta
        title="Need more ideas before you pick a gift?"
        description="Explore more gift inspiration across categories, budgets, and styles, then come back to this wishlist with a clearer idea."
        ctaLabel="Explore Gift Ideas"
        ctaHref="/gifts"
      />

      <ContentModal
        open={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
        showHeader={false}
        title="Login Required"
        dialogClassName="max-w-[420px] rounded-[24px] bg-white"
        bodyClassName="px-6 py-8 md:px-8"
        bodyScrollable={false}
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-[28px] font-semibold leading-tight text-[#17191C]">
            Log in to claim this gift
          </h2>
          <p className="mt-3 max-w-[300px] text-[15px] leading-6 text-[#716F6F]">
            You have to be logged in before you can claim a gift from this
            wishlist.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3">
            <a
              href={`/start?redirect=${encodeURIComponent(`/wishlist/${wishListEventId}`)}`}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#3300C9] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#2D00B4]"
            >
              Log In
            </a>
            <button
              type="button"
              onClick={() => setIsLoginRequiredModalOpen(false)}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-[#3300C9] bg-white px-6 text-[15px] font-semibold text-[#3300C9] transition-colors hover:bg-[#F7F3FF]"
            >
              Cancel
            </button>
          </div>
        </div>
      </ContentModal>
    </main>
  );
}

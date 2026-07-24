"use client";

import { type StaticImageData } from "next/image";
import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  GiftIcon,
  SparklesIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import ContentModal from "@/components/ui/modal";
import WishlistGiftItemCard, {
  type WishlistGiftCardItem,
} from "@/components/WishlistGiftItemCard";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import featureImg5 from "@/assets/icons/featureImg5.svg";
import featureImg6 from "@/assets/icons/featureImg6.svg";
import { useClaimGiftMutation } from "@/features/gifts/hooks/useClaimGiftMutation";
import { useAuthStore } from "@/stores/auth-store";
import type {
  PublicWishlistEventRecord,
  WishlistEventGiftRow,
} from "@/features/wishlist-events/types";
import { YULE_SIGN_IN_URL } from "@/lib/external-links";

type WishListPublicScreenProps = {
  wishListEventId: string;
  wishlistEvent: PublicWishlistEventRecord | null;
  wishlistGifts: WishlistEventGiftRow[];
  wishlistGiftTotal: number;
  claimedGiftIds: string[];
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
    return "Public";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getAvailabilityStyles(
  availability: WishlistGiftCardItem["availability"],
) {
  if (availability === "Claimed") {
    return "bg-[#FDE9E7] text-[#D94C3F]";
  }

  return "bg-[#E8F8EF] text-[#1E9E5A]";
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
    <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-5 shadow-[0_8px_22px_rgba(39,16,99,0.05)] sm:p-6">
      <div className="flex items-center gap-2 text-[#3300C9]">
        {icon}
        <span className="text-[12px] font-medium tracking-[0.02em] text-[#7D7D7D]">
          {label}
        </span>
      </div>
      <p className="mt-4 text-[20px] font-semibold text-[#17191C] sm:text-[22px]">
        {value}
      </p>
    </div>
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to claim this gift right now.",
      );
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <main className="overflow-x-hidden bg-white">
      <section className="flex w-full  flex-col gap-10  pb-12 pt-8 sm:pb-14 md:gap-12 md:pb-16 md:pt-10  lg:pt-12 ">
        <div className="flex flex-col gap-8 md:gap-10">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
              Shared Wishlist
            </p>
            <h1 className="mt-3 break-words font-poppins text-[30px] leading-[1.14] font-semibold tracking-[0.02em] text-[#17191C] sm:text-[36px] md:text-[42px] lg:text-[48px]">
              {resolvedTitle}
            </h1>
            <p className="mt-3 max-w-[760px] text-[15px] leading-[1.75] text-[#716F6F] sm:text-[16px]">
              {resolvedDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 ">
            <div className="rounded-[24px] border border-[#EEEAF7] bg-[#FBFAFF] p-5 shadow-[0_8px_22px_rgba(39,16,99,0.04)] sm:p-6 lg:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="break-words font-poppins text-[24px] font-semibold text-[#17191C] sm:text-[28px]">
                    {resolvedTitle}
                  </p>
                  <p className="mt-2 text-[15px] leading-7 text-[#716F6F]">
                    A shared celebration wishlist
                  </p>
                  {/* <p className="mt-2 break-all text-[11px] text-[#9A98A3]">
                    Wishlist ID: {wishListEventId}
                  </p> */}
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* <span className="inline-flex rounded-full bg-[#EEE6FF] px-3 py-1.5 text-[11px] font-semibold text-[#3300C9]">
                    {resolvedVisibility}
                  </span> */}
                  <span className="inline-flex rounded-full bg-[#E8F8EF] px-3 py-1.5 text-[11px] font-semibold text-[#1E9E5A]">
                    {resolvedAllowMultiple}
                  </span>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                {/* <WishListStat
                  icon={
                    <ShieldCheckIcon className="size-4" strokeWidth={1.8} />
                  }
                  label="Access"
                  value={resolvedVisibility}
                /> */}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
                Wish List Items
              </p>
              <h2 className="mt-3 max-w-[760px] font-poppins text-[28px] leading-[1.16] font-semibold text-[#17191C] sm:text-[34px] md:text-[40px]">
                A curated list of things they would genuinely enjoy.
              </h2>

              <p className="mt-3 max-w-[820px] text-[15px] leading-[1.8] text-[#716F6F] sm:text-[16px]">
                Browse the gifts already selected for this wishlist and get a
                clearer sense of what would make the celebration feel
                thoughtful.
              </p>
            </div>
          </div>

          {mappedWishListItems.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {mappedWishListItems.map((item) => (
                  <WishlistGiftItemCard
                    key={item.id}
                    item={item}
                    checked={selectedGiftIds.includes(item.id)}
                    viewHref={`/wishlist/${encodeURIComponent(wishListEventId)}/gift/${encodeURIComponent(item.productId)}`}
                    onCheckedChange={(checked) =>
                      toggleGiftSelection(item.id, checked)
                    }
                  />
                ))}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleClaimGift}
                  disabled={!selectedGiftIds.length || isClaiming}
                  className="min-w-[120px] h-[41px] px-8 py-3 text-[14px] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isClaiming ? "Claiming..." : "Claim Gift"}
                </Button>
              </div>
            </>
          ) : (
            <EmptyWishlistState />
          )}
        </div>
      </section>

      {/* <PromoCta
        title="Need more ideas before you pick a gift?"
        description="Explore more gift inspiration across categories, budgets, and styles, then come back to this wishlist with a clearer idea."
        ctaLabel="Explore Gift Ideas"
        ctaHref="/gifts"
      /> */}

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
            <Button
              href={`${YULE_SIGN_IN_URL}&redirectUrl=${encodeURIComponent(`/wishlist/${wishListEventId}`)}`}
              className="h-[52px] w-full px-6 text-[15px]"
            >
              Log In
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => setIsLoginRequiredModalOpen(false)}
              className="h-[52px] w-full px-6 text-[15px] hover:bg-[#F7F3FF]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </ContentModal>
    </main>
  );
}

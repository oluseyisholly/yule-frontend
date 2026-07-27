"use client";

import { type StaticImageData } from "next/image";
import { type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon, GiftIcon, SparklesIcon } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
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
import { useClaimHangoutEventMutation } from "@/features/hangout-events/hooks/useClaimHangoutEventMutation";
import { useAuthStore } from "@/stores/auth-store";
import type {
  PublicWishlistEventRecord,
  WishlistNestedHangoutEventRecord,
  WishlistEventGiftRow,
} from "@/features/wishlist-events/types";
import { YULE_SIGN_IN_URL } from "@/lib/external-links";

type WishListPublicScreenProps = {
  wishListEventId: string;
  wishlistEvent: PublicWishlistEventRecord | null;
  wishlistHangout: WishlistNestedHangoutEventRecord | null;
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

function getParticipantDisplayName(
  participant?: {
    eventContact?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    } | null;
    user?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    } | null;
  } | null,
) {
  const actor = participant?.eventContact ?? participant?.user;

  if (!actor) {
    return "";
  }

  return (
    `${actor.firstName ?? ""} ${actor.lastName ?? ""}`.trim() ||
    actor.email ||
    ""
  );
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
  wishlistHangout,
  wishlistGifts,
  wishlistGiftTotal,
  claimedGiftIds,
}: WishListPublicScreenProps) {
  const router = useRouter();
  const claimGiftMutation = useClaimGiftMutation();
  const claimHangoutEventMutation = useClaimHangoutEventMutation();
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] =
    useState(false);
  const [isClaimGiftConfirmationOpen, setIsClaimGiftConfirmationOpen] =
    useState(false);
  const [isClaimHangoutConfirmationOpen, setIsClaimHangoutConfirmationOpen] =
    useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<"gifts" | "hangout">(
    "gifts",
  );
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
  const publicHangout = wishlistHangout ?? wishlistEvent?.hangoutEvent ?? null;
  const publicHangoutCreator =
    publicHangout?.event?.participants?.find(
      (participant) => participant.role?.trim().toLowerCase() === "creator",
    ) ?? publicHangout?.event?.participants?.[0] ?? null;
  const publicHangoutParticipantName =
    getParticipantDisplayName(publicHangoutCreator) ||
    getParticipantDisplayName(publicHangout?.payerParticipant) ||
    "";
  const allowMultipleItems = wishlistEvent?.allowMultipleItems ?? true;
  const claimedGiftIdsSet = new Set(claimedGiftIds);
  const mappedWishListItems = wishlistGifts.map((gift, index) =>
    mapGiftToWishListItem(gift, index, claimedGiftIdsSet),
  );
  const hasGiftsSection = mappedWishListItems.length > 0;
  const hasHangoutSection = Boolean(publicHangout);
  const isHangoutAlreadyClaimed = Boolean(publicHangout?.payerParticipant);
  const shouldShowContentTabs = hasGiftsSection && hasHangoutSection;
  const shouldShowGiftSection = shouldShowContentTabs
    ? activeContentTab === "gifts"
    : hasGiftsSection;
  const shouldShowHangoutSection = shouldShowContentTabs
    ? activeContentTab === "hangout"
    : hasHangoutSection && !hasGiftsSection;

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

  const handleClaimHangout = async () => {
    if (!publicHangout?.id) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    if (isHangoutAlreadyClaimed) {
      toast.error("This hangout has already been claimed.");
      return;
    }

    if (!isAuthenticated) {
      setIsLoginRequiredModalOpen(true);
      return;
    }

    try {
      const response = await claimHangoutEventMutation.mutateAsync(
        publicHangout.id,
      );
      toast.success(response.message || "Hangout claimed successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to claim this hangout right now.",
      );
    }
  };

  return (
    <main className="overflow-x-hidden bg-white">
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8 lg:pb-14">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
              Shared Wishlist
            </p>
            <h1 className="mt-2 break-words font-poppins text-[28px] leading-[1.12] font-semibold tracking-[0.02em] text-[#17191C] sm:text-[34px] md:text-[38px] lg:text-[42px]">
              {resolvedTitle}
            </h1>
            <p className="mt-3 max-w-[720px] text-[14px] leading-[1.75] text-[#716F6F] sm:text-[15px]">
              {resolvedDescription}
            </p>
          </div>

          <div className="rounded-[22px] border border-[#EEEAF7] bg-[#FBFAFF] p-5 shadow-[0_8px_22px_rgba(39,16,99,0.04)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex rounded-full bg-[#E8F8EF] px-3 py-1.5 text-[11px] font-semibold text-[#1E9E5A]">
                  {resolvedAllowMultiple}
                </span>
                <span className="inline-flex rounded-full bg-[#EEE6FF] px-3 py-1.5 text-[11px] font-semibold text-[#3300C9]">
                  {resolvedVisibility}
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <WishListStat
                icon={<CalendarDaysIcon className="size-4" strokeWidth={1.8} />}
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
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {shouldShowContentTabs ? (
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white px-4 pt-4 sm:px-5">
              <div className="flex items-center gap-5 border-b border-[#F1EDF8]">
                <button
                  type="button"
                  onClick={() => setActiveContentTab("gifts")}
                  className={
                    activeContentTab === "gifts"
                      ? "border-b-2 border-[#3300C9] pb-3 text-sm font-medium text-[#3300C9]"
                      : "border-b-2 border-transparent pb-3 text-sm font-medium text-[#9A97A5] transition-colors hover:text-[#5A4CB8]"
                  }
                >
                  Gift Items
                </button>
                <button
                  type="button"
                  onClick={() => setActiveContentTab("hangout")}
                  className={
                    activeContentTab === "hangout"
                      ? "border-b-2 border-[#3300C9] pb-3 text-sm font-medium text-[#3300C9]"
                      : "border-b-2 border-transparent pb-3 text-sm font-medium text-[#9A97A5] transition-colors hover:text-[#5A4CB8]"
                  }
                >
                  Hangout
                </button>
              </div>
            </div>
          ) : null}

          {shouldShowHangoutSection ? (
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
                    Hangout
                  </p>
                  <h2 className="mt-2 text-[22px] font-semibold text-[#17191C] sm:text-[26px]">
                    Hangout in this wishlist
                  </h2>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsClaimHangoutConfirmationOpen(true)}
                  disabled={
                    isHangoutAlreadyClaimed ||
                    claimHangoutEventMutation.isPending
                  }
                  className="h-[41px] min-w-[130px] px-6 py-3 text-[14px] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {claimHangoutEventMutation.isPending
                    ? "Claiming..."
                    : isHangoutAlreadyClaimed
                      ? "Claimed"
                      : "Claim Hangout"}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[760px] rounded-[16px] border border-[#F0EEFF] bg-white px-4 py-4">
                  <div className="grid grid-cols-[92px_minmax(220px,1.4fr)_minmax(120px,0.8fr)] items-center gap-4">
                    <div className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-[12px] bg-[#F3EFFB]">
                      {publicHangout?.imageUrl ? (
                        <img
                          src={publicHangout.imageUrl}
                          alt={
                            publicHangout.eventCenterName || "Wishlist hangout"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="px-3 text-center text-xs font-semibold text-[#3300C9]">
                          Hangout
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#1E1E1E]">
                        {publicHangout?.eventCenterName || "Selected Hangout"}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-[#7D7D7D]">
                        {publicHangout?.location || "Location unavailable"}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[#9A97A5]">
                        Amount
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-[#1E1E1E]">
                        {formatCurrency(publicHangout?.amount)}
                      </p>
                    </div>
                  </div>

                  {publicHangoutParticipantName ? (
                    <div className="mt-4 rounded-[12px] bg-[#F8F5FF] px-3 py-2">
                      <p className="text-[10px] font-medium uppercase tracking-[0.02em] text-[#9A97A5]">
                        Participant
                      </p>
                      <p className="mt-1 text-[13px] font-semibold text-[#1E1E1E]">
                        {publicHangoutParticipantName}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {shouldShowGiftSection ? (
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#3300C9]">
                    Gift Items
                  </p>
                  <h2 className="mt-2 text-[22px] font-semibold text-[#17191C] sm:text-[26px]">
                    Thoughtful picks for this wishlist
                  </h2>
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
                        onCheckedChange={(checked) =>
                          toggleGiftSelection(item.id, checked)
                        }
                      />
                    ))}
                  </div>

                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={() => setIsClaimGiftConfirmationOpen(true)}
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
          ) : null}
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
            Log in to claim this wishlist
          </h2>
          <p className="mt-3 max-w-[300px] text-[15px] leading-6 text-[#716F6F]">
            You have to be logged in before you can claim a gift or hangout from
            this wishlist.
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

      <ConfirmationModal
        open={isClaimGiftConfirmationOpen}
        onClose={() => setIsClaimGiftConfirmationOpen(false)}
        onConfirm={async () => {
          await handleClaimGift();
          setIsClaimGiftConfirmationOpen(false);
        }}
        action="save"
        title="Claim Wishlist Gift"
        description="Are you sure you want to claim the selected wishlist gift item(s)?"
        confirmText="Yes, Claim"
        isLoading={isClaiming}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isClaimHangoutConfirmationOpen}
        onClose={() => setIsClaimHangoutConfirmationOpen(false)}
        onConfirm={async () => {
          await handleClaimHangout();
          setIsClaimHangoutConfirmationOpen(false);
        }}
        action="save"
        title="Claim Hangout"
        description="Are you sure you want to claim this wishlist hangout?"
        confirmText="Yes, Claim"
        isLoading={claimHangoutEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </main>
  );
}

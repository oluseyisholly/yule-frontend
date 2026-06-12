"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import BackLink, { BackIcon } from "@/components/BackLink";
import Button from "@/components/Button";
import DetailHeader from "@/components/DetailHeader";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import facebookIcon from "@/assets/icons/facebook.svg";
import instagramIcon from "@/assets/icons/instagram.svg";
import verifiedIcon from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";
import twitterIcon from "@/assets/icons/twitter.svg";
import { canManageDrawNameEvent } from "@/features/draw-name-events/access";
import { useDrawNameEventQuery } from "@/features/draw-name-events/hooks/useDrawNameEventQuery";
import type {
  ParticipantGiftRow,
  ParticipantGiftSelection,
} from "@/features/gifts/types";
import { useParticipantGiftsQuery } from "@/features/gifts/hooks/useParticipantGiftsQuery";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useGiftRecipientQuery } from "@/features/participants/hooks/useGiftRecipientQuery";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type DrawNameGiftViewScreenProps = {
  drawNameEventId: string;
  participantId: string | null;
  giftId?: string | null;
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

function formatCurrency(value?: string | number | null) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "₦0";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatCompactPrice(amount?: string | number | null) {
  const numericValue =
    typeof amount === "number" ? amount : Number(amount?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function toInitials(firstName?: string | null, lastName?: string | null) {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase();

  return initials || "NA";
}

function toStatus(status?: string | null, isCompleted?: boolean): DetailStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "draft") {
    return "Draft";
  }

  if (normalizedStatus === "ongoing" || isCompleted) {
    return "Ongoing";
  }

  return "In Progress";
}

function formatConditionLabel(condition?: string | null) {
  if (!condition?.trim()) {
    return "Available";
  }

  return condition
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatGiftLocation(gift: ParticipantGiftSelection) {
  const city = gift.locationCity?.trim();
  const state = gift.locationState?.trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "Location unavailable";
}

function getGiftImage(gift: ParticipantGiftSelection) {
  if (Array.isArray(gift.images) && gift.images.length > 0) {
    return gift.images[0];
  }

  return gift.imageUrl?.trim() || "";
}

function getGiftImages(gift: ParticipantGiftSelection) {
  if (Array.isArray(gift.images) && gift.images.length > 0) {
    return gift.images.filter((image) => Boolean(image?.trim()));
  }

  const primaryImage = gift.imageUrl?.trim();

  return primaryImage ? [primaryImage] : [];
}

function getGiftKey(gift: ParticipantGiftSelection, index: number) {
  return gift.participantGiftId || gift.id || `${gift.title || "gift"}-${index}`;
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

function mapParticipantGiftRowToSelection(
  gift: ParticipantGiftRow,
): ParticipantGiftSelection {
  return {
    id: gift.id,
    participantGiftId: gift.participantGiftId,
    title: gift.title,
    description: gift.description,
    amount: gift.amount,
    currency: gift.currency,
    imageUrl: gift.imageUrl,
    categorySlug: gift.categorySlug,
    subCategorySlug: gift.subCategorySlug,
    condition: gift.condition,
    locationState: gift.locationState,
    locationCity: gift.locationCity,
    sellerId: gift.sellerId,
    productSlug: gift.productSlug,
    slug: gift.productSlug,
  };
}

function mapParticipantGiftSelectionToMarketplaceProduct(
  gift: ParticipantGiftSelection,
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

function formatMarketplaceProductLocation(product?: MarketplaceProduct | null) {
  const city = product?.location?.city?.trim();
  const state = product?.location?.state?.trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || "Location unavailable";
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <p className="text-[14px] font-medium text-[#434343]">{label}</p>
      <p className="mt-5 text-[16px] font-semibold text-[#1E1E1E]">{value}</p>
    </div>
  );
}

function GiftSelectionCard({
  gift,
  onViewGift,
}: {
  gift: ParticipantGiftSelection;
  onViewGift: () => void;
}) {
  const primaryImage = getGiftImage(gift);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onViewGift}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewGift();
        }
      }}
      className="flex cursor-pointer flex-col gap-2.5 rounded-[12px] border border-gray-100 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_6px_18px_rgba(25,18,57,0.08)]"
    >
      <div className="relative h-[86px] w-full overflow-hidden rounded-[6px] bg-gray-100">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={gift.title || "Selected gift"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-[#8A8892]">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-nunito text-[16px] font-semibold text-[#4E4C4D]">
            {gift.title?.trim() || "Selected gift"}
          </h3>
          <Image
            src={verifiedIcon}
            alt="Product badge"
            className="h-[18px] w-[18px]"
          />
        </div>

        <span className="inline-flex w-fit items-center rounded-[10px] border border-[#FF6600] bg-[#FF66001A] px-2 py-0.5 text-[10px] font-medium text-[#FF6600]">
          {formatConditionLabel(gift.condition)}
        </span>

        <p className="line-clamp-2 text-[9px] leading-snug text-neutral">
          {gift.description?.trim() ||
            "No description available for this product yet."}
        </p>

        <div className="flex items-center gap-1 text-[9px] text-[#97989A]">
          <Image
            src={locationIcon}
            alt="Location"
            className="h-[7.5px] w-[5.5px]"
          />
          <span className="truncate">{formatGiftLocation(gift)}</span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="whitespace-nowrap text-[12px] font-semibold leading-[117%] tracking-[0.05em] text-darker">
            ₦{formatCompactPrice(gift.amount)}
          </span>
          <Button
            type="button"
            variant="filled"
            className="h-auto rounded-[16px] px-7 py-2.5 text-[10px] font-medium"
            onClick={(event) => {
              event.stopPropagation();
              onViewGift();
            }}
          >
            View Gift
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DrawNameGiftViewScreen({
  drawNameEventId,
  participantId,
  giftId = null,
}: DrawNameGiftViewScreenProps) {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const [selectedGiftImageIndex, setSelectedGiftImageIndex] = useState(0);
  const { data, isLoading, isError, refetch } = useDrawNameEventQuery(
    drawNameEventId,
  );
  const drawNameEvent = data?.data ?? null;
  const eventId = drawNameEvent?.event.id ?? null;
  const canManageDetail = useMemo(
    () =>
      canManageDrawNameEvent(drawNameEvent, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, drawNameEvent],
  );
  const {
    data: giftRecipientResponse,
    isLoading: isGiftRecipientLoading,
    isFetching: isGiftRecipientFetching,
    isError: isGiftRecipientError,
    refetch: refetchGiftRecipient,
  } = useGiftRecipientQuery(eventId, {
    enabled: Boolean(eventId),
  });

  const requestedParticipantId = participantId?.trim() || null;
  const requestedGiftId = giftId?.trim() || null;
  const isGiftDetailRoute = Boolean(requestedGiftId);
  const pairedParticipantId = giftRecipientResponse?.data?.id?.trim() || null;
  const canViewRequestedParticipantGifts =
    Boolean(requestedParticipantId) &&
    (canManageDetail ||
      (Boolean(pairedParticipantId) &&
        requestedParticipantId === pairedParticipantId));

  const {
    data: participantGiftsResponse,
    isLoading: isParticipantGiftsLoading,
    isFetching: isParticipantGiftsFetching,
    isError: isParticipantGiftsError,
    refetch: refetchParticipantGifts,
  } = useParticipantGiftsQuery(
    canViewRequestedParticipantGifts ? requestedParticipantId : null,
    canViewRequestedParticipantGifts ? eventId : null,
    {
      page: 1,
      per_page: 20,
    },
    {
      enabled:
        Boolean(eventId) &&
        Boolean(requestedParticipantId) &&
        canViewRequestedParticipantGifts,
    },
  );

  const detail = useMemo(() => {
    if (!drawNameEvent) {
      return null;
    }

    const createdBy = drawNameEvent.event.createdBy
      ? `${drawNameEvent.event.createdBy.firstName} ${drawNameEvent.event.createdBy.lastName}`.trim()
      : "Unknown";

    return {
      title: drawNameEvent.event.title || "Untitled Event",
      createdBy: createdBy || "Unknown",
      createdAt: formatMonthYear(drawNameEvent.createdAt),
      status: toStatus(drawNameEvent.event.status, drawNameEvent.isDrawCompleted),
      eventDate: formatDate(drawNameEvent.event.eventDate),
      drawDate: formatDate(drawNameEvent.drawDate),
      budget: formatCurrency(
        drawNameEvent.budget || drawNameEvent.maximumSpend,
      ),
      totalParticipants: String(drawNameEvent.event.participants?.length ?? 0),
    };
  }, [drawNameEvent]);

  const participantGiftSelections = useMemo(() => {
    const giftRows = participantGiftsResponse?.data?.data ?? [];
    return giftRows.map(mapParticipantGiftRowToSelection);
  }, [participantGiftsResponse?.data?.data]);
  const requestedGiftSelection = useMemo(() => {
    if (!requestedGiftId) {
      return null;
    }

    return (
      participantGiftSelections.find((gift) => {
        const participantGiftId = gift.participantGiftId?.trim() || null;
        const giftRowId = gift.id?.trim() || null;

        return requestedGiftId === participantGiftId || requestedGiftId === giftRowId;
      }) ?? null
    );
  }, [participantGiftSelections, requestedGiftId]);
  const requestedMarketplaceProductId =
    requestedGiftSelection?.participantGiftId?.trim() ||
    (requestedGiftSelection ? null : requestedGiftId);
  const {
    data: marketplaceProduct,
    isLoading: isMarketplaceProductLoading,
    isFetching: isMarketplaceProductFetching,
    isError: isMarketplaceProductError,
    refetch: refetchMarketplaceProduct,
  } = useMarketplaceProductQuery(requestedMarketplaceProductId, {
    enabled:
      isGiftDetailRoute &&
      canViewRequestedParticipantGifts &&
      Boolean(requestedMarketplaceProductId),
  });
  const selectedGiftDetailProduct = useMemo(() => {
    if (marketplaceProduct) {
      return marketplaceProduct;
    }

    if (requestedGiftSelection) {
      return mapParticipantGiftSelectionToMarketplaceProduct(requestedGiftSelection);
    }

    return null;
  }, [marketplaceProduct, requestedGiftSelection]);

  useEffect(() => {
    setSelectedGiftImageIndex(0);
  }, [requestedParticipantId]);

  useEffect(() => {
    setSelectedGiftImageIndex(0);
  }, [requestedGiftId]);

  const selectedGiftImages = useMemo(
    () =>
      selectedGiftDetailProduct?.images?.filter((image) => Boolean(image?.trim())) ??
      [],
    [selectedGiftDetailProduct],
  );

  const activeSelectedGiftImage =
    selectedGiftImages[selectedGiftImageIndex] || selectedGiftImages[0] || "";

  if (!requestedParticipantId) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}`}
          label={isGiftDetailRoute ? "View Gift" : "View Gifts"}
        />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this participant&apos;s gift selections.
        </div>
      </div>
    );
  }

  if (isLoading || !detail) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}`}
          label={isGiftDetailRoute ? "View Gift" : "View Gifts"}
        />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Loading gift selections...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}`}
          label={isGiftDetailRoute ? "View Gift" : "View Gifts"}
        />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this gift view right now.
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

  const requiresPairingAccessCheck = !canManageDetail;
  const showGiftSelectionsRetry =
    isParticipantGiftsError ||
    (requiresPairingAccessCheck && isGiftRecipientError);
  const showGiftSelectionsLoading =
    isParticipantGiftsLoading ||
    isParticipantGiftsFetching ||
    (requiresPairingAccessCheck &&
      (isGiftRecipientLoading || isGiftRecipientFetching));
  const showGiftDetailRetry =
    (Boolean(requestedMarketplaceProductId) && isMarketplaceProductError) ||
    (requiresPairingAccessCheck && isGiftRecipientError);
  const showGiftDetailLoading =
    isMarketplaceProductLoading ||
    isMarketplaceProductFetching ||
    isParticipantGiftsLoading ||
    isParticipantGiftsFetching ||
    (requiresPairingAccessCheck &&
      (isGiftRecipientLoading || isGiftRecipientFetching));

  return (
    <div className="space-y-5">
      <BackLink
        href={
          isGiftDetailRoute
            ? `/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`
            : `/dashboard/draw-names/${drawNameEventId}`
        }
        label={isGiftDetailRoute ? "View Gift" : "View Gifts"}
      />

      <section className="rounded-[24px] bg-[#F6F7FB] ">
        <div className="flex flex-col gap-5">
          <DetailHeader
            title={detail.title}
            subtitle={`Created by ${detail.createdBy}`}
            meta={
              <>
                <span className="inline-flex items-center gap-2 text-xs text-[#7D7D7D]">
                  <CustomCalendarIcon className="size-4" />
                  {detail.createdAt}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                    detail.status === "Completed" &&
                      "bg-[#E6F7EC] text-[#1FAB54]",
                    detail.status === "Draft" &&
                      "bg-[#FFF1DD] text-[#C28A00]",
                    detail.status === "Ongoing" &&
                      "bg-[#EFE6FD] text-[#3300C9]",
                    detail.status === "In Progress" &&
                      "bg-[#EFE6FD] text-[#3300C9]",
                  )}
                >
                  {detail.status}
                </span>
              </>
            }
            avatar={{
              initials: detail.title.slice(0, 2).toUpperCase(),
              color: "#3300C9",
              bg: "#EFE6FD",
            }}
            actions={
              <Button
                type="button"
                variant="outlined"
                className="border-[#F6C8C8] bg-white px-5 text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F]"
                onClick={() => {
                  toast("Deleting selected gifts is not available yet.");
                }}
              >
                <Trash2Icon className="size-4" />
                Delete
              </Button>
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStat label="Gift Exchange Date" value={detail.eventDate} />
            <SummaryStat label="Budget" value={detail.budget} />
            <SummaryStat label="Draw Date" value={detail.drawDate} />
            <SummaryStat
              label="Total Participants"
              value={detail.totalParticipants}
            />
          </div>

          {!isGiftDetailRoute && showGiftSelectionsRetry ? (
            <div className="rounded-[16px] border border-[#F2D8D8] bg-white px-5 py-4">
              <p className="text-sm text-[#8A5A5A]">
                Unable to load gift selections right now.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (requiresPairingAccessCheck) {
                    void refetchGiftRecipient();
                  }
                  void refetchParticipantGifts();
                }}
                className="mt-3 text-sm font-semibold text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry
              </button>
            </div>
          ) : isGiftDetailRoute && showGiftDetailRetry ? (
            <div className="rounded-[16px] border border-[#F2D8D8] bg-white px-5 py-4">
              <p className="text-sm text-[#8A5A5A]">
                Unable to load this gift right now.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (requiresPairingAccessCheck) {
                    void refetchGiftRecipient();
                  }
                  void refetchParticipantGifts();
                  void refetchMarketplaceProduct();
                }}
                className="mt-3 text-sm font-semibold text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry
              </button>
            </div>
          ) : requiresPairingAccessCheck && !pairedParticipantId ? (
            <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
              Pairing details are not available yet.
            </div>
          ) : !canViewRequestedParticipantGifts ? (
            <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
              You can only view gifts for the person you are paired with.
            </div>
          ) : !isGiftDetailRoute && showGiftSelectionsLoading ? (
            <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
              Loading selected gifts...
            </div>
          ) : isGiftDetailRoute && showGiftDetailLoading ? (
            <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
              Loading gift details...
            </div>
          ) : !isGiftDetailRoute && participantGiftSelections.length === 0 ? (
            <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
              This participant has not selected any gifts yet.
            </div>
          ) : isGiftDetailRoute && !selectedGiftDetailProduct ? (
            <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
              Unable to resolve this gift right now.
            </div>
          ) : isGiftDetailRoute && selectedGiftDetailProduct ? (
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedGiftImageIndex(0);
                  router.push(
                    `/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`,
                  );
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                <BackIcon className="size-4" />
                Back to gifts
              </button>

              <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.95fr)]">
                <div>
                  <div className="relative flex h-[320px] items-center justify-center overflow-hidden rounded-[16px] bg-[#F6F7FB]">
                    {activeSelectedGiftImage ? (
                      <img
                        src={activeSelectedGiftImage}
                        alt={selectedGiftDetailProduct.title || "Selected gift"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#8A8892]">
                        No image available
                      </div>
                    )}
                  </div>

                  {selectedGiftImages.length > 0 ? (
                    <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                      {selectedGiftImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setSelectedGiftImageIndex(index)}
                          className={cn(
                            "relative h-[72px] overflow-hidden rounded-[10px] border bg-[#F6F7FB] transition-colors",
                            index === selectedGiftImageIndex
                              ? "border-[#3300C9]"
                              : "border-[#EEEAF7]",
                          )}
                        >
                          <img
                            src={image}
                            alt={`${selectedGiftDetailProduct.title || "Selected gift"} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-[24px] font-semibold text-[#1E1E1E]">
                          {selectedGiftDetailProduct.title?.trim() || "Selected gift"}
                        </h2>
                        <Image
                          src={verifiedIcon}
                          alt="Product badge"
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-xs text-[#97989A]">
                        <Image
                          src={locationIcon}
                          alt="Location"
                          className="h-[10px] w-[8px]"
                        />
                        <span>{formatMarketplaceProductLocation(selectedGiftDetailProduct)}</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-[10px] border border-[#FF6600] bg-[#FF66001A] px-2.5 py-1 text-[10px] font-medium text-[#FF6600]">
                      {formatConditionLabel(selectedGiftDetailProduct.condition)}
                    </span>
                  </div>

                  <p className="text-[28px] font-semibold leading-none tracking-[0.03em] text-[#434343]">
                    ₦{formatCompactPrice(selectedGiftDetailProduct.amount)}
                  </p>

                  <div>
                    <h3 className="text-sm font-semibold text-[#434343]">
                      Description
                    </h3>
                    <p className="mt-2 max-w-[520px] text-sm leading-6 text-[#6F6C75]">
                      {selectedGiftDetailProduct.description?.trim() ||
                        "No description available for this product yet."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      type="button"
                      className="px-6 py-3 text-xs rounded-[16px] font-medium"
                      onClick={() => {
                        toast("Vendor messaging is not available yet.");
                      }}
                    >
                      Message Vendor
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      className="border-[#F6C8C8] rounded-[16px] bg-white px-6 py-3 text-xs font-medium text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F]"
                      onClick={() => {
                        toast("Reporting gifts is not available yet.");
                      }}
                    >
                      Report Item
                    </Button>
                  </div>

                  <div className="pt-1">
                    <p className="text-sm font-medium text-[#6F6C75]">
                      Share product:
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      {[facebookIcon, instagramIcon, twitterIcon].map(
                        (icon, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              toast("Product sharing is not available yet.");
                            }}
                            className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                          >
                            <Image
                              src={icon}
                              alt="Share product"
                              className="h-4 w-4"
                            />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {participantGiftSelections.map((gift, index) => (
                  <GiftSelectionCard
                    key={getGiftKey(gift, index)}
                    gift={gift}
                    onViewGift={() => {
                      const resolvedGiftId =
                        gift.participantGiftId?.trim() || gift.id?.trim();

                      if (!resolvedGiftId) {
                        toast.error("Unable to open this gift right now.");
                        return;
                      }

                      router.push(
                        `/dashboard/draw-names/${drawNameEventId}/gift/${encodeURIComponent(
                          resolvedGiftId,
                        )}?participantId=${requestedParticipantId}`,
                      );
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import BackLink, { BackIcon } from "@/components/BackLink";
import Button from "@/components/Button";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import DetailHeader from "@/components/DetailHeader";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import verifiedIcon from "@/assets/icons/verified.svg";
import locationIcon from "@/assets/icons/location.svg";
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
  return (
    gift.participantGiftId || gift.id || `${gift.title || "gift"}-${index}`
  );
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
    <div className="rounded-[12px] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] sm:px-5">
      <p className="text-[14px] font-medium text-[#434343]">{label}</p>
      <p className="mt-4 text-[16px] font-semibold text-[#1E1E1E] sm:mt-5">
        {value}
      </p>
    </div>
  );
}

function ShareSquareIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.75 15.75H20.25V3.75H8.25V8.25"
        stroke="#5F6C72"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 8.25H3.75V20.25H15.75V8.25Z"
        stroke="#5F6C72"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareFacebookIcon() {
  return (
    <svg
      width="6"
      height="13"
      viewBox="0 0 6 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.91912 12.4915V6.31096H5.66259L5.8937 4.13569H3.91912L3.92205 3.04686C3.92205 2.4795 3.97598 2.17564 4.79141 2.17564H5.88147V0H4.13761C2.04292 0 1.30576 1.05519 1.30576 2.82995V4.13586H0V6.31133H1.30576V12.4039C1.81445 12.5052 2.34036 12.5587 2.87882 12.5587C3.22668 12.5587 3.57416 12.5363 3.91912 12.4915Z"
        fill="white"
      />
    </svg>
  );
}

function ShareTwitterIcon() {
  return (
    <svg
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.03184 13.0112C11.0699 13.0112 14.3718 8.00592 14.3718 3.66552C14.3718 3.52337 14.3689 3.38187 14.3625 3.24096C15.005 2.77578 15.5595 2.19982 16 1.54007C15.4118 1.80173 14.7789 1.97783 14.1149 2.05723C14.7926 1.6506 15.3129 1.00729 15.5584 0.24048C14.914 0.622975 14.2091 0.892613 13.4739 1.03777C12.8749 0.399314 12.0221 0 11.0778 0C9.26494 0 7.79489 1.47098 7.79489 3.28419C7.79489 3.54197 7.82374 3.79264 7.88006 4.03315C5.15177 3.89578 2.73252 2.58874 1.11343 0.601313C0.821818 1.10258 0.668434 1.67228 0.668943 2.25224C0.668943 3.39183 1.24846 4.39782 2.12976 4.98638C1.60846 4.97045 1.0986 4.82956 0.643057 4.57555C0.642569 4.58934 0.642569 4.60278 0.642569 4.61751C0.642569 6.20823 1.77408 7.53638 3.27613 7.83733C2.99402 7.9142 2.70292 7.95307 2.41054 7.9529C2.19938 7.9529 1.99359 7.93212 1.79359 7.8937C2.21151 9.19879 3.42335 10.1485 4.86013 10.1751C3.73659 11.0562 2.32127 11.581 0.783024 11.581C0.521349 11.5813 0.259888 11.5661 0 11.5355C1.45281 12.4673 3.17789 13.011 5.032 13.011"
        fill="#5F6C72"
      />
    </svg>
  );
}

function SharePinterestIcon() {
  return (
    <svg
      width="13"
      height="16"
      viewBox="0 0 13 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.42347 0.0535087C2.76461 0.350326 0.115129 2.50147 0.00577548 5.57431C-0.0629612 7.4505 0.469747 8.85804 2.25534 9.25327C3.03019 7.88635 2.00539 7.58485 1.84604 6.59598C1.19148 2.54365 6.52013 -0.219876 9.30865 2.60926C11.238 4.56825 9.9679 10.5952 6.85601 9.96876C3.87533 9.37044 8.3151 4.57294 5.93587 3.63093C4.00187 2.86546 2.97395 5.97266 3.89096 7.51611C3.35356 10.1703 2.19597 12.6714 2.66463 16.0004C4.18465 14.8975 4.69705 12.7854 5.11728 10.5827C5.8812 11.0467 6.28893 11.5294 7.26374 11.6044C10.8584 11.8824 12.8658 8.01602 12.3752 4.44952C11.9394 1.28764 8.78376 -0.321418 5.42347 0.0535087Z"
        fill="#5F6C72"
      />
    </svg>
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
  const { data, isLoading, isError, refetch } =
    useDrawNameEventQuery(drawNameEventId);
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
      status: toStatus(
        drawNameEvent.event.status,
        drawNameEvent.isDrawCompleted,
      ),
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

        return (
          requestedGiftId === participantGiftId || requestedGiftId === giftRowId
        );
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
      return mapParticipantGiftSelectionToMarketplaceProduct(
        requestedGiftSelection,
      );
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
      selectedGiftDetailProduct?.images?.filter((image) =>
        Boolean(image?.trim()),
      ) ?? [],
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

  if (isGiftDetailRoute && showGiftDetailRetry) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`}
          label="View Gift"
        />
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
      </div>
    );
  }

  if (isGiftDetailRoute && requiresPairingAccessCheck && !pairedParticipantId) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`}
          label="View Gift"
        />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          Pairing details are not available yet.
        </div>
      </div>
    );
  }

  if (isGiftDetailRoute && !canViewRequestedParticipantGifts) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}`}
          label="View Gift"
        />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          You can only view gifts for the person you are paired with.
        </div>
      </div>
    );
  }

  if (isGiftDetailRoute && showGiftDetailLoading) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`}
          label="View Gift"
        />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          Loading gift details...
        </div>
      </div>
    );
  }

  if (isGiftDetailRoute && !selectedGiftDetailProduct) {
    return (
      <div className="space-y-5">
        <BackLink
          href={`/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`}
          label="View Gift"
        />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this gift right now.
        </div>
      </div>
    );
  }

  if (isGiftDetailRoute && selectedGiftDetailProduct) {
    return (
      <EventGiftDetailView
        backHref={`/dashboard/draw-names/${drawNameEventId}/gift?participantId=${requestedParticipantId}`}
        backLabel="View Gift"
        eventTitle={detail.title}
        createdBy={detail.createdBy}
        createdAt={detail.createdAt}
        status={detail.status}
        avatarInitials={detail.title.slice(0, 2).toUpperCase()}
        summaryItems={[
          { label: "Gift Exchange Date", value: detail.eventDate },
          { label: "Maximum Spend", value: detail.budget },
          { label: "Draw Date", value: detail.drawDate },
          { label: "Total Participants", value: detail.totalParticipants },
        ]}
        product={selectedGiftDetailProduct}
        onDelete={() => {
          toast("Deleting selected gifts is not available yet.");
        }}
        onMessageVendor={() => {
          toast("Vendor messaging is not available yet.");
        }}
        onReportItem={() => {
          toast("Reporting gifts is not available yet.");
        }}
        onShareProduct={() => {
          toast("Product sharing is not available yet.");
        }}
      />
    );
  }

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

      <section className="rounded-[20px] bg-[#F6F7FB] sm:rounded-[24px]">
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
                    detail.status === "Draft" && "bg-[#FFF1DD] text-[#C28A00]",
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
            <SummaryStat label="Maximum Spend" value={detail.budget} />
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
            <div className="p-4 sm:p-5">
              {/* <button
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
              </button> */}

              <div className="mt-5 grid gap-6 lg:gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.95fr)]">
                <div className="rounded-[16px] bg-white p-4 sm:p-6 lg:p-10">
                  <div className="relative flex h-[240px] items-center justify-center overflow-hidden rounded-[16px] bg-[#F6F7FB] sm:h-[320px]">
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
                            "relative h-[72px] overflow-hidden rounded-[10px] bg-[#F6F7FB] transition-colors",
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
                        <h2 className="truncate text-[15px] font-semibold text-[#4E4C4D]">
                          {selectedGiftDetailProduct.title?.trim() ||
                            "Selected gift"}
                        </h2>
                        <Image
                          src={verifiedIcon}
                          alt="Product badge"
                          className="h-5 w-5"
                        />
                      </div>

                      <div className="mt-2 flex items-center gap-1 text-[10px] text-[#97989A]">
                        <Image
                          src={locationIcon}
                          alt="Location"
                          className="h-[10px] w-[8px]"
                        />
                        <span>
                          {formatMarketplaceProductLocation(
                            selectedGiftDetailProduct,
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-[10px] border border-[#FF6600] bg-[#FF66001A] px-2.5 py-1 text-[10px] font-medium text-[#FF6600]">
                      {formatConditionLabel(
                        selectedGiftDetailProduct.condition,
                      )}
                    </span>
                  </div>

                  <p className="text-[24px] font-semibold leading-none tracking-[0.03em] text-[#434343] sm:text-[28px]">
                    ₦{formatCompactPrice(selectedGiftDetailProduct.amount)}
                  </p>

                  <div>
                    <h3 className="text-sm font-semibold text-[#434343]">
                      Description
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6F6C75]">
                      {selectedGiftDetailProduct.description?.trim() ||
                        "No description available for this product yet."}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                      type="button"
                      className="w-full rounded-[15px] px-6 py-3 text-xs font-medium sm:w-auto"
                      onClick={() => {
                        toast("Vendor messaging is not available yet.");
                      }}
                    >
                      Message Vendor
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      className="w-full rounded-[15px] border-[#F6C8C8] bg-white px-6 py-3 text-xs font-medium text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F] sm:w-auto"
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
                      <button
                        type="button"
                        onClick={() => {
                          toast("Product sharing is not available yet.");
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                        aria-label="Share product via square icon"
                      >
                        <ShareSquareIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toast("Product sharing is not available yet.");
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-full bg-[#1877F2] transition-colors hover:bg-[#166FE5]"
                        aria-label="Share product on Facebook"
                      >
                        <ShareFacebookIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toast("Product sharing is not available yet.");
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                        aria-label="Share product on X"
                      >
                        <ShareTwitterIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toast("Product sharing is not available yet.");
                        }}
                        className="inline-flex size-8 items-center justify-center rounded-full bg-[#F6F7FB] transition-colors hover:bg-[#EEEAF7]"
                        aria-label="Share product on Pinterest"
                      >
                        <SharePinterestIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

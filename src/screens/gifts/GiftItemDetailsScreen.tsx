"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import UserAvatar from "@/components/UserAvatar";
import { EventGiftDetailSkeleton } from "@/components/ui/context-skeletons";
import { useGiftQuery } from "@/features/gifts/hooks/useGiftQuery";
import { useEventGivenGroupedGiftQuery } from "@/features/gifts/hooks/useEventGivenGroupedGiftQuery";
import { useGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useGivenGroupedGiftsQuery";
import { useReceivedGiftsQuery } from "@/features/gifts/hooks/useReceivedGiftsQuery";
import { useUpdateGiftFulfillmentMutation } from "@/features/gifts/hooks/useUpdateGiftFulfillmentMutation";
import type {
  GivenGroupedGift,
  ReceivedGift,
  GiftDetailResponse,
} from "@/features/gifts/types";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import StatusPill from "@/components/ui/status-pill";

type GiftItemDetailsScreenProps = {
  giftItemId: string;
  tab?: "sent" | "received";
};

type DetailStatus =
  | "Completed"
  | "Draft"
  | "Ongoing"
  | "In Progress"
  | "Fulfilled"
  | "Not Fulfilled";

type GiftPerson = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profileUrl?: string | null;
};

type GiftPersonStatus = {
  id?: string | null;
  recipientParticipantId?: string | null;
  isFulfilled?: boolean | null;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(
  value?: string | null,
  isFulfilled?: boolean | null,
): DetailStatus {
  const status = value?.trim().toLowerCase();

  if (status === "completed" || isFulfilled) {
    return "Completed";
  }

  if (status === "draft") {
    return "Draft";
  }

  if (status === "ongoing") {
    return "Ongoing";
  }

  return "In Progress";
}

function toPersonName(person?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) {
  if (!person) {
    return "";
  }

  return (
    `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
    person.email?.trim() ||
    ""
  );
}

function formatPeopleLabel(
  people?: GiftPerson[] | null,
) {
  if (!people || people.length === 0) {
    return "-";
  }

  const visibleNames = people
    .slice(0, 2)
    .map((person) => toPersonName(person))
    .filter(Boolean);

  const overflowCount = Math.max(people.length - visibleNames.length, 0);

  return `${visibleNames.join(", ")}${overflowCount > 0 ? ` +${overflowCount}` : ""}`;
}

function getPersonInitials(person?: GiftPerson | null) {
  if (!person) {
    return "YU";
  }

  const firstInitial = person.firstName?.trim().charAt(0) ?? "";
  const lastInitial = person.lastName?.trim().charAt(0) ?? "";

  return `${firstInitial}${lastInitial}`.trim().toUpperCase() || "YU";
}

function SentGiftRecipients({
  people,
  recipientCount,
  statuses,
}: {
  people: GiftPerson[];
  recipientCount: number;
  statuses?: GiftPersonStatus[] | null;
}) {
  const visiblePeople = people.slice(0, 4);
  const overflowCount = Math.max(recipientCount - visiblePeople.length, 0);

  return (
    <div className="rounded-[16px] border border-[#EEEAF7] bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#434343]">Recipients</p>
          <p className="mt-1 text-xs text-[#7D7D7D]">
            {recipientCount > 0
              ? `${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`
              : "No recipients yet"}
          </p>
        </div>

        {visiblePeople.length > 0 ? (
          <div className="flex items-center">
            {visiblePeople.map((person, index) => (
              <UserAvatar
                key={`${person.email || person.firstName || "recipient"}-${index}`}
                name={`${person.firstName ?? ""} ${person.lastName ?? ""}`.trim()}
                initials={getPersonInitials(person)}
                imageUrl={person.profileUrl ?? null}
                className={cn(
                  "size-9 border-2 border-white shadow-[0_4px_14px_rgba(51,0,201,0.12)]",
                  index > 0 && "-ml-3",
                )}
                title={person.email ?? person.firstName ?? "Recipient"}
              />
            ))}

            {overflowCount > 0 ? (
              <span className="-ml-3 inline-flex size-9 items-center justify-center rounded-full border-2 border-white bg-[#EFE6FD] text-[11px] font-semibold text-[#3300C9] shadow-[0_4px_14px_rgba(51,0,201,0.12)]">
                +{overflowCount}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {visiblePeople.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {visiblePeople.map((person, index) => {
            const status = statuses?.[index]?.isFulfilled
              ? "fulfilled"
              : "not_fulfilled";

            return (
              <span
                key={`${person.email || person.firstName || "recipient"}-label`}
                className="inline-flex items-center gap-2 rounded-full bg-[#F6F7FB] px-3 py-1.5 text-xs font-medium text-[#434343]"
              >
                {toPersonName(person)}
                <StatusPill status={status} compact className="min-w-0 px-2 py-0.5" />
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
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

function buildMarketplaceProduct(
  source:
    | GiftDetailResponse["data"]
    | GivenGroupedGift
    | ReceivedGift
    | null
    | undefined,
): MarketplaceProduct | null {
  if (!source) {
    return null;
  }

  return {
    _id:
      source.participantGiftId?.trim() ||
      source.id?.trim() ||
      "selected-gift",
    sellerId: source.sellerId?.trim() || undefined,
    categorySlug: source.categorySlug?.trim() || undefined,
    subCategorySlug: source.subCategorySlug?.trim() || undefined,
    title: source.title?.trim() || "Selected gift",
    description: source.description?.trim() || "",
    amount: Number(source.amount ?? 0),
    images: source.imageUrl?.trim() ? [source.imageUrl.trim()] : [],
    location: {
      state: source.locationState?.trim() || undefined,
      city: source.locationCity?.trim() || undefined,
    },
    condition: toMarketplaceCondition(source.condition),
    slug: source.productSlug?.trim() || undefined,
  };
}

function getGiftCreatedBy(
  tab: "sent" | "received",
  authUser: ReturnType<typeof useAuthStore.getState>["user"],
  receivedGift?: ReceivedGift | null,
) {
  if (tab === "received") {
    const contact = receivedGift?.giverParticipant?.eventContact;
    const fullName = toPersonName(contact ?? undefined);

    return fullName || contact?.email?.trim() || "Unknown";
  }

  const fullName = `${authUser?.firstName ?? ""} ${authUser?.lastName ?? ""}`.trim();
  return fullName || "You";
}

export default function GiftItemDetailsScreen({
  giftItemId,
  tab = "received",
}: GiftItemDetailsScreenProps) {
  const authUser = useAuthStore((state) => state.user);
  const backHref = `/dashboard/gifts?tab=${tab}`;
  const giftId = giftItemId.trim();
  const updateGiftFulfillmentMutation = useUpdateGiftFulfillmentMutation();
  const [isFulfillmentConfirmOpen, setIsFulfillmentConfirmOpen] =
    useState(false);

  const {
    data: giftResponse,
    isLoading: isGiftLoading,
    isFetching: isGiftFetching,
    isError: isGiftError,
    refetch: refetchGift,
  } = useGiftQuery(giftId, {
    enabled: tab === "received" && Boolean(giftId),
  });

  const gift = giftResponse?.data ?? null;
  const shouldLoadReceivedGifts = tab === "received";
  const shouldLoadSentGifts = tab === "sent";

  const {
    data: receivedGiftsResponse,
    isLoading: isReceivedGiftsLoading,
    isFetching: isReceivedGiftsFetching,
    isError: isReceivedGiftsError,
    refetch: refetchReceivedGifts,
  } = useReceivedGiftsQuery(
    { page: 1, per_page: 100 },
    {
      enabled: shouldLoadReceivedGifts && Boolean(giftId),
    },
  );

  const {
    data: sentGiftsResponse,
    isLoading: isSentGiftsLoading,
    isFetching: isSentGiftsFetching,
    isError: isSentGiftsError,
    refetch: refetchSentGifts,
  } = useGivenGroupedGiftsQuery(
    { page: 1, per_page: 100 },
    {
      enabled: shouldLoadSentGifts && Boolean(giftId),
    },
  );

  const resolvedReceivedGift = useMemo(() => {
    if (!shouldLoadReceivedGifts) {
      return null;
    }

    const giftRows = receivedGiftsResponse?.data?.data ?? [];

    return (
      giftRows.find((row) => {
        const rowId = row.id?.trim() || null;
        const participantGiftId = row.participantGiftId?.trim() || null;

        return rowId === giftId || participantGiftId === giftId;
      }) ?? null
    );
  }, [giftId, receivedGiftsResponse?.data?.data, shouldLoadReceivedGifts]);

  const resolvedSentGift = useMemo(() => {
    if (!shouldLoadSentGifts) {
      return null;
    }

    const giftRows = sentGiftsResponse?.data?.data ?? [];

    return (
      giftRows.find((row) => {
        const rowId = row.id?.trim() || null;
        const participantGiftId = row.participantGiftId?.trim() || null;

        return rowId === giftId || participantGiftId === giftId;
      }) ?? null
    );
  }, [giftId, sentGiftsResponse?.data?.data, shouldLoadSentGifts]);

  const sentGiftEventId = resolvedSentGift?.event?.id?.trim() || null;
  const sentGiftParticipantGiftId =
    resolvedSentGift?.participantGiftId?.trim() || null;

  const {
    data: sentGiftDetailResponse,
    isLoading: isSentGiftDetailLoading,
    isFetching: isSentGiftDetailFetching,
    isError: isSentGiftDetailError,
    refetch: refetchSentGiftDetail,
  } = useEventGivenGroupedGiftQuery(
    sentGiftEventId,
    sentGiftParticipantGiftId,
    {
      enabled:
        shouldLoadSentGifts &&
        Boolean(sentGiftEventId) &&
        Boolean(sentGiftParticipantGiftId),
    },
  );

  const sentGiftDetail = sentGiftDetailResponse?.data ?? null;

  const selectedMarketplaceProductId =
    (tab === "received" ? gift?.participantGiftId?.trim() : null) ||
    resolvedReceivedGift?.participantGiftId?.trim() ||
    sentGiftDetail?.participantGiftId?.trim() ||
    resolvedSentGift?.participantGiftId?.trim() ||
    null;

  const {
    data: marketplaceProduct,
    isLoading: isMarketplaceProductLoading,
    isFetching: isMarketplaceProductFetching,
    isError: isMarketplaceProductError,
    refetch: refetchMarketplaceProduct,
  } = useMarketplaceProductQuery(selectedMarketplaceProductId, {
    enabled: Boolean(selectedMarketplaceProductId),
  });

  const selectedProduct = useMemo(() => {
    if (marketplaceProduct) {
      return marketplaceProduct;
    }

    return (
      (tab === "received" ? buildMarketplaceProduct(gift) : null) ??
      buildMarketplaceProduct(resolvedReceivedGift) ??
      buildMarketplaceProduct(sentGiftDetail) ??
      buildMarketplaceProduct(resolvedSentGift)
    );
  }, [
    gift,
    marketplaceProduct,
    resolvedReceivedGift,
    resolvedSentGift,
    sentGiftDetail,
  ]);

  const detail = useMemo(() => {
    const event =
      gift?.event ??
      resolvedReceivedGift?.event ??
      sentGiftDetail?.event ??
      resolvedSentGift?.event;

    if (!event && !gift) {
      return null;
    }

    const title =
      event?.title?.trim() ||
      gift?.title?.trim() ||
      selectedProduct?.title ||
      "Gift";
    const createdBy = getGiftCreatedBy(
      tab,
      authUser,
      resolvedReceivedGift ?? null,
    );
    const createdAt = formatDate(
      gift?.createdAt ??
        resolvedReceivedGift?.createdAt ??
        sentGiftDetail?.event?.eventDate ??
        null,
    );
    const fulfillmentState =
      gift?.isFulfilled ??
      sentGiftDetail?.isFulfilled ??
      resolvedSentGift?.isFulfilled ??
      false;
    const status = fulfillmentState ? "Fulfilled" : "Not Fulfilled";

    return {
      title,
      createdBy,
      createdAt,
      status,
      isFulfilled: fulfillmentState,
      eventDate: formatDate(event?.eventDate),
      summaryOne:
        tab === "received"
          ? `From ${createdBy}`
          : formatPeopleLabel(sentGiftDetail?.people ?? resolvedSentGift?.people ?? null),
      summaryTwo:
        tab === "received"
          ? gift?.id?.trim() || giftId
          : sentGiftDetail?.participantGiftId?.trim() ||
            resolvedSentGift?.participantGiftId?.trim() ||
            sentGiftDetail?.event?.id?.trim() ||
            giftId,
      summaryThree: selectedProduct?.condition
        ? selectedProduct.condition
            .split("_")
            .join(" ")
            .replace(/\b\w/g, (chunk) => chunk.toUpperCase())
        : "-",
      summaryFour: formatDate(
        tab === "received"
          ? gift?.updatedAt ?? gift?.createdAt ?? null
          : sentGiftDetail?.event?.eventDate ?? resolvedSentGift?.event?.eventDate ?? null,
      ),
    };
  }, [
    authUser,
    gift,
    giftId,
    resolvedReceivedGift,
    resolvedSentGift,
    sentGiftDetail,
    selectedProduct?.condition,
    tab,
  ]);

  const sentGiftPeople = useMemo(
    () => (sentGiftDetail?.people ?? resolvedSentGift?.people ?? []) as GiftPerson[],
    [resolvedSentGift?.people, sentGiftDetail?.people],
  );
  const sentGiftStatuses = useMemo(
    () =>
      (sentGiftDetail?.giftStatuses ?? resolvedSentGift?.giftStatuses ?? []) as
        | GiftPersonStatus[]
        | null,
    [resolvedSentGift?.giftStatuses, sentGiftDetail?.giftStatuses],
  );
  const sentGiftRecipientCount = useMemo(
    () =>
      sentGiftDetail?.recipientCount ??
      resolvedSentGift?.recipientCount ??
      (sentGiftPeople.length > 0 ? sentGiftPeople.length : 0),
    [
      resolvedSentGift?.recipientCount,
      sentGiftDetail?.recipientCount,
      sentGiftPeople.length,
    ],
  );

  const receivedGiftStatusActionLabel = gift?.isFulfilled
    ? "Mark as Not Fulfilled"
    : "Mark as Fulfilled";

  const handleToggleReceivedGiftFulfillment = () => {
    setIsFulfillmentConfirmOpen(true);
  };

  const handleConfirmToggleGiftFulfillment = async () => {
    if (!gift) {
      return;
    }

    try {
      await updateGiftFulfillmentMutation.mutateAsync({
        giftId: gift.id,
        payload: {
          isFulfilled: !gift.isFulfilled,
        },
      });

      toast.success(
        gift.isFulfilled
          ? "Gift marked as not fulfilled."
          : "Gift marked as fulfilled.",
      );
      setIsFulfillmentConfirmOpen(false);
      void refetchGift();

      if (shouldLoadReceivedGifts) {
        void refetchReceivedGifts();
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this gift right now.",
      );
    }
  };

  const isLoading =
    isGiftLoading ||
    isGiftFetching ||
    isMarketplaceProductLoading ||
    isMarketplaceProductFetching ||
    (shouldLoadReceivedGifts &&
      (isReceivedGiftsLoading || isReceivedGiftsFetching)) ||
    (shouldLoadSentGifts &&
      (isSentGiftsLoading ||
        isSentGiftsFetching ||
        isSentGiftDetailLoading ||
        isSentGiftDetailFetching));

  const isError =
    isGiftError ||
    isMarketplaceProductError ||
    (shouldLoadReceivedGifts && isReceivedGiftsError) ||
    (shouldLoadSentGifts &&
      (isSentGiftsError || isSentGiftDetailError));

  if (isLoading) {
    return <EventGiftDetailSkeleton backHref={backHref} backLabel="Back" />;
  }

  if (isError) {
    return (
      <div className="space-y-5">
        <BackLink href={backHref} label="Back" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Unable to load this gift right now.
          <button
            type="button"
            onClick={() => {
              void refetchGift();

              if (shouldLoadReceivedGifts) {
                void refetchReceivedGifts();
              }

              if (shouldLoadSentGifts) {
                void refetchSentGifts();
                void refetchSentGiftDetail();
              }

              void refetchMarketplaceProduct();
            }}
            className="mt-4 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!detail || !selectedProduct) {
    return (
      <div className="space-y-5">
        <BackLink href={backHref} label="Back" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this gift right now.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <EventGiftDetailView
        backHref={backHref}
        backLabel="Back"
        eventTitle={detail.title}
        createdBy={detail.createdBy}
        createdAt={detail.createdAt}
        status={formatStatus(detail.status, detail.isFulfilled)}
        avatarInitials={detail.title.slice(0, 2).toUpperCase()}
        summaryItems={[]}
        showSummaryItems={false}
        product={selectedProduct}
        hideDeleteAction
        onDelete={() => {
          toast("Deleting this gift is not available yet.");
        }}
        onStatusAction={
          tab === "received" ? handleToggleReceivedGiftFulfillment : undefined
        }
        statusActionLabel={
          tab === "received"
            ? receivedGiftStatusActionLabel
            : undefined
        }
        statusActionDisabled={updateGiftFulfillmentMutation.isPending}
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

      <ConfirmationModal
        open={isFulfillmentConfirmOpen}
        onClose={() => setIsFulfillmentConfirmOpen(false)}
        onConfirm={handleConfirmToggleGiftFulfillment}
        action="save"
      title={
          gift?.isFulfilled
            ? "Mark Gift as Not Fulfilled"
            : "Mark Gift as Fulfilled"
        }
        description={
          gift?.isFulfilled
            ? "Are you sure you want to mark this gift as not fulfilled?"
            : "Are you sure you want to mark this gift as fulfilled?"
        }
        confirmText={
          gift?.isFulfilled ? "Mark as Not Fulfilled" : "Mark as Fulfilled"
        }
        isLoading={updateGiftFulfillmentMutation.isPending}
      />

      {tab === "sent" ? (
        <SentGiftRecipients
          people={sentGiftPeople}
          recipientCount={sentGiftRecipientCount}
          statuses={sentGiftStatuses}
        />
      ) : null}
    </div>
  );
}

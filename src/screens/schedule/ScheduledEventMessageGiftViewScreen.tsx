"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import { EventGiftDetailSkeleton } from "@/components/ui/context-skeletons";
import { useEventGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useEventGivenGroupedGiftsQuery";
import type { GivenGroupedGift } from "@/features/gifts/types";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useScheduledEventMessageQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessageQuery";

type ScheduledEventMessageGiftViewScreenProps = {
  scheduledEventMessageId: string;
  giftId: string;
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

function formatStatus(value?: string | null): DetailStatus {
  const status = value?.trim().toLowerCase();

  if (status === "completed") {
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

function formatCreatedBy(record?: {
  participant?: {
    eventContact?: {
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
    } | null;
  } | null;
}) {
  const contact = record?.participant?.eventContact;
  const fullName = `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim();

  return fullName || contact?.email?.trim() || "Yule";
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

function formatAssignedPeople(gift?: GivenGroupedGift | null) {
  const people = gift?.people ?? [];

  if (people.length === 0) {
    const count = gift?.recipientCount ?? 0;

    if (count > 0) {
      return `${count} recipient${count === 1 ? "" : "s"}`;
    }

    return "-";
  }

  const visibleNames = people
    .slice(0, 2)
    .map((person) => toPersonName(person))
    .filter(Boolean);
  const overflowCount = Math.max(people.length - visibleNames.length, 0);

  return `${visibleNames.join(", ")}${overflowCount > 0 ? ` +${overflowCount}` : ""}`;
}

function getGiftLookupIds(gift: GivenGroupedGift) {
  return [
    gift.id?.trim(),
    gift.participantGiftId?.trim(),
    gift.productSlug?.trim(),
  ].filter((value): value is string => Boolean(value));
}

function buildProductFromGift(gift: GivenGroupedGift): MarketplaceProduct {
  return {
    _id: gift.participantGiftId?.trim() || gift.id?.trim() || "selected-gift",
    sellerId: gift.sellerId?.trim() || undefined,
    categorySlug: gift.categorySlug?.trim() || undefined,
    subCategorySlug: gift.subCategorySlug?.trim() || undefined,
    title: gift.title?.trim() || "Selected gift",
    description: gift.description?.trim() || undefined,
    amount: Number(gift.amount ?? 0),
    images: gift.imageUrl?.trim() ? [gift.imageUrl.trim()] : [],
    location: {
      state: gift.locationState?.trim() || undefined,
      city: gift.locationCity?.trim() || undefined,
    },
    condition: gift.condition?.trim() as MarketplaceProduct["condition"],
    slug: gift.productSlug?.trim() || undefined,
  };
}

export default function ScheduledEventMessageGiftViewScreen({
  scheduledEventMessageId,
  giftId,
}: ScheduledEventMessageGiftViewScreenProps) {
  const decodedGiftId = decodeURIComponent(giftId);
  const {
    data: scheduledMessageResponse,
    isLoading: isScheduledMessageLoading,
    isError: isScheduledMessageError,
    refetch: refetchScheduledMessage,
  } = useScheduledEventMessageQuery(scheduledEventMessageId);
  const record = scheduledMessageResponse?.data ?? null;
  const {
    data: eventGiftsResponse,
    isLoading: isEventGiftsLoading,
    isError: isEventGiftsError,
    refetch: refetchEventGifts,
  } = useEventGivenGroupedGiftsQuery(
    record?.eventId ?? null,
    {
      page: 1,
      per_page: 100,
    },
    {
      enabled: Boolean(record?.eventId),
    },
  );
  const giftRow = useMemo(
    () =>
      (eventGiftsResponse?.data.data ?? []).find((gift) => {
        const ids = getGiftLookupIds(gift);

        return ids.some((id) => id === decodedGiftId);
      }) ?? null,
    [decodedGiftId, eventGiftsResponse?.data.data],
  );
  const productId = giftRow?.participantGiftId?.trim() || decodedGiftId;
  const {
    data: marketplaceProduct,
    isLoading: isMarketplaceProductLoading,
    isError: isMarketplaceProductError,
  } = useMarketplaceProductQuery(productId, {
    enabled: Boolean(productId),
  });
  const selectedGiftDetailProduct = useMemo(() => {
    if (marketplaceProduct && giftRow) {
      return {
        ...marketplaceProduct,
        title: marketplaceProduct.title || giftRow.title || "Selected gift",
        description:
          marketplaceProduct.description ||
          giftRow.description?.trim() ||
          undefined,
        amount:
          Number.isFinite(marketplaceProduct.amount) && marketplaceProduct.amount > 0
            ? marketplaceProduct.amount
            : Number(giftRow.amount ?? 0),
        images:
          marketplaceProduct.images?.length > 0
            ? marketplaceProduct.images
            : giftRow.imageUrl?.trim()
              ? [giftRow.imageUrl.trim()]
              : [],
        condition:
          marketplaceProduct.condition ||
          (giftRow.condition?.trim() as MarketplaceProduct["condition"]),
        location: {
          state:
            marketplaceProduct.location?.state ||
            giftRow.locationState?.trim() ||
            undefined,
          city:
            marketplaceProduct.location?.city ||
            giftRow.locationCity?.trim() ||
            undefined,
          lga: marketplaceProduct.location?.lga,
        },
      };
    }

    if (marketplaceProduct) {
      return marketplaceProduct;
    }

    if (giftRow) {
      return buildProductFromGift(giftRow);
    }

    return null;
  }, [giftRow, marketplaceProduct]);

  const backHref = `/dashboard/schedule/${scheduledEventMessageId}`;

  if (isScheduledMessageLoading || isEventGiftsLoading) {
    return <EventGiftDetailSkeleton backHref={backHref} backLabel="View Gift" />;
  }

  if (isScheduledMessageError || !record) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/schedule" label="View Gift" />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this scheduled message right now.
          <button
            type="button"
            onClick={() => refetchScheduledMessage()}
            className="mt-3 block w-full text-sm font-medium text-[#3300C9]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isEventGiftsError && isMarketplaceProductError && !giftRow) {
    return (
      <div className="space-y-5">
        <BackLink href={backHref} label="View Gift" />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          Unable to load this gift right now.
          <button
            type="button"
            onClick={() => refetchEventGifts()}
            className="mt-3 block w-full text-sm font-medium text-[#3300C9]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isMarketplaceProductLoading && !selectedGiftDetailProduct) {
    return <EventGiftDetailSkeleton backHref={backHref} backLabel="View Gift" />;
  }

  if (!selectedGiftDetailProduct) {
    return (
      <div className="space-y-5">
        <BackLink href={backHref} label="View Gift" />
        <div className="rounded-[16px] border border-[#E6E0F7] bg-white px-5 py-10 text-center text-sm text-[#7D7D7D]">
          Unable to resolve this gift right now.
        </div>
      </div>
    );
  }

  return (
    <EventGiftDetailView
      backHref={backHref}
      backLabel="View Gift"
      eventTitle={record.event?.title || record.subject || "Scheduled Message"}
      createdBy={formatCreatedBy(record)}
      createdAt={formatDate(record.createdAt)}
      status={formatStatus(record.event?.status)}
      avatarInitials={(record.event?.title || record.subject || "SM")
        .slice(0, 2)
        .toUpperCase()}
      summaryItems={[
        { label: "Event Date", value: formatDate(record.event?.eventDate) },
        { label: "Scheduled Date", value: formatDate(record.scheduledAt) },
        { label: "Assigned To", value: formatAssignedPeople(giftRow) },
        { label: "Message Status", value: formatStatus(record.status) },
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

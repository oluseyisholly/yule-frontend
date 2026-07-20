"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Clock3Icon,
  Link2Icon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import Button from "@/components/Button";
import { BackIcon } from "@/components/BackLink";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import UserAvatar from "@/components/UserAvatar";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import { Calendar } from "@/components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { canManageHangoutEvent } from "@/features/hangout-events/access";
import { useHangoutEventQuery } from "@/features/hangout-events/hooks/useHangoutEventQuery";
import { useUpdateHangoutEventFulfillmentMutation } from "@/features/hangout-events/hooks/useUpdateHangoutEventFulfillmentMutation";
import { useUpdateHangoutEventMutation } from "@/features/hangout-events/hooks/useUpdateHangoutEventMutation";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useAuthStore } from "@/stores/auth-store";

type HangoutDetailsScreenProps = {
  hangoutId: string;
};

type HangoutParticipantBubble = {
  id: string;
  initials: string;
  bg: string;
  color: string;
  name: string;
  profileUrl?: string | null;
};

type HangoutParticipantDetail = HangoutParticipantBubble & {
  email: string;
  role: string;
};

const CalendarComponent = Calendar as React.ComponentType<
  Record<string, unknown>
>;

function ReadOnlyBookingField({
  label,
  value,
  icon,
  trailingIcon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7D7D7D]">
        {label}
      </p>
      <div
        aria-disabled="true"
        className="flex h-[44px] w-full cursor-not-allowed items-center justify-between rounded-[14px] border border-[#ECE8F7] bg-[#F8F8FB] px-3 text-left text-[12px] text-[#7D7D7D] opacity-80"
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ? (
            <span className="shrink-0 text-[#9A97A5]">{icon}</span>
          ) : null}
          <span className="truncate">{value}</span>
        </span>
        {trailingIcon ? (
          <span className="shrink-0 text-[#9A97A5]">{trailingIcon}</span>
        ) : null}
      </div>
    </div>
  );
}

function formatDateButtonLabel(value: string) {
  if (!value) {
    return "Choose date";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Choose date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function parseDateInputValue(value: string) {
  if (!value) {
    return undefined;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  parsedDate.setHours(0, 0, 0, 0);

  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
}

function BookingDateField({
  label,
  value,
  onChange,
  open,
  onOpenChange,
  minDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  minDate?: Date;
}) {
  const selectedDate = useMemo(() => parseDateInputValue(value), [value]);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    selectedDate ?? minDate ?? new Date(),
  );

  useEffect(() => {
    setCalendarMonth(selectedDate ?? minDate ?? new Date());
  }, [selectedDate, minDate]);

  const handleDateSelect = (date?: Date) => {
    if (!date) {
      return;
    }

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    onChange(`${year}-${month}-${day}`);
    onOpenChange(false);
  };

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7D7D7D]">
        {label}
      </p>

      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-[44px] w-full items-center justify-between rounded-[14px] border border-[#ECE8F7] bg-white px-3 text-left text-[12px] text-[#7D7D7D] transition-colors hover:border-[#D8CEF7]"
            aria-expanded={open}
            aria-haspopup="dialog"
          >
            <span className="flex min-w-0 items-center gap-2">
              <CalendarDaysIcon
                className="size-3.5 shrink-0 text-[#9A97A5]"
                strokeWidth={1.8}
              />
              <span className="truncate text-[#434343]">
                {formatDateButtonLabel(value)}
              </span>
            </span>
            <CustomCalendarIcon className="size-4 shrink-0 text-[#54545C]" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          className="z-[130] w-auto overflow-visible rounded-[20px] border-none bg-white p-0 shadow-[0_20px_48px_rgba(26,19,61,0.12)]"
        >
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            onSelect={handleDateSelect}
            disabled={minDate ? (date: Date) => date < minDate : undefined}
            initialFocus
            className="shadow-none"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ParticipantStack({
  participants,
}: {
  participants: HangoutParticipantBubble[];
}) {
  const visibleParticipants = participants.slice(0, 3);
  const overflowCount = Math.max(
    participants.length - visibleParticipants.length,
    0,
  );

  return (
    <div className="flex items-center -space-x-2">
      {visibleParticipants.map((participant) => (
        <UserAvatar
          key={participant.id}
          name={participant.name}
          initials={participant.initials}
          imageUrl={participant.profileUrl}
          bgColor={participant.bg}
          textColor={participant.color}
          className="size-7 border border-white text-[9px] font-semibold"
          title={participant.name}
        />
      ))}

      {overflowCount > 0 ? (
        <span className="flex size-7 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}

function ParticipantDetailRow({
  participant,
}: {
  participant: HangoutParticipantDetail;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar
          name={participant.name}
          initials={participant.initials}
          imageUrl={participant.profileUrl}
          bgColor={participant.bg}
          textColor={participant.color}
          className="size-11 shrink-0 text-sm font-semibold"
          title={participant.name}
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#1E1E1E]">
            {participant.name}
          </p>
          <p className="truncate text-xs text-[#7D7D7D]">
            {participant.email || "No email added"}
          </p>
        </div>
      </div>

      <span className="shrink-0 rounded-full bg-[#F3EFFB] px-3 py-1 text-[11px] font-medium capitalize text-[#3300C9]">
        {participant.role}
      </span>
    </div>
  );
}

function HangoutDetailsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="inline-flex items-center gap-2">
        <Skeleton className="size-9 rounded-full" />
        <Skeleton className="h-5 w-12" />
      </div>

      <section className="rounded-[28px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.85fr)]">
            <Skeleton className="h-[220px] rounded-[18px] sm:h-[250px] lg:h-[228px]" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
                  key={`hangout-gallery-skeleton-${index}`}
                  className="h-[92px] rounded-[12px] sm:h-[108px]"
                />
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_520px]">
            <div>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-3 h-10 w-40" />
              <Skeleton className="mt-4 h-4 w-52" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-4 w-full max-w-[760px]" />
                <Skeleton className="h-4 w-full max-w-[700px]" />
                <Skeleton className="h-4 w-full max-w-[620px]" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`hangout-participant-bubble-${index}`}
                    className="size-7 rounded-full"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-[20px] border border-[#EEEAF7] bg-[#FCFBFF] p-4">
              <Skeleton className="h-8 w-36" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Skeleton className="h-[68px] rounded-[14px]" />
                <Skeleton className="h-[68px] rounded-[14px]" />
                <Skeleton className="h-[68px] rounded-[14px]" />
              </div>
              <Skeleton className="h-[44px] w-full rounded-full" />
              <Skeleton className="h-[44px] w-full rounded-[15px]" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5 lg:p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
        <div className="mt-5 rounded-[20px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-1 sm:px-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`hangout-participant-row-${index}`}
              className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-44" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GalleryTile({
  src,
  alt,
  onClick,
  overlayLabel,
}: {
  src: string;
  alt: string;
  onClick: () => void;
  overlayLabel?: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative h-[92px] overflow-hidden rounded-[12px] bg-[#F4F1FF] text-left sm:h-[108px]"
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />

      {overlayLabel ? (
        <span className="absolute inset-0 flex items-center justify-center bg-[#1E1E1E]/55 text-[34px] font-semibold text-white">
          {overlayLabel}
        </span>
      ) : null}
    </button>
  );
}

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

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toIsoDateTime(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00`).toISOString();
}

function formatCurrency(
  amount?: number | string | null,
  currency: string = "NGN",
) {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  const numericAmount =
    typeof amount === "number" ? amount : Number(amount?.toString() ?? 0);

  if (!Number.isFinite(numericAmount)) {
    return "-";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

function formatMarketplaceLocation(product?: MarketplaceProduct | null) {
  const city = product?.location?.city?.trim();
  const state = product?.location?.state?.trim();
  const lga = product?.location?.lga?.trim();

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || lga || state || "";
}

function getContactAvatarStyle(seed: string) {
  const palette = [
    { bg: "#EFE6FD", color: "#3300C9" },
    { bg: "#FCEEC8", color: "#8A5B00" },
    { bg: "#D9F4E2", color: "#1C8C4B" },
    { bg: "#FDE0DE", color: "#C34040" },
    { bg: "#DDF0FF", color: "#0067C9" },
    { bg: "#E8E6F8", color: "#5A4CB8" },
  ] as const;
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return palette[hash % palette.length];
}

function toDisplayName(
  person?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null,
) {
  if (!person) {
    return "";
  }

  const fullName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();

  return fullName || person.email?.trim() || "";
}

export default function HangoutDetailsScreen({
  hangoutId,
}: HangoutDetailsScreenProps) {
  const authUser = useAuthStore((state) => state.user);

  const currentContactId = useAuthStore((state) => state.currentContactId);
  const {
    data: hangout,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useHangoutEventQuery(hangoutId);
  const updateHangoutEventMutation = useUpdateHangoutEventMutation();
  const updateHangoutFulfillmentMutation =
    useUpdateHangoutEventFulfillmentMutation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [editableCheckInDate, setEditableCheckInDate] = useState("");
  const [editableCheckOutDate, setEditableCheckOutDate] = useState("");
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false);
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false);
  const [pendingFulfillmentState, setPendingFulfillmentState] = useState<
    boolean | null
  >(null);
  const marketplaceProductId = hangout?.hangoutEventId?.trim() || null;
  const { data: marketplaceProduct } = useMarketplaceProductQuery(
    marketplaceProductId,
    {
      enabled: Boolean(marketplaceProductId),
    },
  );
  const canManage = useMemo(
    () =>
      canManageHangoutEvent(hangout, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, hangout],
  );

  const participants = useMemo<HangoutParticipantBubble[]>(
    () =>
      (hangout?.event.participants ?? []).reduce<HangoutParticipantBubble[]>(
        (accumulator, participant) => {
          const name = toDisplayName(participant.eventContact);

          if (!name) {
            return accumulator;
          }

          const contactId = participant.eventContact?.id || participant.id;
          const firstInitial =
            participant.eventContact?.firstName?.trim().charAt(0) ?? "";
          const lastInitial =
            participant.eventContact?.lastName?.trim().charAt(0) ?? "";
          const initials =
            `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
            name.slice(0, 2).toUpperCase();
          const { bg, color } = getContactAvatarStyle(contactId);

          accumulator.push({
            id: contactId,
            initials,
            bg,
            color,
            name,
            profileUrl: participant.eventContact?.profileUrl?.trim() || null,
          });

          return accumulator;
        },
        [],
      ),
    [hangout?.event.participants],
  );
  const participantDetails = useMemo<HangoutParticipantDetail[]>(
    () =>
      (hangout?.event.participants ?? []).reduce<HangoutParticipantDetail[]>(
        (accumulator, participant) => {
          const name = toDisplayName(participant.eventContact);

          if (!name) {
            return accumulator;
          }

          const contactId = participant.eventContact?.id || participant.id;
          const firstInitial =
            participant.eventContact?.firstName?.trim().charAt(0) ?? "";
          const lastInitial =
            participant.eventContact?.lastName?.trim().charAt(0) ?? "";
          const initials =
            `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
            name.slice(0, 2).toUpperCase();
          const { bg, color } = getContactAvatarStyle(contactId);

          accumulator.push({
            id: contactId,
            initials,
            bg,
            color,
            name,
            profileUrl: participant.eventContact?.profileUrl?.trim() || null,
            email: participant.eventContact?.email?.trim() || "",
            role: participant.role || "participant",
          });

          return accumulator;
        },
        [],
      ),
    [hangout?.event.participants],
  );

  const gallery = useMemo<string[]>(() => {
    const marketplaceImages =
      marketplaceProduct?.images?.filter((image) => Boolean(image?.trim())) ??
      [];

    if (marketplaceImages.length > 0) {
      return marketplaceImages;
    }

    const primaryImage = hangout?.imageUrl?.trim();

    if (!primaryImage) {
      return [];
    }

    return [primaryImage];
  }, [hangout?.imageUrl, marketplaceProduct?.images]);

  const activeImage = gallery[activeImageIndex] ?? gallery[0] ?? "";
  const sideGallery = gallery.slice(1, 5);
  const overlayCount = Math.max(gallery.length - 5, 0);
  const locationLabel =
    formatMarketplaceLocation(marketplaceProduct) ||
    hangout?.location?.trim() ||
    "Hangout venue";
  const pageTitle = hangout?.event.title?.trim() || "Hangout";
  const amountLabel = formatCurrency(
    marketplaceProduct?.amount ?? hangout?.amount,
    "NGN",
  );
  const description =
    marketplaceProduct?.description?.trim() ||
    hangout?.event.description?.trim() ||
    "Hangout details will be added soon.";
  const guestsLabel =
    typeof hangout?.numberOfGuests === "number" && hangout.numberOfGuests > 0
      ? `${hangout.numberOfGuests} guest${hangout.numberOfGuests > 1 ? "s" : ""}`
      : participants.length > 0
        ? `${participants.length} guest${participants.length > 1 ? "s" : ""}`
        : "Not specified";
  const originalCheckInDate = useMemo(
    () => toDateInputValue(hangout?.checkInDate || hangout?.event.eventDate),
    [hangout?.checkInDate, hangout?.event.eventDate],
  );
  const originalCheckOutDate = useMemo(
    () => toDateInputValue(hangout?.checkOutDate),
    [hangout?.checkOutDate],
  );
  const checkoutMinDate = useMemo(
    () => parseDateInputValue(editableCheckInDate),
    [editableCheckInDate],
  );
  const hasBookingChanges =
    editableCheckInDate !== originalCheckInDate ||
    editableCheckOutDate !== originalCheckOutDate;
  const isHangoutFulfilled =
    typeof hangout?.isFulfilled === "boolean"
      ? hangout.isFulfilled
      : hangout?.event.status?.trim().toLowerCase() === "completed";
  const hangoutRecordId =
    hangout?.id?.trim() || hangout?.hangoutEventId?.trim() || null;
  const fulfillmentActionLabel = isHangoutFulfilled
    ? "Mark as not fulfilled"
    : "Mark as fulfilled";

  useEffect(() => {
    if (activeImageIndex >= gallery.length && gallery.length > 0) {
      setActiveImageIndex(0);
    }
  }, [activeImageIndex, gallery.length]);

  useEffect(() => {
    setEditableCheckInDate(originalCheckInDate);
    setEditableCheckOutDate(originalCheckOutDate);
  }, [originalCheckInDate, originalCheckOutDate]);

  const handleSaveBookingDetails = async () => {
    if (!hangout) {
      return;
    }

    if (!editableCheckInDate) {
      toast.error("Please select a check-in date.");
      return;
    }

    if (editableCheckOutDate && editableCheckOutDate < editableCheckInDate) {
      toast.error("Check-out date cannot be earlier than check-in date.");
      return;
    }

    try {
      await updateHangoutEventMutation.mutateAsync({
        eventId: hangout.eventId,
        payload: {
          checkInDate: toIsoDateTime(editableCheckInDate),
          checkOutDate: toIsoDateTime(editableCheckOutDate),
        },
      });

      toast.success("Hangout details updated.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update hangout details right now.";
      toast.error(message);
    }
  };

  const handleConfirmToggleHangoutFulfillment = async () => {
    if (!hangout || pendingFulfillmentState === null) {
      return;
    }

    if (!hangoutRecordId) {
      toast.error("Unable to resolve this hangout record right now.");
      return;
    }

    try {
      await updateHangoutFulfillmentMutation.mutateAsync({
        hangoutId: hangoutRecordId,
        isFulfilled: pendingFulfillmentState,
      });

      toast.success(
        pendingFulfillmentState
          ? "Hangout marked as fulfilled."
          : "Hangout marked as not fulfilled.",
      );
      setPendingFulfillmentState(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update hangout fulfillment right now.";
      toast.error(message);
    }
  };

  if (isLoading || isFetching) {
    return <HangoutDetailsSkeleton />;
  }

  if (isError || !hangout) {
    return (
      <div className="space-y-5">
        <Link
          href="/dashboard/hangouts"
          className="inline-flex items-center gap-2 text-base font-medium text-[#3300C9] transition-colors hover:text-[#2D00B4]"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#F2ECFF] text-[#3300C9]">
            <BackIcon className="size-4" />
          </span>
          <span>Back</span>
        </Link>

        <section className="rounded-[28px] border border-[#EEEAF7] bg-white p-6 text-center shadow-[0_2px_6px_rgba(33,16,93,0.04)]">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this hangout right now.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-4 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry loading hangout
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/hangouts"
          className="inline-flex items-center gap-2 text-base font-medium text-[#3300C9] transition-colors hover:text-[#2D00B4]"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-[#F2ECFF] text-[#3300C9]">
            <BackIcon className="size-4" />
          </span>
          <span>Back</span>
        </Link>
      </div>

      <section className="rounded-[28px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">
            {pageTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-3 self-start sm:justify-end">
            {canManage ? (
              <Button
                type="button"
                variant="outlined"
                onClick={() => setPendingFulfillmentState(!isHangoutFulfilled)}
                disabled={updateHangoutFulfillmentMutation.isPending}
                className="h-[40px] border-[#D9D0F7] bg-white px-5 text-[#3300C9] hover:bg-[#F6F2FF] hover:text-[#3300C9]"
              >
                {isHangoutFulfilled ? (
                  <Clock3Icon className="size-4" strokeWidth={1.8} />
                ) : (
                  <CheckCircle2Icon className="size-4" strokeWidth={1.8} />
                )}
                {fulfillmentActionLabel}
              </Button>
            ) : null}

            <button
              type="button"
              onClick={() =>
                toast("Sharing hangout details will be connected next.")
              }
              className="inline-flex h-[40px] items-center gap-2 rounded-full border border-[#ECE8F7] bg-white px-4 text-sm text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
            >
              <span>Share</span>
              <Link2Icon className="size-3.5" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-5">
          <div
            className={
              sideGallery.length > 0
                ? "grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.85fr)]"
                : "grid gap-3"
            }
          >
            <button
              type="button"
              onClick={() => setActiveImageIndex(0)}
              className="group relative h-[220px] overflow-hidden rounded-[18px] bg-[#F4F1FF] text-left sm:h-[250px] lg:h-[228px]"
            >
              {activeImage ? (
                <img
                  src={activeImage}
                  alt={pageTitle}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#EFE6FD] text-[44px] font-semibold text-[#3300C9]">
                  {pageTitle.slice(0, 2).toUpperCase()}
                </div>
              )}
            </button>

            {sideGallery.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {sideGallery.map((image, index) => {
                  const computedIndex = index + 1;
                  const isLastTile =
                    index === sideGallery.length - 1 && overlayCount > 0;

                  return (
                    <GalleryTile
                      key={`${hangoutId}-gallery-${computedIndex}`}
                      src={image}
                      alt={`${pageTitle} view ${computedIndex + 1}`}
                      onClick={() => setActiveImageIndex(computedIndex)}
                      overlayLabel={isLastTile ? `+${overlayCount}` : null}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_520px]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#7D7D7D]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E04F4F]" />
                  <span>{locationLabel}</span>
                </span>
              </div>

              <p className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">
                {amountLabel}
              </p>

              <div className="mt-3 flex items-center gap-2 text-sm text-[#7D7D7D]">
                <MapPinIcon
                  className="size-4 text-[#9A97A5]"
                  strokeWidth={1.8}
                />
                <span>{locationLabel}</span>
              </div>

              <p className="mt-4 max-w-[820px] text-[13px] leading-7 text-[#5F5B66]">
                {description}
              </p>

              {participants.length > 0 ? (
                <div className="mt-5 flex items-center gap-3">
                  <UsersIcon
                    className="size-4 text-[#9A97A5]"
                    strokeWidth={1.8}
                  />
                  <ParticipantStack participants={participants} />
                </div>
              ) : null}
            </div>

            <div className="space-y-4 rounded-[20px] border border-[#EEEAF7] bg-[#FCFBFF] p-4">
              <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">
                {amountLabel}
              </p>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {canManage ? (
                  <BookingDateField
                    label="Check-in"
                    value={editableCheckInDate}
                    onChange={setEditableCheckInDate}
                    open={isCheckInCalendarOpen}
                    onOpenChange={setIsCheckInCalendarOpen}
                  />
                ) : (
                  <ReadOnlyBookingField
                    label="Check-in"
                    value={formatDate(
                      hangout.checkInDate || hangout.event.eventDate,
                    )}
                    icon={
                      <CalendarDaysIcon
                        className="size-3.5"
                        strokeWidth={1.8}
                      />
                    }
                  />
                )}
                {canManage ? (
                  <BookingDateField
                    label="Checkout"
                    value={editableCheckOutDate}
                    onChange={setEditableCheckOutDate}
                    open={isCheckOutCalendarOpen}
                    onOpenChange={setIsCheckOutCalendarOpen}
                    minDate={checkoutMinDate}
                  />
                ) : (
                  <ReadOnlyBookingField
                    label="Checkout"
                    value={formatDate(hangout.checkOutDate)}
                    icon={
                      <CalendarDaysIcon
                        className="size-3.5"
                        strokeWidth={1.8}
                      />
                    }
                  />
                )}
                <ReadOnlyBookingField
                  label="Guests"
                  value={guestsLabel}
                  icon={<UsersIcon className="size-3.5" strokeWidth={1.8} />}
                  trailingIcon={
                    <ChevronDownIcon className="size-3.5" strokeWidth={1.8} />
                  }
                />
              </div>

              {canManage && (
                <Button
                  type="button"
                  onClick={
                    canManage
                      ? () => void handleSaveBookingDetails()
                      : () => toast("Reservation flow will be connected next.")
                  }
                  disabled={
                    canManage
                      ? updateHangoutEventMutation.isPending ||
                        !hasBookingChanges
                      : false
                  }
                  className="h-[44px] w-full rounded-full text-sm font-medium"
                >
                  {canManage
                    ? updateHangoutEventMutation.isPending
                      ? "Saving..."
                      : "Save Details"
                    : "Reserve"}
                </Button>
              )}

              {canManage && (
                <Button
                  type="button"
                  onClick={() =>
                    toast("Vendor messaging will be connected next.")
                  }
                  className="h-[44px] w-full rounded-[15px] px-6 py-3 text-xs font-medium sm:h-auto"
                >
                  Message Vendor
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#1E1E1E]">
              Participants
            </h2>
            <p className="mt-1 text-sm text-[#7D7D7D]">
              Everyone attached to this hangout.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-1 sm:px-5">
          {participantDetails.length > 0 ? (
            participantDetails.map((participant) => (
              <ParticipantDetailRow
                key={`${participant.id}-${participant.role}`}
                participant={participant}
              />
            ))
          ) : (
            <div className="px-1 py-5 text-sm text-[#7D7D7D]">
              No participants have been added to this hangout yet.
            </div>
          )}
        </div>
      </section>

      <ConfirmationModal
        open={pendingFulfillmentState !== null}
        onClose={() => setPendingFulfillmentState(null)}
        onConfirm={handleConfirmToggleHangoutFulfillment}
        action="save"
        title={
          pendingFulfillmentState
            ? "Mark Hangout as Fulfilled"
            : "Mark Hangout as Not Fulfilled"
        }
        description={
          pendingFulfillmentState
            ? "Are you sure you want to mark this hangout as fulfilled?"
            : "Are you sure you want to mark this hangout as not fulfilled?"
        }
        confirmText={
          pendingFulfillmentState
            ? "Mark as Fulfilled"
            : "Mark as Not Fulfilled"
        }
        isLoading={updateHangoutFulfillmentMutation.isPending}
      />
    </div>
  );
}

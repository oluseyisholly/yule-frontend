"use client";

import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  Link2Icon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import Button from "@/components/Button";
import { BackIcon } from "@/components/BackLink";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import { EventDetailScreenSkeleton } from "@/components/ui/context-skeletons";
import { Calendar } from "@/components/ui/calender";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import featureImg5 from "@/assets/icons/featureImg5.svg";
import featureImg6 from "@/assets/icons/featureImg6.svg";
import { canManageHangoutEvent } from "@/features/hangout-events/access";
import { useHangoutEventQuery } from "@/features/hangout-events/hooks/useHangoutEventQuery";
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
};

type HangoutParticipantDetail = HangoutParticipantBubble & {
  email: string;
  role: string;
};

const fallbackGallery = [
  featureImg1,
  featureImg2,
  featureImg3,
  featureImg4,
  featureImg5,
  featureImg6,
];

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
          {icon ? <span className="shrink-0 text-[#9A97A5]">{icon}</span> : null}
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
          avoidCollisions={false}
          className="z-[130] w-auto overflow-visible rounded-[20px] border-none bg-white p-0 shadow-[0_20px_48px_rgba(26,19,61,0.12)]"
        >
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            onSelect={handleDateSelect}
            disabled={
              minDate
                ? (date: Date) => date < minDate
                : undefined
            }
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
        <span
          key={participant.id}
          className="flex size-7 items-center justify-center rounded-full border border-white text-[9px] font-semibold"
          style={{
            backgroundColor: participant.bg,
            color: participant.color,
          }}
          title={participant.name}
        >
          {participant.initials}
        </span>
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
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{
            backgroundColor: participant.bg,
            color: participant.color,
          }}
        >
          {participant.initials}
        </span>

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

function GalleryTile({
  src,
  alt,
  onClick,
  overlayLabel,
}: {
  src: StaticImageData | string;
  alt: string;
  onClick: () => void;
  overlayLabel?: string | null;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[120px] overflow-hidden rounded-[12px] bg-[#F4F1FF] text-left"
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        sizes="(max-width: 1024px) 100vw, 25vw"
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

function toDisplayName(person?: {
  firstName?: string;
  lastName?: string;
  email?: string;
} | null) {
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
  const { data: hangout, isLoading, isFetching, isError, refetch } =
    useHangoutEventQuery(hangoutId);
  const updateHangoutEventMutation = useUpdateHangoutEventMutation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [editableCheckInDate, setEditableCheckInDate] = useState("");
  const [editableCheckOutDate, setEditableCheckOutDate] = useState("");
  const [isCheckInCalendarOpen, setIsCheckInCalendarOpen] = useState(false);
  const [isCheckOutCalendarOpen, setIsCheckOutCalendarOpen] = useState(false);
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
            email: participant.eventContact?.email?.trim() || "",
            role: participant.role || "participant",
          });

          return accumulator;
        },
        [],
      ),
    [hangout?.event.participants],
  );

  const gallery = useMemo<Array<StaticImageData | string>>(() => {
    const marketplaceImages =
      marketplaceProduct?.images?.filter((image) => Boolean(image?.trim())) ?? [];

    if (marketplaceImages.length > 0) {
      return marketplaceImages;
    }

    const primaryImage = hangout?.imageUrl?.trim();

    if (!primaryImage) {
      return fallbackGallery;
    }

    return [primaryImage];
  }, [hangout?.imageUrl, marketplaceProduct?.images]);

  const activeImage = gallery[activeImageIndex] ?? gallery[0] ?? fallbackGallery[0];
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

  if (isLoading || isFetching) {
    return (
      <EventDetailScreenSkeleton
        backHref="/dashboard/hangouts"
        backLabel="Back"
        showSidebar={false}
      />
    );
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

          <button
            type="button"
            onClick={() => toast("Sharing hangout details will be connected next.")}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#ECE8F7] px-3 py-2 text-sm text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
          >
            <span>Share</span>
            <Link2Icon className="size-3.5" strokeWidth={1.8} />
          </button>
        </div>

        <div>
          <div className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.9fr)]">
              <button
                type="button"
                onClick={() => setActiveImageIndex(0)}
                className="group relative min-h-[240px] overflow-hidden rounded-[18px] bg-[#F4F1FF] text-left sm:min-h-[320px]"
              >
                <Image
                  src={activeImage}
                  alt={pageTitle}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </button>

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
                  <MapPinIcon className="size-4 text-[#9A97A5]" strokeWidth={1.8} />
                  <span>{locationLabel}</span>
                </div>

                <p className="mt-4 max-w-[820px] text-[13px] leading-7 text-[#5F5B66]">
                  {description}
                </p>

                {participants.length > 0 ? (
                  <div className="mt-5 flex items-center gap-3">
                    <UsersIcon className="size-4 text-[#9A97A5]" strokeWidth={1.8} />
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
                      value={formatDate(hangout.checkInDate || hangout.event.eventDate)}
                      icon={<CalendarDaysIcon className="size-3.5" strokeWidth={1.8} />}
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
                      icon={<CalendarDaysIcon className="size-3.5" strokeWidth={1.8} />}
                    />
                  )}
                  <ReadOnlyBookingField
                    label="Guests"
                    value={guestsLabel}
                    icon={<UsersIcon className="size-3.5" strokeWidth={1.8} />}
                    trailingIcon={<ChevronDownIcon className="size-3.5" strokeWidth={1.8} />}
                  />
                </div>

                <Button
                  type="button"
                  onClick={
                    canManage
                      ? () => void handleSaveBookingDetails()
                      : () =>
                          toast("Reservation flow will be connected next.")
                  }
                  disabled={
                    canManage
                      ? updateHangoutEventMutation.isPending || !hasBookingChanges
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
              </div>
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
    </div>
  );
}

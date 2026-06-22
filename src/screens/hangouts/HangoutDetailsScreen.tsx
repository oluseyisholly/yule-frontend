"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  Link2Icon,
  MapPinIcon,
} from "lucide-react";
import Button from "@/components/Button";
import { BackIcon } from "@/components/BackLink";
import { getHangoutById } from "@/features/hangouts/mock-data";
import type { HangoutRow } from "@/features/hangouts/mock-data";
import { cn } from "@/lib/utils";

type HangoutDetailsScreenProps = {
  hangoutId: string;
};

function VerifiedBadge() {
  return (
    <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#31D0AA] text-white">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-3"
        aria-hidden="true"
      >
        <path
          d="M4 8.3 6.3 10.6 12 4.9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function BookingField({
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
      <button
        type="button"
        onClick={() => toast(`${label} selection will be connected next.`)}
        className="flex h-[44px] w-full items-center justify-between rounded-[14px] border border-[#ECE8F7] bg-white px-3 text-left text-[12px] text-[#7D7D7D] transition-colors hover:border-[#D8CEF7]"
      >
        <span className="flex min-w-0 items-center gap-2">
          {icon ? <span className="shrink-0 text-[#9A97A5]">{icon}</span> : null}
          <span className="truncate">{value}</span>
        </span>
        {trailingIcon ? (
          <span className="shrink-0 text-[#9A97A5]">{trailingIcon}</span>
        ) : null}
      </button>
    </div>
  );
}

function ParticipantStack({
  participants,
}: {
  participants: HangoutRow["participants"];
}) {
  const visibleParticipants = participants.slice(0, 3);
  const overflowCount = Math.max(participants.length - visibleParticipants.length, 0);

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

function GalleryTile({
  src,
  alt,
  onClick,
  overlayLabel,
}: {
  src: HangoutRow["gallery"][number];
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

export default function HangoutDetailsScreen({
  hangoutId,
}: HangoutDetailsScreenProps) {
  const hangout = useMemo(() => getHangoutById(hangoutId), [hangoutId]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!hangout) {
    return null;
  }

  const gallery = hangout.gallery.length > 0 ? hangout.gallery : [hangout.image];
  const activeImage = gallery[activeImageIndex] ?? hangout.image;
  const sideGallery = gallery.slice(1, 5);
  const overlayCount = Math.max(gallery.length - 5, 0);

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
            {hangout.venueName}
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

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
          <div className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.9fr)]">
              <button
                type="button"
                onClick={() => setActiveImageIndex(0)}
                className="group relative min-h-[240px] overflow-hidden rounded-[18px] bg-[#F4F1FF] text-left sm:min-h-[320px]"
              >
                <Image
                  src={activeImage}
                  alt={hangout.venueName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </button>

              <div className="grid grid-cols-2 gap-3">
                {sideGallery.map((image, index) => {
                  const computedIndex = index + 1;
                  const isLastTile = index === sideGallery.length - 1 && overlayCount > 0;

                  return (
                    <GalleryTile
                      key={`${hangout.id}-gallery-${computedIndex}`}
                      src={image}
                      alt={`${hangout.venueName} view ${computedIndex + 1}`}
                      onClick={() => setActiveImageIndex(computedIndex)}
                      overlayLabel={isLastTile ? `+${overlayCount}` : null}
                    />
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[#7D7D7D]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E04F4F]" />
                    <span>{hangout.vendorName}</span>
                  </span>
                  {hangout.vendorVerified ? <VerifiedBadge /> : null}
                </div>

                <p className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">
                  {hangout.amount}
                  <span className="ml-1 text-[18px] font-medium tracking-normal text-[#434343]">
                    (Average per night)
                  </span>
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-[#7D7D7D]">
                  <MapPinIcon className="size-4 text-[#9A97A5]" strokeWidth={1.8} />
                  <span>
                    {hangout.venueName}, {hangout.location}
                  </span>
                </div>

                <p className="mt-4 max-w-[820px] text-[13px] leading-7 text-[#5F5B66]">
                  {hangout.description}
                </p>
              </div>

              <div className="space-y-4 rounded-[20px] border border-[#EEEAF7] bg-[#FCFBFF] p-4">
                <p className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">
                  {hangout.amount}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <BookingField
                    label="Check-In"
                    value="Choose date"
                    icon={<CalendarDaysIcon className="size-3.5" strokeWidth={1.8} />}
                    trailingIcon={<CalendarDaysIcon className="size-3.5" strokeWidth={1.8} />}
                  />
                  <BookingField
                    label="Checkout"
                    value="Choose date"
                    icon={<CalendarDaysIcon className="size-3.5" strokeWidth={1.8} />}
                    trailingIcon={<CalendarDaysIcon className="size-3.5" strokeWidth={1.8} />}
                  />
                </div>

                <BookingField
                  label="Guests"
                  value={hangout.guests}
                  trailingIcon={<ChevronDownIcon className="size-4" strokeWidth={1.8} />}
                />

                <Button
                  type="button"
                  onClick={() => toast("Hangout reservation will be connected next.")}
                  className="h-[48px] w-full rounded-full text-sm font-medium"
                >
                  Reserve
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

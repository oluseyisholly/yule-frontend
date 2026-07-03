"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  MailIcon,
  PencilIcon,
  Trash2Icon,
  UserRoundIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import DetailHeader from "@/components/DetailHeader";
import UserAvatar from "@/components/UserAvatar";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import { EventDetailScreenSkeleton } from "@/components/ui/context-skeletons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useEventGivenGroupedGiftsQuery";
import type { GivenGroupedGift } from "@/features/gifts/types";
import { useDeleteScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useDeleteScheduledEventMessageMutation";
import { useScheduledEventMessageQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessageQuery";
import type { ScheduledEventMessageRecord } from "@/features/scheduled-event-messages/types";
import { cn } from "@/lib/utils";

type ScheduledEventMessageDetailsScreenProps = {
  scheduledEventMessageId: string;
};

const statusClassNames: Record<string, string> = {
  completed: "bg-[#E6F7EC] text-[#1FAB54]",
  sent: "bg-[#E6F7EC] text-[#1FAB54]",
  draft: "bg-[#FFF1DD] text-[#C28A00]",
  pending: "bg-[#FFF1DD] text-[#C28A00]",
  ongoing: "bg-[#EFE6FD] text-[#3300C9]",
  failed: "bg-[#FDE0DE] text-[#E04F4F]",
  cancelled: "bg-[#F4F4F6] text-[#7D7D7D]",
};

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

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(
  value?: string | number | null,
  currency: string = "NGN",
) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return currency === "NGN" ? "₦0" : `${currency} 0`;
  }

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch {
    return `${currency} ${new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0,
    }).format(numericValue)}`;
  }
}

function formatStatus(value?: string | null) {
  if (!value?.trim()) {
    return "Pending";
  }

  return value
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatCategoryLabel(value?: string | null) {
  if (!value?.trim()) {
    return "Gift";
  }

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function normalizeStatus(value?: string | null) {
  return value?.trim().toLowerCase() || "pending";
}

function toInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const second = parts.length > 1 ? parts[1]?.charAt(0) ?? "" : "";

  return `${first}${second}`.toUpperCase() || "SM";
}

function getRecipientDetails(record: ScheduledEventMessageRecord) {
  const contact = record.participant?.eventContact;
  const contactName = `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim();
  const name =
    record.recipientName?.trim() ||
    contactName ||
    record.recipientEmail?.trim() ||
    "Recipient";

  return {
    name,
    email: record.recipientEmail?.trim() || contact?.email?.trim() || "-",
    profileUrl: contact?.profileUrl?.trim() || null,
    initials: toInitials(name),
    role: record.participant?.role || "participant",
  };
}

function isEventCompleted(record?: ScheduledEventMessageRecord | null) {
  return normalizeStatus(record?.event?.status) === "completed";
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] bg-white px-4 py-4 sm:px-5">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#7D7D7D]">
        <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#F4F0FF] text-[#3300C9]">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-4 text-[15px] font-semibold text-[#1E1E1E] sm:text-[16px]">
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const normalizedStatus = normalizeStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
        statusClassNames[normalizedStatus] ?? "bg-[#EFE6FD] text-[#3300C9]",
      )}
    >
      {formatStatus(status)}
    </span>
  );
}

function DetailLine({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[#F0EEFF] bg-[#FBFAFF] px-4 py-3">
      <p className="text-[12px] font-medium text-[#7D7D7D]">{label}</p>
      <div className="mt-2 break-words text-[14px] font-medium text-[#1E1E1E]">
        {value || "-"}
      </div>
    </div>
  );
}

function ScheduleGiftCard({
  gift,
  scheduleMessageId,
}: {
  gift: GivenGroupedGift;
  scheduleMessageId: string;
}) {
  const giftId =
    gift.participantGiftId?.trim() || gift.id?.trim() || gift.productSlug?.trim();
  const people = gift.people ?? [];
  const visiblePeople = people.slice(0, 2);
  const overflowCount = Math.max((gift.recipientCount ?? people.length) - 2, 0);

  return (
    <article className="flex min-h-full flex-col rounded-[18px] border border-[#F0EEFF] bg-white p-3 shadow-[0_8px_24px_rgba(29,18,68,0.04)]">
      <div className="relative h-[150px] overflow-hidden rounded-[14px] bg-[#F6F2FF]">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.title || "Assigned gift"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-[#3300C9]">
            Gift
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-[#1E1E1E]">
              {gift.title?.trim() || "Selected gift"}
            </h3>
            <p className="mt-1 text-[11px] font-medium text-[#FF6600]">
              {formatCategoryLabel(gift.condition || gift.categorySlug)}
            </p>
          </div>
          <p className="shrink-0 text-[13px] font-semibold text-[#1E1E1E]">
            {formatCurrency(gift.amount, gift.currency?.trim() || "NGN")}
          </p>
        </div>

        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#7D7D7D]">
          {gift.description?.trim() ||
            "No description available for this gift yet."}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center -space-x-2">
            {visiblePeople.map((person, index) => {
              const name =
                `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
                person.email ||
                "Recipient";

              return (
                <UserAvatar
                  key={`${name}-${index}`}
                  name={name}
                  initials={toInitials(name)}
                  imageUrl={person.profileUrl}
                  bgColor="#EFE6FD"
                  textColor="#3300C9"
                  className="size-7 border border-white text-[9px] font-semibold"
                  title={name}
                />
              );
            })}
            {overflowCount > 0 ? (
              <span className="flex size-7 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
                +{overflowCount}
              </span>
            ) : null}
          </div>

          <Link
            href={
              giftId
                ? `/dashboard/schedule/${scheduleMessageId}/gift/${encodeURIComponent(giftId)}`
                : "#"
            }
            aria-disabled={!giftId}
            className={cn(
              "inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-[#3300C9] px-4 text-[12px] font-medium text-white transition-colors hover:bg-[#2D00B4]",
              !giftId && "pointer-events-none opacity-50",
            )}
          >
            View Gift
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ScheduledEventMessageDetailsScreen({
  scheduledEventMessageId,
}: ScheduledEventMessageDetailsScreenProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const deleteMessageMutation = useDeleteScheduledEventMessageMutation();
  const {
    data: scheduledMessageResponse,
    isLoading,
    isError,
    refetch,
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
      per_page: 8,
    },
    {
      enabled: Boolean(record?.eventId),
    },
  );
  const recipient = useMemo(
    () => (record ? getRecipientDetails(record) : null),
    [record],
  );
  const canManageRecord = record ? !isEventCompleted(record) : false;

  const handleEdit = () => {
    if (!record || !canManageRecord) {
      return;
    }

    const params = new URLSearchParams({
      mode: record.scheduledAt ? "schedule" : "message",
      scheduleEventMessageId: record.id,
      eventId: record.eventId,
    });

    router.push(`/dashboard/schedule/flow/event?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!record || !canManageRecord) {
      return;
    }

    try {
      const response = await deleteMessageMutation.mutateAsync(record.id);
      toast.success(response.message || "Scheduled message deleted.");
      setIsDeleteModalOpen(false);
      router.push("/dashboard/schedule");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this scheduled message right now.",
      );
    }
  };

  if (isLoading) {
    return (
      <EventDetailScreenSkeleton
        backHref="/dashboard/schedule"
        backLabel="View Details"
      />
    );
  }

  if (isError || !record || !recipient) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/schedule" label="View Details" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-6 text-center sm:p-10">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this scheduled message right now.
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

  return (
    <div className="space-y-4 sm:space-y-5">
      <BackLink href="/dashboard/schedule" label="View Details" />

      <section>
        <div className="flex flex-col gap-5 pb-5 sm:pb-6">
          <DetailHeader
            title={record.event?.title || record.subject || "Scheduled Message"}
            subtitle={`Message to ${recipient.name}`}
            meta={
              <>
                <span className="inline-flex items-center gap-2 text-xs text-[#7D7D7D]">
                  <CustomCalendarIcon className="size-4" />
                  {formatDate(record.event?.eventDate)}
                </span>
                <StatusPill status={record.event?.status} />
              </>
            }
            avatar={{
              initials: toInitials(record.event?.title || record.subject),
              color: "#3300C9",
              bg: "#EFE6FD",
            }}
            actions={
              canManageRecord ? (
                <>
                  <Button
                    type="button"
                    onClick={() => setIsMessageModalOpen(true)}
                    variant="outline"
                    className="h-10 rounded-full border-[#D8CEF7] bg-white px-5 text-sm font-medium text-[#3300C9] hover:bg-[#F6F2FF] hover:text-[#3300C9]"
                  >
                    <EyeIcon className="size-4" />
                    View Message
                  </Button>
                  <Button
                    type="button"
                    onClick={handleEdit}
                    className="h-10 rounded-full bg-[#3300C9] px-5 text-sm font-medium text-white hover:bg-[#2D00B4]"
                  >
                    <PencilIcon className="size-4" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    variant="outline"
                    className="h-10 rounded-full border-[#F6C8C8] bg-white px-5 text-sm font-medium text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F]"
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsMessageModalOpen(true)}
                  variant="outline"
                  className="h-10 rounded-full border-[#D8CEF7] bg-white px-5 text-sm font-medium text-[#3300C9] hover:bg-[#F6F2FF] hover:text-[#3300C9]"
                >
                  <EyeIcon className="size-4" />
                  View Message
                </Button>
              )
            }
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <SummaryStat
              icon={<CalendarDaysIcon className="size-4" />}
              label="Event Date"
              value={formatDate(record.event?.eventDate)}
            />
            <SummaryStat
              icon={<ClockIcon className="size-4" />}
              label="Scheduled Date"
              value={formatDateTime(record.scheduledAt)}
            />
            <SummaryStat
              icon={<MailIcon className="size-4" />}
              label="Message Status"
              value={formatStatus(record.status)}
            />
            <SummaryStat
              icon={<UserRoundIcon className="size-4" />}
              label="Recipient"
              value={recipient.name}
            />
          </div>

          <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold text-[#000000]">
                  Gifts
                </h2>
                <p className="mt-1 text-[12px] text-[#7D7D7D]">
                  Gifts assigned to this scheduled message recipient.
                </p>
              </div>
              <span className="rounded-full bg-[#F4F0FF] px-3 py-1 text-[11px] font-medium text-[#3300C9]">
                {eventGiftsResponse?.data.total ?? 0} gift
                {(eventGiftsResponse?.data.total ?? 0) === 1 ? "" : "s"}
              </span>
            </div>

            {isEventGiftsLoading ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[286px] animate-pulse rounded-[18px] bg-[#F7F4FF]"
                  />
                ))}
              </div>
            ) : isEventGiftsError ? (
              <div className="mt-5 rounded-[18px] border border-[#F0EEFF] bg-[#FBFAFF] px-4 py-8 text-center">
                <p className="text-sm text-[#7D7D7D]">
                  Unable to load gifts for this scheduled message.
                </p>
                <button
                  type="button"
                  onClick={() => refetchEventGifts()}
                  className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  Retry
                </button>
              </div>
            ) : (eventGiftsResponse?.data.data ?? []).length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {(eventGiftsResponse?.data.data ?? []).map((gift, index) => (
                  <ScheduleGiftCard
                    key={
                      gift.id ||
                      gift.participantGiftId ||
                      gift.productSlug ||
                      `${gift.title}-${index}`
                    }
                    gift={gift}
                    scheduleMessageId={record.id}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[18px] border border-[#F0EEFF] bg-[#FBFAFF] px-4 py-10 text-center">
                <p className="text-sm font-medium text-[#1E1E1E]">
                  No gifts assigned yet.
                </p>
                <p className="mt-1 text-sm text-[#7D7D7D]">
                  Gifts connected to this scheduled message will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,520px)]">
            <aside className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <h2 className="text-[16px] font-semibold text-[#000000]">
                Recipient Details
              </h2>

              <div className="mt-5 flex items-center gap-3 rounded-[18px] border border-[#F0EEFF] bg-[#FBFAFF] p-4">
                <UserAvatar
                  name={recipient.name}
                  initials={recipient.initials}
                  imageUrl={recipient.profileUrl}
                  bgColor="#EFE6FD"
                  textColor="#3300C9"
                  className="size-14 text-base font-semibold"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#1E1E1E]">
                    {recipient.name}
                  </p>
                  <p className="truncate text-[12px] text-[#7D7D7D]">
                    {recipient.email}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-[#F4F0FF] px-3 py-1 text-[11px] font-medium text-[#3300C9]">
                    {formatStatus(recipient.role)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <DetailLine label="Recipient Email" value={recipient.email} />
                {/* <DetailLine
                  label="Participant ID"
                  value={record.participantId || "-"}
                />
                <DetailLine label="Event ID" value={record.eventId || "-"} /> */}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete Scheduled Message"
        description={`Are you sure you want to delete "${record.subject || record.event?.title}"?`}
        confirmText="Delete"
        isLoading={deleteMessageMutation.isPending}
        closeOnOverlayClick={false}
      />

      <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
        <DialogContent className="max-w-[620px] rounded-[22px] p-0">
          <DialogHeader className="border-b border-[#F0EEFF] px-6 py-5 text-left">
            <DialogTitle className="text-xl font-semibold text-[#1E1E1E]">
              View Message
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailLine label="Subject" value={record.subject || "-"} />
              <DetailLine
                label="Created"
                value={formatDateTime(record.createdAt)}
              />
              <DetailLine
                label="Scheduled Date"
                value={formatDateTime(record.scheduledAt)}
              />
              <DetailLine
                label="Message Status"
                value={<StatusPill status={record.status} />}
              />
              <DetailLine
                label="Sent At"
                value={formatDateTime(record.sentAt)}
              />
              <DetailLine
                label="Gift Link Expires"
                value={formatDateTime(record.giftUrlExpiresAt)}
              />
            </div>

            <div className="rounded-[18px] border border-[#F0EEFF] bg-[#FBFAFF] px-4 py-4">
              <p className="text-[12px] font-medium text-[#7D7D7D]">
                Message Body
              </p>
              <p className="mt-3 max-h-[360px] overflow-y-auto whitespace-pre-line text-[14px] leading-7 text-[#1E1E1E]">
                {record.message || "-"}
              </p>
            </div>
            {record.giftUrl ? (
              <DetailLine
                label="Gift URL"
                value={
                  <a
                    href={record.giftUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3300C9] underline-offset-4 hover:underline"
                  >
                    {record.giftUrl}
                  </a>
                }
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

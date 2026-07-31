"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
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
import Table, { type TableData } from "@/components/ui/Table";
import { Button } from "@/components/ui/button";
import StatusPill from "@/components/ui/status-pill";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEventGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useEventGivenGroupedGiftsQuery";
import type { GivenGroupedGift } from "@/features/gifts/types";
import { useCancelScheduledEventMessageEventMutation } from "@/features/scheduled-event-messages/hooks/useCancelScheduledEventMessageEventMutation";
import { useDeleteScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useDeleteScheduledEventMessageMutation";
import { useScheduledEventMessageQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessageQuery";
import type { ScheduledEventMessageRecord } from "@/features/scheduled-event-messages/types";

type ScheduledEventMessageDetailsScreenProps = {
  scheduledEventMessageId: string;
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
  const second = parts.length > 1 ? (parts[1]?.charAt(0) ?? "") : "";

  return `${first}${second}`.toUpperCase() || "SM";
}

function getRecipientList(record: ScheduledEventMessageRecord) {
  const participants = record.participants ?? [];

  return participants
    .map((participant) => {
      const contact = participant.eventContact;
      const firstName = contact?.firstName?.trim() || "";
      const lastName = contact?.lastName?.trim() || "";
      const name =
        `${firstName} ${lastName}`.trim() ||
        contact?.email?.trim() ||
        "Recipient";

      return {
        id: participant.id,
        name,
        firstName,
        lastName,
        email: contact?.email?.trim() || "-",
        profileUrl: contact?.profileUrl?.trim() || null,
        role: participant?.role || "participant",
      };
    })
    .filter((recipient) => recipient.name.trim());
}

function getRecipientDetails(record: ScheduledEventMessageRecord) {
  const participant = record.participant ?? record.participants?.[0] ?? null;
  const contact = participant?.eventContact;
  const recipientList = getRecipientList(record);
  const primaryRecipient = recipientList[0];
  const contactName =
    `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim();
  const name =
    record.recipientName?.trim() ||
    primaryRecipient?.name ||
    contactName ||
    record.recipientEmail?.trim() ||
    "Recipient";

  return {
    name,
    email:
      primaryRecipient?.email ||
      record.recipientEmail?.trim() ||
      contact?.email?.trim() ||
      "-",
    profileUrl:
      primaryRecipient?.profileUrl || contact?.profileUrl?.trim() || null,
    initials: toInitials(name),
    role: participant?.role || "participant",
    recipients: recipientList,
  };
}

function isEventCompleted(record?: ScheduledEventMessageRecord | null) {
  return normalizeStatus(record?.event?.status) === "completed";
}

function isUpcomingScheduledMessage(record?: ScheduledEventMessageRecord | null) {
  if (!record?.scheduledAt) {
    return false;
  }

  const scheduledTime = new Date(record.scheduledAt).getTime();

  if (Number.isNaN(scheduledTime)) {
    return false;
  }

  return scheduledTime >= Date.now();
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
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

type ScheduleGiftRowPerson = {
  name: string;
  email?: string;
};

type ScheduleGiftRow = {
  id: string;
  giftId: string;
  title: string;
  imageUrl: string;
  conditionLabel: string;
  categoryLabel: string;
  amount: string;
  status: "Assigned" | "Pending";
  assignedPeople: ScheduleGiftRowPerson[];
  recipientCount: number;
};

type ScheduleRecipientRow = {
  id: string;
  name: string;
  role: string;
  initials: string;
  profileUrl?: string | null;
  color: string;
  bg: string;
  email: string;
};

function toAssignedPeople(people?: GivenGroupedGift["people"]) {
  return (people ?? []).reduce<ScheduleGiftRowPerson[]>((accumulator, person) => {
    const name =
      `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
      person.email?.trim() ||
      "";

    if (!name) {
      return accumulator;
    }

    accumulator.push({
      name,
      email: person.email?.trim() || undefined,
    });

    return accumulator;
  }, []);
}

function buildScheduleGiftRows(gifts: GivenGroupedGift[]): ScheduleGiftRow[] {
  return gifts.map((gift, index) => {
    const assignedPeople = toAssignedPeople(gift.people);
    const recipientCount =
      gift.recipientCount ?? (assignedPeople.length > 0 ? assignedPeople.length : 0);
    const giftId =
      gift.participantGiftId?.trim() ||
      gift.id?.trim() ||
      gift.productSlug?.trim() ||
      `${gift.title?.trim() || "gift"}-${index}`;

    return {
      id: `${giftId}-${index}`,
      giftId,
      title: gift.title?.trim() || "Selected gift",
      imageUrl: gift.imageUrl?.trim() || "",
      conditionLabel: formatCategoryLabel(gift.condition || "available"),
      categoryLabel: formatCategoryLabel(
        gift.subCategorySlug || gift.categorySlug,
      ),
      amount: formatCurrency(gift.amount, gift.currency?.trim() || "NGN"),
      status: recipientCount > 0 ? "Assigned" : "Pending",
      assignedPeople,
      recipientCount,
    };
  });
}

function GiftNameCell({ gift }: { gift: ScheduleGiftRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F5F2FF]">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] font-medium text-[#3300C9]">Gift</span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[#1E1E1E]">
          {gift.title}
        </p>
        <span className="mt-1 inline-flex rounded-full border border-[#FFB978] px-2 py-0.5 text-[10px] font-medium text-[#FF8A00]">
          {gift.conditionLabel}
        </span>
      </div>
    </div>
  );
}

function AssignedPersonAvatar({ name }: { name: string }) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white bg-[#EFE6FD] text-[9px] font-semibold text-[#3300C9]"
      title={name}
    >
      {toInitials(name)}
    </span>
  );
}

function AssignedPeopleCell({
  people,
  recipientCount,
}: {
  people: ScheduleGiftRowPerson[];
  recipientCount: number;
}) {
  if (people.length === 0 && recipientCount === 0) {
    return <span className="text-[#9A97A5]">—</span>;
  }

  if (people.length <= 1) {
    const person = people[0];

    if (!person) {
      return (
        <span className="text-[12px] font-medium text-[#1E1E1E]">
          {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
        </span>
      );
    }

    return (
      <div className="flex min-w-0 items-center gap-2">
        <AssignedPersonAvatar name={person.name} />
        <span className="truncate text-[12px] font-medium text-[#1E1E1E]">
          {person.name}
        </span>
      </div>
    );
  }

  const visiblePeople = people.slice(0, 3);
  const overflowCount = Math.max(recipientCount - visiblePeople.length, 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-2">
        {visiblePeople.map((person) => (
          <AssignedPersonAvatar key={person.name} name={person.name} />
        ))}
        {overflowCount > 0 ? (
          <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
            +{overflowCount}
          </span>
        ) : null}
      </div>
      <span className="text-[12px] font-medium text-[#1E1E1E]">
        {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
      </span>
    </div>
  );
}

function getParticipantStyle(seed: string) {
  const palette = [
    { color: "#3300C9", bg: "#EFE6FD" },
    { color: "#C28A00", bg: "#FCEEC8" },
    { color: "#1FAB54", bg: "#D9F4E2" },
    { color: "#E04F4F", bg: "#FDE0DE" },
    { color: "#0067C9", bg: "#DDF0FF" },
  ] as const;

  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return palette[hash % palette.length];
}

function buildRecipientRows(
  recipients: NonNullable<ReturnType<typeof getRecipientDetails>["recipients"]>,
) {
  return recipients.map<ScheduleRecipientRow>((recipient) => {
    const { bg, color } = getParticipantStyle(recipient.id || recipient.name);

    return {
      id: recipient.id,
      name: recipient.name,
      role: formatStatus(recipient.role),
      initials: toInitials(recipient.name),
      profileUrl: recipient.profileUrl,
      bg,
      color,
      email: recipient.email,
    };
  });
}

function ParticipantAvatar({
  participant,
}: {
  participant: ScheduleRecipientRow;
}) {
  return (
    <UserAvatar
      name={participant.name}
      initials={participant.initials}
      imageUrl={participant.profileUrl}
      bgColor={participant.bg}
      textColor={participant.color}
      className="size-11 text-sm font-semibold"
      title={participant.name}
    />
  );
}

function SidebarParticipantRow({
  participant,
}: {
  participant: ScheduleRecipientRow;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0">
      <ParticipantAvatar participant={participant} />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#1E1E1E]">
          {participant.name}
        </p>
        <p className="truncate text-xs text-[#7D7D7D]">{participant.role}</p>
        <p className="truncate text-xs text-[#A09BAF]">{participant.email}</p>
      </div>
    </div>
  );
}

export default function ScheduledEventMessageDetailsScreen({
  scheduledEventMessageId,
}: ScheduledEventMessageDetailsScreenProps) {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const deleteMessageMutation = useDeleteScheduledEventMessageMutation();
  const cancelScheduledEventMessageEventMutation =
    useCancelScheduledEventMessageEventMutation();
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
      per_page: 25,
    },
    {
      enabled: Boolean(record?.eventId),
    },
  );
  const giftRows = useMemo(
    () => buildScheduleGiftRows(eventGiftsResponse?.data.data ?? []),
    [eventGiftsResponse?.data.data],
  );
  const recipient = useMemo(
    () => (record ? getRecipientDetails(record) : null),
    [record],
  );
  const recipientRows = useMemo(
    () => buildRecipientRows(recipient?.recipients ?? []),
    [recipient?.recipients],
  );
  const recipientSummary = useMemo(() => {
    const recipients = recipient?.recipients ?? [];

    if (!recipients.length) {
      return recipient?.name ?? "Recipient";
    }

    if (recipients.length === 1) {
      return recipients[0]?.name ?? recipient?.name ?? "Recipient";
    }

    return `${recipients[0]?.name ?? recipient?.name ?? "Recipient"} +${
      recipients.length - 1
    }`;
  }, [recipient]);
  const giftTableData = useMemo<TableData<ScheduleGiftRow>>(
    () => ({
      columns: [
        {
          id: "gift",
          header: "Gift",
          render: (row) => <GiftNameCell gift={row} />,
        },
        {
          id: "category",
          header: "Category",
          accessor: "categoryLabel",
        },
        {
          id: "amount",
          header: "Price",
          accessor: "amount",
        },
        {
          id: "recipients",
          header: "Recipients",
          render: (row) => (
            <AssignedPeopleCell
              people={row.assignedPeople}
              recipientCount={row.recipientCount}
            />
          ),
        },
        {
          id: "status",
          header: "Status",
          render: (row) => (
            <StatusPill
              status={row.status}
              className="min-w-[90px] justify-center"
            />
          ),
        },
        {
          id: "action",
          header: "",
          render: (row) => (
            <div className="flex justify-end">
              <Link
                href={`/dashboard/schedule/${record?.id ?? ""}/gift/${encodeURIComponent(row.giftId)}`}
                className="rounded-full bg-[#F3EFFB] px-3 py-1 text-[11px] font-medium text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
              >
                View
              </Link>
            </div>
          ),
        },
      ],
      rows: giftRows,
      getRowKey: (row) => row.id,
      headerRowClassName: "border-b border-[#F1EDF8]",
      headerCellClassName:
        "px-3 py-3 text-left text-[12px] font-medium text-[#7D7D7D]",
      bodyCellClassName:
        "border-b border-[#F5F1FB] px-3 py-4 align-middle text-[12px] text-[#1E1E1E]",
      rowClassName: "bg-white",
      emptyState: (
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-[#1E1E1E]">
            No gifts assigned yet.
          </p>
          <p className="mt-1 text-sm text-[#7D7D7D]">
            Gifts connected to this scheduled message will appear here.
          </p>
        </div>
      ),
    }),
    [giftRows, record?.id],
  );
  const canManageRecord = record ? !isEventCompleted(record) : false;
  const isUpcomingRecord = isUpcomingScheduledMessage(record);
  const isDraftRecord = record?.event?.status?.toLowerCase() === "draft";
  const shouldCancelRecord = isUpcomingRecord && !isDraftRecord;

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
      const response = shouldCancelRecord
        ? await cancelScheduledEventMessageEventMutation.mutateAsync(record.eventId)
        : await deleteMessageMutation.mutateAsync(record.id);
      toast.success(
        response.message ||
          (shouldCancelRecord
            ? "Scheduled message event cancelled."
            : "Scheduled message deleted."),
      );
      setIsDeleteModalOpen(false);
      router.push("/dashboard/schedule");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : shouldCancelRecord
            ? "Unable to cancel this scheduled message event right now."
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
            subtitle={`Message to ${recipientSummary}`}
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
                    {shouldCancelRecord ? "Cancel" : "Delete"}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
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
              icon={<UserRoundIcon className="size-4" />}
              label="Recipient"
              value={
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-2">
                    {(recipient.recipients ?? [])
                      .slice(0, 3)
                      .map((item, index) => (
                        <UserAvatar
                          key={`${item.id}-${index}`}
                          name={item.name}
                          initials={toInitials(
                            `${item.firstName} ${item.lastName}`.trim() ||
                              item.name,
                          )}
                          imageUrl={item.profileUrl}
                          bgColor="#EFE6FD"
                          textColor="#3300C9"
                          className="size-8 border border-white text-[9px] font-semibold"
                          title={item.name}
                        />
                      ))}
                    {(recipient.recipients?.length ?? 0) > 3 ? (
                      <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
                        +{(recipient.recipients?.length ?? 0) - 3}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[14px] font-medium text-[#1E1E1E]">
                    {recipientSummary}
                  </span>
                </div>
              }
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
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
                <div className="mt-5 overflow-hidden rounded-[18px] border border-[#F0EEFF]">
                  <div className="h-[260px] animate-pulse bg-[#F7F4FF]" />
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
              ) : giftRows.length > 0 ? (
                <div className="mt-5 overflow-hidden rounded-[18px] border border-[#F0EEFF]">
                  <Table
                    data={giftTableData}
                    tableClassName="w-full min-w-[720px]"
                    wrapperClassName="overflow-x-auto"
                  />
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

            <aside className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <h2 className="text-[16px] font-semibold text-[#000000]">
                Recipient Details
              </h2>

              <div className="mt-5 rounded-[18px] border border-[#F0EEFF] bg-[#FBFAFF] p-4">
                <div className="flex items-center gap-3">
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
                      {recipientSummary}
                    </p>
                    <p className="truncate text-[12px] text-[#7D7D7D]">
                      {(recipient.recipients ?? []).length > 1
                        ? `${recipient.recipients?.length ?? 0} recipients`
                        : recipient.email}
                    </p>
                    <span className="mt-2 inline-flex rounded-full bg-[#F4F0FF] px-3 py-1 text-[11px] font-medium text-[#3300C9]">
                      {formatStatus(recipient.role)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 max-h-[260px] overflow-y-auto pr-1">
                  {recipientRows.length ? (
                    recipientRows.map((item) => (
                      <SidebarParticipantRow
                        key={item.id}
                        participant={item}
                      />
                    ))
                  ) : (
                    <div className="rounded-[14px] border border-dashed border-[#E8E2FF] bg-white px-3 py-4 text-center text-sm text-[#7D7D7D]">
                      No additional recipients found.
                    </div>
                  )}
                </div>
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
        title={
          shouldCancelRecord
            ? "Cancel Scheduled Message Event"
            : "Delete Scheduled Message"
        }
        description={
          shouldCancelRecord
            ? `Are you sure you want to cancel "${record.subject || record.event?.title}"?`
            : `Are you sure you want to delete "${record.subject || record.event?.title}"?`
        }
        confirmText={shouldCancelRecord ? "Cancel Event" : "Delete"}
        isLoading={
          shouldCancelRecord
            ? cancelScheduledEventMessageEventMutation.isPending
            : deleteMessageMutation.isPending
        }
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
              {/* <DetailLine
                label="Gift Link Expires"
                value={formatDateTime(record.giftUrlExpiresAt)}
              /> */}
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  MoreHorizontal,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import Checkbox from "@/components/Checkbox";
import DetailHeader from "@/components/DetailHeader";
import Pagination from "@/components/Pagination";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import FilterIcon from "@/components/icons/FilterIcon";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import {
  EventDetailScreenSkeleton,
  TableLoadingState,
} from "@/components/ui/context-skeletons";
import Table, { type TableData } from "@/components/ui/Table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useEventGivenGroupedGiftsQuery";
import type {
  GivenGroupedGift,
  GivenGroupedGiftPerson,
} from "@/features/gifts/types";
import { canManageGiftingEvent } from "@/features/gifting-events/access";
import { useDeleteGiftingEventMutation } from "@/features/gifting-events/hooks/useDeleteGiftingEventMutation";
import { useGiftingEventQuery } from "@/features/gifting-events/hooks/useGiftingEventQuery";
import type {
  GiftingEventParticipant,
  GiftingEventRecord,
} from "@/features/gifting-events/types";
import { cn } from "@/lib/utils";
import { isGiftModalStep } from "@/screens/gifts/modal-steps";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildGiftFlowHref,
  buildGiftFlowSelectionKey,
  useGiftFlowStore,
} from "@/stores/gift-flow-store";

type GiftingEventDetailsScreenProps = {
  giftingEventId: string;
};

type DetailStatus = "Completed" | "Draft" | "Ongoing" | "In Progress";

type DetailParticipant = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  bg: string;
  email: string;
};

type GiftRowPerson = {
  name: string;
  email?: string;
};

type GiftRow = {
  id: string;
  title: string;
  imageUrl: string;
  conditionLabel: string;
  categoryLabel: string;
  amount: string;
  status: "Assigned" | "Pending";
  assignedPeople: GiftRowPerson[];
  recipientCount: number;
};

const participantPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
] as const;

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

function toInitials(firstName?: string | null, lastName?: string | null) {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase();

  return initials || "GF";
}

function getParticipantStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return participantPalette[hash % participantPalette.length];
}

function formatStatus(record: GiftingEventRecord): DetailStatus {
  const normalizedStatus = record.event.status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "draft") {
    return "Draft";
  }

  if (normalizedStatus === "ongoing") {
    return "Ongoing";
  }

  return "In Progress";
}

function formatCategoryLabel(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatConditionLabel(value?: string | null) {
  if (!value?.trim()) {
    return "Available";
  }

  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("-");
}

function toDisplayName(person?: GivenGroupedGiftPerson | null) {
  if (!person) {
    return "";
  }

  return (
    `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
    person.email?.trim() ||
    ""
  );
}

function toAssignedPeople(people?: GivenGroupedGiftPerson[] | null) {
  return (people ?? []).reduce<GiftRowPerson[]>((accumulator, person) => {
    const name = toDisplayName(person);

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

function mapParticipant(
  participant: GiftingEventParticipant,
): DetailParticipant | null {
  const actor = participant.eventContact;

  if (!actor) {
    return null;
  }

  const fullName = `${actor.firstName} ${actor.lastName}`.trim() || "Participant";
  const { bg, color } = getParticipantStyle(participant.id || actor.id || fullName);

  return {
    id: participant.id,
    name: fullName,
    role: participant.role === "creator" ? "Admin" : "Participant",
    initials: toInitials(actor.firstName, actor.lastName),
    bg,
    color,
    email: actor.email || "",
  };
}

function buildGiftRows(gifts: GivenGroupedGift[]): GiftRow[] {
  return gifts.map((gift, index) => {
    const assignedPeople = toAssignedPeople(gift.people);
    const recipientCount =
      gift.recipientCount ?? (assignedPeople.length > 0 ? assignedPeople.length : 0);

    return {
      id:
        gift.participantGiftId?.trim() ||
        gift.productSlug?.trim() ||
        `${gift.title?.trim() || "gift"}-${index}`,
      title: gift.title?.trim() || "Selected gift",
      imageUrl: gift.imageUrl?.trim() || "",
      conditionLabel: formatConditionLabel(gift.condition),
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

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-4 sm:px-5">
      <p className="text-[14px] font-[500] text-[#434343]">{label}</p>
      <p className="mt-4 text-[16px] font-[600] text-[#1E1E1E] sm:mt-5">
        {value}
      </p>
    </div>
  );
}

function ParticipantAvatar({ participant }: { participant: DetailParticipant }) {
  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        backgroundColor: participant.bg,
        color: participant.color,
      }}
    >
      {participant.initials}
    </span>
  );
}

function SidebarParticipantRow({
  participant,
}: {
  participant: DetailParticipant;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <ParticipantAvatar participant={participant} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#1E1E1E]">
            {participant.name}
          </p>
          <p className="truncate text-xs text-[#7D7D7D]">{participant.role}</p>
        </div>
      </div>

      <button
        type="button"
        aria-label={`More actions for ${participant.name}`}
        onClick={() => toast("Participant actions will be connected next.")}
        className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
      >
        <MoreHorizontal className="size-4" />
      </button>
    </div>
  );
}

function GiftNameCell({ gift }: { gift: GiftRow }) {
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
  const { bg, color } = getParticipantStyle(name);

  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white text-[9px] font-semibold"
      style={{ backgroundColor: bg, color }}
      title={name}
    >
      {toInitials(name.split(" ")[0], name.split(" ").slice(1).join(" "))}
    </span>
  );
}

function AssignedPeopleCell({
  people,
  recipientCount,
}: {
  people: GiftRowPerson[];
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

function GiftStatusPill({ status }: { status: GiftRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
        status === "Assigned"
          ? "bg-[#E6F7EC] text-[#1FAB54]"
          : "bg-[#FFF1DD] text-[#C28A00]",
      )}
    >
      {status}
    </span>
  );
}

export default function GiftingEventDetailsScreen({
  giftingEventId,
}: GiftingEventDetailsScreenProps) {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const [currentGiftPage, setCurrentGiftPage] = useState(1);
  const [giftSearchValue, setGiftSearchValue] = useState("");
  const [debouncedGiftSearchValue, setDebouncedGiftSearchValue] = useState("");
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isParticipantListExpanded, setIsParticipantListExpanded] =
    useState(false);

  const deleteGiftingEventMutation = useDeleteGiftingEventMutation();
  const {
    data: giftingEvent,
    isLoading,
    isError,
    refetch,
  } = useGiftingEventQuery(giftingEventId);
  const {
    data: eventGivenGiftsResponse,
    isFetching: isEventGivenGiftsFetching,
    isLoading: isEventGivenGiftsLoading,
    isError: isEventGivenGiftsError,
    refetch: refetchEventGivenGifts,
  } = useEventGivenGroupedGiftsQuery(
    giftingEvent?.eventId ?? null,
    {
      page: currentGiftPage,
      per_page: 10,
      searchQuery: debouncedGiftSearchValue,
    },
    {
      enabled: Boolean(giftingEvent?.eventId),
    },
  );

  const canManageDetail = useMemo(
    () =>
      canManageGiftingEvent(giftingEvent, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, giftingEvent],
  );

  const editFlowSelection = useGiftFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildGiftFlowSelectionKey(
          "edit",
          giftingEventId,
          giftingEvent?.eventId ?? null,
        )
      ] ?? null,
  );
  const createFlowSelection = useGiftFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildGiftFlowSelectionKey(
          "create",
          giftingEventId,
          giftingEvent?.eventId ?? null,
        )
      ] ?? null,
  );

  const detail = useMemo(() => {
    const record = giftingEvent;

    if (!record) {
      return null;
    }

    const participants = (record.event.participants ?? [])
      .map((participant) => mapParticipant(participant))
      .filter((participant): participant is DetailParticipant => Boolean(participant));
    const createdBy = record.event.createdBy
      ? `${record.event.createdBy.firstName} ${record.event.createdBy.lastName}`.trim()
      : "Unknown";

    return {
      title: record.event.title || "Untitled Event",
      createdBy: createdBy || "Unknown",
      createdAt: formatMonthYear(record.createdAt),
      status: formatStatus(record),
      eventDate: formatDate(record.event.eventDate),
      giftBudget: formatCurrency(record.giftBudget, record.currency?.trim() || "NGN"),
      gifts: String(eventGivenGiftsResponse?.data.total ?? 0),
      totalParticipants: String(participants.length),
      participants,
      eventId: record.eventId,
    };
  }, [eventGivenGiftsResponse?.data.total, giftingEvent]);

  const sourceFlowSelection =
    editFlowSelection?.lastVisitedStep ? editFlowSelection : createFlowSelection;
  const resumeStep =
    sourceFlowSelection?.lastVisitedStep &&
    isGiftModalStep(sourceFlowSelection.lastVisitedStep)
      ? sourceFlowSelection.lastVisitedStep
      : "event";

  const giftRows = useMemo(
    () => buildGiftRows(eventGivenGiftsResponse?.data?.data ?? []),
    [eventGivenGiftsResponse?.data?.data],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedGiftSearchValue(giftSearchValue.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [giftSearchValue]);

  useEffect(() => {
    setCurrentGiftPage(1);
  }, [debouncedGiftSearchValue]);

  const allSelectedGiftIds = giftRows.map((gift) => gift.id);
  const allChecked =
    allSelectedGiftIds.length > 0 &&
    allSelectedGiftIds.every((giftId) => selectedGiftIds.includes(giftId));

  const toggleAllGifts = () => {
    if (allChecked) {
      setSelectedGiftIds((current) =>
        current.filter((giftId) => !allSelectedGiftIds.includes(giftId)),
      );
      return;
    }

    setSelectedGiftIds((current) =>
      Array.from(new Set([...current, ...allSelectedGiftIds])),
    );
  };

  const toggleGift = (giftId: string) => {
    setSelectedGiftIds((current) =>
      current.includes(giftId)
        ? current.filter((currentGiftId) => currentGiftId !== giftId)
        : [...current, giftId],
    );
  };

  const visibleParticipants = isParticipantListExpanded
    ? detail?.participants ?? []
    : (detail?.participants ?? []).slice(0, 6);

  const handleOpenEditFlow = () => {
    if (!detail || !canManageDetail) {
      return;
    }

    router.push(
      buildGiftFlowHref(
        resumeStep,
        "edit",
        detail.eventId,
        giftingEventId,
      ),
    );
  };

  const handleDelete = async () => {
    try {
      const response = await deleteGiftingEventMutation.mutateAsync(
        giftingEventId,
      );
      toast.success(response.message);
      setIsDeleteModalOpen(false);
      router.push("/dashboard/gifts");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this gifting event right now.",
      );
    }
  };

  const giftTableData: TableData<GiftRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAllGifts}
            aria-label="Select all gifts"
          />
        ),
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "w-[36px] px-3 py-3",
        render: (row) => (
          <Checkbox
            checked={selectedGiftIds.includes(row.id)}
            onChange={() => toggleGift(row.id)}
            aria-label={`Select ${row.title}`}
          />
        ),
      },
      {
        id: "title",
        header: "Gifts Name",
        headerClassName: "min-w-[220px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <GiftNameCell gift={row} />,
      },
      {
        id: "category",
        header: "Category",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        accessor: "categoryLabel",
      },
      {
        id: "assignedTo",
        header: "Assigned to",
        headerClassName: "min-w-[170px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => (
          <AssignedPeopleCell
            people={row.assignedPeople}
            recipientCount={row.recipientCount}
          />
        ),
      },
      {
        id: "amount",
        header: "Amount",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3 font-medium",
        accessor: "amount",
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <GiftStatusPill status={row.status} />,
      },
    ],
    rows: giftRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[12px] last:border-r last:rounded-r-[12px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selectedGiftIds.includes(row.id) ? "" : "group"),
    emptyState: isEventGivenGiftsLoading || isEventGivenGiftsFetching ? (
      <TableLoadingState rows={5} />
    ) : (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">
          {isEventGivenGiftsError
            ? "Unable to load gifting event gifts."
            : "No gift items found."}
        </p>
        {isEventGivenGiftsError ? (
          <button
            type="button"
            onClick={() => refetchEventGivenGifts()}
            className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        ) : null}
      </div>
    ),
    emptyRowClassName: "bg-white",
  };

  if (isLoading) {
    return (
      <EventDetailScreenSkeleton
        backHref="/dashboard/gifts"
        backLabel="View Details"
      />
    );
  }

  if (isError || !detail) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/gifts" label="View Details" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-6 text-center sm:p-10">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this gifting event right now.
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
      <BackLink href="/dashboard/gifts" label="View Details" />

      <section>
        <div className="flex flex-col gap-5 pb-5 sm:pb-6">
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
              canManageDetail ? (
                <>
                  <Button
                    type="button"
                    onClick={handleOpenEditFlow}
                    className="h-10 rounded-full bg-[#3300C9] px-5 text-sm font-medium text-white hover:bg-[#2D00B4]"
                  >
                    <PencilIcon className="size-4" />
                    Edit Event
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
              ) : null
            }
          />

          <div className="overflow-hidden rounded-[20px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              <SummaryStat label="Event Date" value={detail.eventDate} />
              <SummaryStat label="Gift Budget" value={detail.giftBudget} />
              <SummaryStat label="Gifts" value={detail.gifts} />
              <SummaryStat
                label="Total Participants"
                value={detail.totalParticipants}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[16px] font-[600] text-[#000000]">
                  Gift Items
                </h2>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-[220px]">
                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
                    <Input
                      value={giftSearchValue}
                      onChange={(event) => setGiftSearchValue(event.target.value)}
                      placeholder="Search gift......"
                      className="h-[44px] rounded-[16px] border-[#F0EEFF] pl-9 text-xs text-[#434343] placeholder:text-[#9A97A5] focus-visible:border-[#D6CCF5] focus-visible:ring-[#D6CCF5]/40"
                    />
                  </div>

                  <button
                    type="button"
                    aria-label="Filter gifting event gifts"
                    onClick={() => {
                      toast("Gift filters will be connected next.");
                    }}
                    className="flex size-[44px] shrink-0 items-center justify-center rounded-[12px] border border-[#F0EEFF] bg-white transition-colors hover:bg-[#F6F2FF]"
                  >
                    <FilterIcon className="size-4 text-[#434343]" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[720px]">
                  <Table
                    data={giftTableData}
                    wrapperClassName="w-full"
                    tableClassName="min-w-full table-auto border-separate border-spacing-y-2"
                  />
                </div>
              </div>

              <Pagination
                total={Math.max(eventGivenGiftsResponse?.data.totalPages ?? 1, 1)}
                initialPage={currentGiftPage}
                onPageChange={setCurrentGiftPage}
                className="mt-4"
              />
            </div>

            <aside className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[16px] font-semibold text-[#000000]">
                  Participants ({detail.participants.length})
                </h2>
              </div>

              <div className="mt-4">
                {visibleParticipants.map((participant) => (
                  <SidebarParticipantRow
                    key={participant.id}
                    participant={participant}
                  />
                ))}
              </div>

              {detail.participants.length > 6 ? (
                <button
                  type="button"
                  onClick={() =>
                    setIsParticipantListExpanded((current) => !current)
                  }
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  {isParticipantListExpanded ? "See Less" : "See More"}
                  <ChevronDownIcon
                    className={cn(
                      "size-4 transition-transform",
                      isParticipantListExpanded && "rotate-180",
                    )}
                  />
                </button>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete Gifting Event"
        description={`Are you sure you want to delete ${detail.title}?`}
        confirmText="Delete"
        isLoading={deleteGiftingEventMutation.isPending}
        closeOnOverlayClick={false}
      />
    </div>
  );
}

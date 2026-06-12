"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, SearchIcon } from "lucide-react";
import toast from "react-hot-toast";
import ViewIcon from "@/components/icons/ViewIcon";
import EditPencilIcon from "@/components/icons/EditPencilIcon";
import DeleteIcon from "@/components/icons/DeleteIcon";
import FilterIcon from "@/components/icons/FilterIcon";
import InviteEmailIcon from "@/components/icons/InviteEmailIcon";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import { Input } from "@/components/ui/input";
import Checkbox from "@/components/Checkbox";
import Table, { type TableData } from "@/components/ui/Table";
import Pagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { useDeleteDrawNameEventMutation } from "@/features/draw-name-events/hooks/useDeleteDrawNameEventMutation";
import { useDrawNameEventsQuery } from "@/features/draw-name-events/hooks/useDrawNameEventsQuery";
import {
  canManageDrawNameEvent,
  isDrawNameEventParticipant,
} from "@/features/draw-name-events/access";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import type {
  DrawNameEventListItem,
  DrawNameEventListParticipant,
} from "@/features/draw-name-events/types";
import {
  isParticipantDrawNameFlowStep,
  type DrawNameModalStep,
} from "@/screens/draw-names/modal-steps";
import {
  type DrawStatus,
  type ParticipantBadge,
} from "@/screens/draw-names/data";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildDrawNameFlowHref,
  buildDrawNameFlowSelectionKey,
  useDrawNameFlowStore,
} from "@/stores/draw-name-flow-store";

const statusStyles: Record<DrawStatus, string> = {
  Completed: "bg-[#E6F7EC] text-[#1FAB54]",
  Draft: "bg-[#FFF1DD] text-[#C28A00]",
  Ongoing: "bg-[#EFE6FD] text-[#3300C9]",
  "In Progress": "bg-[#EFE6FD] text-[#3300C9]",
};

const participantPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
] as const;

type DrawActivityRow = {
  id: string;
  drawNameEventId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  budget: string;
  createdBy: string;
  status: DrawStatus;
  isDrawCompleted: boolean;
  participants: ParticipantBadge[];
  canManage: boolean;
  canDraw: boolean;
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

function toInitials(firstName?: string | null, lastName?: string | null) {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase();

  return initials || "NA";
}

function getParticipantStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return participantPalette[hash % participantPalette.length];
}

function toNumericId(seed: string) {
  return Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );
}

function mapParticipantBadge(
  participant: DrawNameEventListParticipant,
  drawEvent: DrawNameEventListItem,
): ParticipantBadge | null {
  const actor = participant.eventContact ?? participant.user;

  if (!actor) {
    return null;
  }

  const fullName = `${actor.firstName} ${actor.lastName}`.trim() || "Participant";
  const { bg, color } = getParticipantStyle(
    participant.id || actor.id || fullName,
  );

  return {
    id: toNumericId(participant.id || actor.id || fullName),
    name: fullName,
    role: participant.role === "creator" ? "Admin" : "Participant",
    initials: toInitials(actor.firstName, actor.lastName),
    bg,
    color,
    status: drawEvent.isDrawCompleted ? "Drawn" : "Pending",
  };
}

function resolveDrawStatus(drawEvent: DrawNameEventListItem): DrawStatus {
  const normalizedStatus = drawEvent.event.status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "draft") {
    return "Draft";
  }

  if (normalizedStatus === "ongoing" || drawEvent.isDrawCompleted) {
    return "Ongoing";
  }

  return "In Progress";
}

function mapDrawActivityRow(
  drawEvent: DrawNameEventListItem,
  currentUserId: string | null,
  currentContactId: string | null,
): DrawActivityRow {
  const accessOptions = {
    currentUserId,
    currentContactId,
  };
  const createdBy = drawEvent.event.createdBy
    ? `${drawEvent.event.createdBy.firstName} ${drawEvent.event.createdBy.lastName}`.trim()
    : "Unknown";

  const participants = (drawEvent.event.participants ?? [])
    .map((participant) => mapParticipantBadge(participant, drawEvent))
    .filter((participant): participant is ParticipantBadge => Boolean(participant));

  return {
    id: drawEvent.id,
    drawNameEventId: drawEvent.id,
    eventId: drawEvent.eventId,
    eventName: drawEvent.event.title || "Untitled Event",
    eventDate: formatDate(drawEvent.event.eventDate),
    budget: formatCurrency(drawEvent.budget || drawEvent.maximumSpend),
    createdBy: createdBy || "Unknown",
    status: resolveDrawStatus(drawEvent),
    isDrawCompleted: drawEvent.isDrawCompleted,
    participants,
    canManage: canManageDrawNameEvent(drawEvent, accessOptions),
    canDraw:
      resolveDrawStatus(drawEvent) === "Ongoing" &&
      isDrawNameEventParticipant(drawEvent, accessOptions),
  };
}

function ParticipantStack({
  participants,
  overflowCount,
}: {
  participants: ParticipantBadge[];
  overflowCount: number;
}) {
  return (
    <div className="flex items-center -space-x-2">
      {participants.map((participant, index) => (
        <span
          key={`${participant.initials}-${index}`}
          className="flex size-8 items-center justify-center rounded-full border-1 border-white text-[9px] font-semibold"
          style={{ backgroundColor: participant.bg, color: participant.color }}
        >
          {participant.initials}
        </span>
      ))}
      {overflowCount > 0 ? (
        <span className="flex size-8 items-center justify-center rounded-full border-1 border-white bg-[#EFE6FD] text-[9px] font-semibold text-[#3300C9]">
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: DrawStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

function DrawNameMenuIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.333 9.167v6.666c0 .442.176.866.488 1.179.313.312.737.488 1.179.488h10c.442 0 .866-.176 1.178-.488.313-.313.489-.737.489-1.179V9.167"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.583c0-.773-.308-1.515-.854-2.061a2.917 2.917 0 0 0-2.063-.855c-.552 0-1.082.22-1.473.61a2.083 2.083 0 0 0-.61 1.473A2.083 2.083 0 0 0 7.083 5.833H10m0-1.25v1.25m0-1.25c0-.773.307-1.515.854-2.061a2.917 2.917 0 0 1 2.063-.855c.552 0 1.082.22 1.473.61.39.391.61.921.61 1.473 0 .273-.053.544-.158.794s-.26.477-.452.668c-.193.193-.422.346-.674.45-.252.105-.523.158-.795.158H10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10 9.167V17.5M2.5 5.833h15v3.334h-15V5.833Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendInviteMenuIcon({ disabled }: { disabled?: boolean }) {
  return (
    <InviteEmailIcon
      className={cn(
        "size-4 shrink-0 text-black",
        disabled && "opacity-40 grayscale",
      )}
    />
  );
}

function DrawActivityRowActions({
  row,
  onRequestDelete,
}: {
  row: DrawActivityRow;
  onRequestDelete: (row: DrawActivityRow) => void;
}) {
  const router = useRouter();
  const isCompletedInviteState = row.status === "Completed";
  const isOngoingInviteState = row.status === "Ongoing";
  const isInviteState = isCompletedInviteState || isOngoingInviteState;
  const creatorFlowSelection = useDrawNameFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildDrawNameFlowSelectionKey(
          "creator",
          row.drawNameEventId,
          row.eventId,
        )
      ] ?? null,
  );
  const participantFlowSelection = useDrawNameFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildDrawNameFlowSelectionKey(
          "participant",
          row.drawNameEventId,
          row.eventId,
        )
      ] ?? null,
  );
  const { data: myParticipantResponse } = useMyParticipantQuery(row.eventId, {
    enabled: !row.canManage && row.canDraw,
  });

  const isParticipantDrawDisabled =
    !row.canManage && myParticipantResponse?.data?.isPairActive === true;
  const canOpenSecondaryAction = row.canManage
    ? !isCompletedInviteState
    : row.canDraw && !isParticipantDrawDisabled;
  const storedParticipantResumeStep =
    participantFlowSelection?.lastVisitedStep ?? null;
  const participantResumeStep = isParticipantDrawNameFlowStep(
    storedParticipantResumeStep,
  )
    ? (storedParticipantResumeStep as DrawNameModalStep)
    : ("wishlist-gifts" as DrawNameModalStep);
  const resumeStep = row.canManage
    ? isOngoingInviteState
      ? ("draw-invite" as DrawNameModalStep)
      : creatorFlowSelection?.lastVisitedStep || ("event" as DrawNameModalStep)
    : participantResumeStep;

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More options for ${row.eventName}`}
            className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-white hover:text-[#434343]"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-44 rounded-xl border-[#ECE8F7] bg-white p-1.5 shadow-[0_16px_40px_rgba(51,0,201,0.08)]"
        >
          <DropdownMenuItem
            onSelect={() =>
              router.push(`/dashboard/draw-names/${row.drawNameEventId}`)
            }
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            <ViewIcon className="size-4 text-[#292D32]" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canOpenSecondaryAction}
            onSelect={() => {
              if (!canOpenSecondaryAction) {
                return;
              }

              router.push(
                buildDrawNameFlowHref(
                  resumeStep,
                  row.eventId,
                  row.drawNameEventId,
                ),
              );
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm focus:bg-[#F6F2FF]",
              canOpenSecondaryAction
                ? "cursor-pointer text-[#434343] focus:text-[#3300C9]"
                : "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]",
            )}
          >
            {row.canManage ? (
              isInviteState ? (
                <SendInviteMenuIcon disabled={!canOpenSecondaryAction} />
              ) : (
                <EditPencilIcon
                  className={cn(
                    "size-4",
                    canOpenSecondaryAction ? "text-[#292D32]" : "text-[#B8B5C3]",
                  )}
                />
              )
            ) : (
              <DrawNameMenuIcon
                className={cn(
                  "size-4",
                  canOpenSecondaryAction ? "text-[#292D32]" : "text-[#B8B5C3]",
                )}
              />
            )}
            {row.canManage
              ? isInviteState
                ? "Send Invite"
                : "Edit Draw"
              : "Draw Name"}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#F0ECFA]" />
          <DropdownMenuItem
            disabled={isInviteState || !row.canManage}
            onSelect={() => {
              if (isInviteState || !row.canManage) {
                return;
              }

              onRequestDelete(row);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm focus:bg-[#FDEEEE]",
              isInviteState || !row.canManage
                ? "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]"
                : "cursor-pointer text-[#E04F4F] focus:text-[#E04F4F]",
            )}
          >
            <DeleteIcon
              className={cn(
                "size-4",
                isInviteState || !row.canManage
                  ? "text-[#B8B5C3]"
                  : "text-[#DC2626]",
              )}
            />
            Delete Draw
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function DrawNamesActivity() {
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<DrawActivityRow | null>(
    null,
  );
  const perPage = 10;
  const deleteDrawNameEventMutation = useDeleteDrawNameEventMutation();
  const {
    data: drawNameEventsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useDrawNameEventsQuery({
    per_page: perPage,
    page,
  });

  const rows = useMemo(() => {
    const drawNameEvents = drawNameEventsResponse?.data.data ?? [];

    return drawNameEvents.map((drawEvent) =>
      mapDrawActivityRow(
        drawEvent,
        authUser?.id?.trim() || null,
        currentContactId?.trim() || null,
      ),
    );
  }, [authUser?.id, currentContactId, drawNameEventsResponse]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => {
      const participantNames = row.participants.map((participant) => participant.name);
      const haystack = [row.eventName, row.createdBy, ...participantNames]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [rows, searchValue]);

  useEffect(() => {
    setSelected((current) =>
      current.filter((selectedId) =>
        filteredRows.some((row) => row.id === selectedId),
      ),
    );
  }, [filteredRows]);

  const allChecked =
    filteredRows.length > 0 && selected.length === filteredRows.length;

  const toggleAll = () => {
    if (allChecked) {
      setSelected([]);
      return;
    }

    setSelected(filteredRows.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((rowId) => rowId !== id)
        : [...previous, id],
    );
  };

  const handleDeleteDraw = async () => {
    if (!pendingDeleteRow) {
      return;
    }

    try {
      const response = await deleteDrawNameEventMutation.mutateAsync(
        pendingDeleteRow.drawNameEventId,
      );
      toast.success(response.message);
      setPendingDeleteRow(null);
      setSelected((current) =>
        current.filter((selectedId) => selectedId !== pendingDeleteRow.id),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this draw right now.",
      );
    }
  };

  const tableData: TableData<DrawActivityRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Select all draws"
          />
        ),
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "w-[36px] px-3 py-3",
        render: (row) => (
          <Checkbox
            checked={selected.includes(row.id)}
            onChange={() => toggleRow(row.id)}
            aria-label={`Select ${row.eventName}`}
          />
        ),
      },
      {
        id: "eventName",
        header: "Event Name",
        accessor: "eventName",
        headerClassName: "min-w-[140px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3 font-medium",
      },
      {
        id: "eventDate",
        header: "Event Date",
        accessor: "eventDate",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "budget",
        header: "Budget",
        accessor: "budget",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "createdBy",
        header: "Created by",
        accessor: "createdBy",
        headerClassName: "min-w-[130px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "participants",
        header: "Participants",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => {
          const visibleParticipants = row.participants.slice(0, 3);
          const overflowCount = Math.max(
            row.participants.length - visibleParticipants.length,
            0,
          );

          return (
            <ParticipantStack
              participants={visibleParticipants}
              overflowCount={overflowCount}
            />
          );
        },
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        id: "actions",
        header: null,
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => (
          <DrawActivityRowActions
            row={row}
            onRequestDelete={setPendingDeleteRow}
          />
        ),
      },
    ],
    rows: filteredRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7d7d7d]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[12px] last:border-r last:rounded-r-[12px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selected.includes(row.id) ? "" : "group"),
    emptyState: (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">
          {isLoading || isFetching
            ? "Loading recent draw activities..."
            : isError
              ? "Unable to load recent draw activities."
              : "No draw activity found."}
        </p>
        {isError ? (
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        ) : null}
      </div>
    ),
    emptyRowClassName: "bg-white",
  };

  return (
    <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[14px] font-semibold text-[#434343]">
          Recent Activity
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-[260px]">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search name......."
              className="h-[48px] rounded-[16px] border-[#F0EEFF] pl-9 text-xs text-[#434343] placeholder:text-[#9A97A5] focus-visible:border-[#d6ccf5] focus-visible:ring-[#d6ccf5]/40"
            />
          </div>

          <button
            type="button"
            aria-label="Filter activity"
            className="flex size-[48px] shrink-0 items-center justify-center rounded-[12px] border border-[#F0EEFF] bg-white transition-colors hover:bg-[#F6F2FF]"
          >
            <FilterIcon className="size-4 text-[#434343]" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[760px]">
          <Table
            data={tableData}
            wrapperClassName="w-full"
            tableClassName="min-w-full table-auto border-separate border-spacing-y-2"
          />
        </div>
      </div>

      <Pagination
        total={Math.max(drawNameEventsResponse?.data.totalPages ?? 1, 1)}
        initialPage={drawNameEventsResponse?.data.page ?? page}
        onPageChange={setPage}
        className="mt-4"
      />

      <ConfirmationModal
        open={Boolean(pendingDeleteRow)}
        onClose={() => setPendingDeleteRow(null)}
        onConfirm={handleDeleteDraw}
        action="delete"
        title="Delete Draw"
        description={
          pendingDeleteRow
            ? `Are you sure you want to delete ${pendingDeleteRow.eventName}?`
            : "Are you sure you want to delete this draw?"
        }
        confirmText="Delete"
        isLoading={deleteDrawNameEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </section>
  );
}

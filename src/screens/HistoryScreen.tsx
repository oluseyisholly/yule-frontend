"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ViewIcon from "@/components/icons/ViewIcon";
import {
  MoreHorizontal,
  SearchIcon,
  Settings2Icon,
  ShoppingBagIcon,
} from "lucide-react";
import Checkbox from "@/components/Checkbox";
import PageHeader from "@/components/dashboard/PageHeader";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { TableLoadingState } from "@/components/ui/context-skeletons";
import Table, { type TableData } from "@/components/ui/Table";
import { Input } from "@/components/ui/input";
import { useParticipatedEventsQuery } from "@/features/events/hooks/useParticipatedEventsQuery";
import type {
  ParticipatedEventActor,
  ParticipatedEventParticipant,
  ParticipatedEventRecord,
} from "@/features/events/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type HistoryParticipant = {
  id: string;
  name: string;
  initials: string;
  bg: string;
  color: string;
};

type HistoryRow = {
  id: string;
  eventName: string;
  eventDate: string;
  groupName: string;
  createdBy: string;
  createdById: string | null;
  createdByEmail: string | null;
  eventOption: string | null;
  drawNameEventId: string | null;
  wishlistEventId: string | null;
  giftingEventId: string | null;
  participants: HistoryParticipant[];
};

const participantPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
  { color: "#5A4CB8", bg: "#E8E6F8" },
] as const;

const HISTORY_PAGE_SIZE = 6;

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toDisplayName(person?: ParticipatedEventActor | null) {
  if (!person) {
    return "";
  }

  return (
    `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
    person.email?.trim() ||
    ""
  );
}

function toParticipantInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getParticipantStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return participantPalette[hash % participantPalette.length];
}

function mapHistoryParticipant(
  participant: ParticipatedEventParticipant,
): HistoryParticipant | null {
  const actor = participant.eventContact;
  const name = toDisplayName(actor);

  if (!name) {
    return null;
  }

  const { bg, color } = getParticipantStyle(participant.id || name);

  return {
    id: participant.id,
    name,
    initials: toParticipantInitials(name) || "HY",
    bg,
    color,
  };
}

function mapHistoryRow(record: ParticipatedEventRecord): HistoryRow {
  const participants = (record.participants ?? [])
    .map(mapHistoryParticipant)
    .filter((participant): participant is HistoryParticipant =>
      Boolean(participant),
    );

  return {
    id: record.id,
    eventName:
      record.eventType?.name?.trim() ||
      record.title?.trim() ||
      "Untitled event",
    eventDate: formatDate(record.eventDate),
    groupName: record.title?.trim() || "Untitled group",
    createdBy: toDisplayName(record.createdBy) || "—",
    createdById: record.createdBy?.id?.trim() || null,
    createdByEmail: record.createdBy?.email?.trim() || null,
    eventOption: record.eventOption?.trim() || null,
    drawNameEventId: record.drawNameEvent?.id?.trim() || null,
    wishlistEventId: record.wishlistEvent?.id?.trim() || null,
    giftingEventId: record.giftingEvent?.id?.trim() || null,
    participants,
  };
}

function HeaderActionIconButton({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full border border-[#ECE8F7] bg-white text-[#7A9851] transition-colors hover:bg-[#F6FBEF] hover:text-[#5F7A3C]"
    >
      {children}
    </button>
  );
}

function ParticipantStack({
  participants,
}: {
  participants: HistoryParticipant[];
}) {
  const visibleParticipants = participants.slice(0, 2);
  const overflowCount = Math.max(participants.length - visibleParticipants.length, 0);

  return (
    <div className="flex items-center -space-x-2">
      {visibleParticipants.map((participant) => (
        <span
          key={participant.id}
          className="flex size-8 items-center justify-center rounded-full border border-white text-[9px] font-semibold"
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
        <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
          +{overflowCount}
        </span>
      ) : null}
    </div>
  );
}

function HistoryRowActions({
  row,
  onView,
}: {
  row: HistoryRow;
  onView: (row: HistoryRow) => void;
}) {
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
            onSelect={() => onView(row)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            <ViewIcon className="size-4 text-[#292D32]" />
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const authUserEmail = useAuthStore((state) => state.user?.email ?? null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const handleViewHistoryEvent = useCallback(
    (row: HistoryRow) => {
      const normalizedCurrentEmail = authUserEmail?.trim().toLowerCase() || null;
      const normalizedCreatedByEmail =
        row.createdByEmail?.trim().toLowerCase() || null;
      const normalizedEventOption = row.eventOption?.trim().toLowerCase() || null;
      const isCreator =
        (Boolean(currentContactId) && row.createdById === currentContactId) ||
        (Boolean(normalizedCurrentEmail) &&
          normalizedCurrentEmail === normalizedCreatedByEmail);

      if (normalizedEventOption === "draw_name") {
        if (!row.drawNameEventId) {
          toast.error("Unable to open this draw name event right now.");
          return;
        }

        router.push(`/dashboard/draw-names/${row.drawNameEventId}`);
        return;
      }

      if (
        normalizedEventOption === "wishlist" ||
        normalizedEventOption === "wish_list" ||
        normalizedEventOption === "wish-list"
      ) {
        if (!row.wishlistEventId) {
          toast.error("Unable to open this wish list event right now.");
          return;
        }

        router.push(`/dashboard/wish-list/${row.wishlistEventId}`);
        return;
      }

      if (normalizedEventOption === "gifting") {
        if (isCreator) {
          if (!row.giftingEventId) {
            toast.error("Unable to open this gifting event right now.");
            return;
          }

          router.push(`/dashboard/gifts/${row.giftingEventId}`);
          return;
        }

        router.push("/dashboard/gifts?tab=received");
        return;
      }

      toast.error("Unable to resolve this event view right now.");
    },
    [authUserEmail, currentContactId, router],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  const {
    data: participatedEventsResponse,
    isLoading: isParticipatedEventsLoading,
    isFetching: isParticipatedEventsFetching,
    isError: isParticipatedEventsError,
    refetch: refetchParticipatedEvents,
  } = useParticipatedEventsQuery({
    page: currentPage,
    per_page: HISTORY_PAGE_SIZE,
    searchQuery: debouncedQuery,
  });

  const historyRows = useMemo(
    () =>
      (participatedEventsResponse?.data.data ?? []).map((record) =>
        mapHistoryRow(record),
      ),
    [participatedEventsResponse?.data.data],
  );

  const totalPages = Math.max(
    1,
    participatedEventsResponse?.data.totalPages ?? 1,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => historyRows.some((row) => row.id === id)),
    );
  }, [historyRows]);

  const allChecked =
    historyRows.length > 0 &&
    historyRows.every((row) => selectedIds.includes(row.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(historyRows.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const tableData: TableData<HistoryRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Select all history rows"
          />
        ),
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "w-[36px] px-3 py-3",
        render: (row) => (
          <Checkbox
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleRow(row.id)}
            aria-label={`Select ${row.eventName}`}
          />
        ),
      },
      {
        id: "eventName",
        header: "Event Name",
        headerClassName: "min-w-[130px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3 font-medium",
        render: (row) => (
          <button
            type="button"
            onClick={() => handleViewHistoryEvent(row)}
            className="text-left text-[#434343] transition-colors hover:text-[#3300C9]"
          >
            {row.eventName}
          </button>
        ),
      },
      {
        id: "eventDate",
        header: "Event Date",
        accessor: "eventDate",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "groupName",
        header: "Group name",
        accessor: "groupName",
        headerClassName: "min-w-[130px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "createdBy",
        header: "Created by",
        accessor: "createdBy",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "participants",
        header: "Participants",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) =>
          row.participants.length > 0 ? (
            <ParticipantStack participants={row.participants} />
          ) : (
            <span className="text-[#9A97A5]">—</span>
          ),
      },
      {
        id: "actions",
        header: null,
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => (
          <HistoryRowActions row={row} onView={handleViewHistoryEvent} />
        ),
      },
    ],
    rows: historyRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[14px] last:border-r last:rounded-r-[14px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selectedIds.includes(row.id) ? "" : "group"),
    emptyState:
      isParticipatedEventsLoading || isParticipatedEventsFetching ? (
        <TableLoadingState rows={6} />
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-[#7D7D7D]">
            {isParticipatedEventsError
              ? "Unable to load your history right now."
              : "No history records found."}
          </p>
          {isParticipatedEventsError ? (
            <button
              type="button"
              onClick={() => refetchParticipatedEvents()}
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
    <div className="space-y-6">
      <PageHeader
        title="My History"
        description="See all your activities on Yule"
        actions={
          <>
            <HeaderActionIconButton label="History actions">
              <ShoppingBagIcon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>

            <HeaderActionIconButton label="History settings">
              <Settings2Icon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>
          </>
        }
      />

      <section className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[#F1EDF8] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
              My History
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[320px]">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name......"
                className="h-10 rounded-[16px] border-[#ECE8F7] bg-white pl-9 text-sm text-[#434343] shadow-none placeholder:text-[#9A97A5] focus-visible:border-[#D7CEF2] focus-visible:ring-0"
              />
            </div>

            <button
              type="button"
              aria-label="Filter history"
              className="flex size-10 items-center justify-center rounded-[12px] border border-[#ECE8F7] bg-white text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
            >
              <FilterIcon className="size-4 text-[#434343]" aria-hidden />
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table
            data={tableData}
            tableClassName="w-full min-w-[940px] border-separate border-spacing-y-3"
          />
        </div>

        <div className="mt-4">
          <Pagination
            total={totalPages}
            initialPage={currentPage}
            onPageChange={setCurrentPage}
            previousLabel="← Previous"
            nextLabel="Next →"
          />
        </div>
      </section>
    </div>
  );
}

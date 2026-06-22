"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  CalendarDaysIcon,
  LayoutGridIcon,
  MapPinIcon,
  ListIcon,
  MoreHorizontal,
  SearchIcon,
  Settings2Icon,
  TrendingUpIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import PageHeader from "@/components/dashboard/PageHeader";
import FilterIcon from "@/components/icons/FilterIcon";
import ViewIcon from "@/components/icons/ViewIcon";
import { hangoutRows } from "@/features/hangouts/mock-data";
import type {
  HangoutParticipant,
  HangoutRow,
  HangoutStatus,
} from "@/features/hangouts/mock-data";
import Pagination from "@/components/Pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import Table, { type TableData } from "@/components/ui/Table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "grid";

type HangoutMetric = {
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
  icon: ReactNode;
  iconBg: string;
};

const PAGE_SIZE = 5;

const hangoutMetrics: HangoutMetric[] = [
  {
    value: "48",
    label: "Total Hangout",
    hint: "+12% this month",
    hintColor: "#3300C9",
    icon: <CalendarDaysIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />,
    iconBg: "#EFE6FD",
  },
  {
    value: "3",
    label: "People Met",
    icon: <UsersIcon className="size-5 text-[#E9A300]" strokeWidth={1.8} />,
    iconBg: "#FFF1DD",
  },
  {
    value: "6",
    label: "Total this month",
    hint: "+2 new this week",
    hintColor: "#24A959",
    icon: <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />,
    iconBg: "#D9F4E2",
  },
  {
    value: "₦450,000",
    label: "Amount Spent",
    icon: <TrendingUpIcon className="size-5 text-[#FF6E6E]" strokeWidth={1.8} />,
    iconBg: "#FDE0DE",
  },
];

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
      onClick={() => toast(`${label} will be connected next.`)}
      className="flex size-10 items-center justify-center rounded-full border border-[#ECE8F7] bg-white text-[#7A9851] transition-colors hover:bg-[#F6FBEF] hover:text-[#5F7A3C]"
    >
      {children}
    </button>
  );
}

function HangoutMetricCard({ metric }: { metric: HangoutMetric }) {
  return (
    <article className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
      <div className="flex items-start justify-between">
        <span
          className="flex size-11 items-center justify-center rounded-[14px]"
          style={{ backgroundColor: metric.iconBg }}
        >
          {metric.icon}
        </span>

        <button
          type="button"
          aria-label={`${metric.label} options`}
          onClick={() => toast(`${metric.label} options will be connected next.`)}
          className="rounded-full p-1 text-[#B0ACBC] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div className="mt-7">
        <p className="text-[36px] font-semibold leading-none tracking-[-0.04em] text-[#1E1E1E]">
          {metric.value}
        </p>
        <p className="mt-2 text-sm text-[#7D7D7D]">{metric.label}</p>
        {metric.hint ? (
          <p
            className="mt-3 text-sm font-medium"
            style={{ color: metric.hintColor ?? "#3300C9" }}
          >
            {metric.hint}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ParticipantStack({
  participants,
}: {
  participants: HangoutParticipant[];
}) {
  const visibleParticipants = participants.slice(0, 3);
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

function StatusPill({
  status,
  compact = false,
}: {
  status: HangoutStatus;
  compact?: boolean;
}) {
  const className =
    status === "Past"
      ? "bg-[#E6F7EC] text-[#24A959]"
      : "bg-[#FFF1DD] text-[#FF9D1C]";

  return (
    <span
      className={cn(
        compact
          ? "inline-flex min-w-[58px] items-center justify-center rounded-full px-2 py-0.5 text-[9px] font-medium"
          : "inline-flex min-w-[74px] items-center justify-center rounded-full px-3 py-1 text-xs font-medium",
        className,
      )}
    >
      {status}
    </span>
  );
}

function formatHangoutCardDate(value: string) {
  const [day, month, year] = value.split("/");
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);

  if (
    Number.isNaN(parsedDay) ||
    Number.isNaN(parsedMonth) ||
    Number.isNaN(parsedYear)
  ) {
    return value;
  }

  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function HangoutCardMeta({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] leading-tight text-[#7D7D7D]">
      <span className="shrink-0 text-[#7D7D7D]">{icon}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function HangoutVenueCell({ row }: { row: HangoutRow }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-10 overflow-hidden rounded-[10px] border border-[#F0ECFA] bg-[#F7F5FF]">
        <Image
          src={row.image}
          alt={row.venueName}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <span className="font-medium text-[#434343]">{row.venueName}</span>
    </div>
  );
}

function HangoutRowActions({ row }: { row: HangoutRow }) {
  const router = useRouter();

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
            onSelect={() => router.push(`/dashboard/hangouts/${row.id}`)}
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

function HangoutGridCard({ row }: { row: HangoutRow }) {
  const router = useRouter();

  return (
    <article className="rounded-[18px] border border-[#EEEAF7] bg-white p-3 shadow-[0_2px_6px_rgba(33,16,93,0.04)]">
      <div className="relative aspect-[1.58] overflow-hidden rounded-[14px] bg-[#F7F5FF]">
        <Image
          src={row.image}
          alt={row.venueName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute right-2 top-2">
          <StatusPill status={row.status} compact />
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-[13px] font-semibold text-[#1E1E1E]">
          {row.eventName}
        </h3>
        <p className="shrink-0 text-[11px] font-semibold text-[#434343]">
          {row.amount}
        </p>
      </div>

      <div className="mt-1.5">
        <span className="inline-flex max-w-full items-center rounded-full border border-[#FF9D1C] bg-[#FFF1DD] px-2 py-0.5 text-[9px] font-medium text-[#FF9D1C]">
          <span className="truncate">{row.venueName}</span>
        </span>
      </div>

      <div className="mt-2.5 space-y-1.5">
        <HangoutCardMeta
          icon={<CalendarDaysIcon className="size-3" strokeWidth={1.8} />}
        >
          {formatHangoutCardDate(row.checkInDate)}
        </HangoutCardMeta>

        <HangoutCardMeta
          icon={<MapPinIcon className="size-3" strokeWidth={1.8} />}
        >
          {row.venueName}, {row.location}
        </HangoutCardMeta>

        <HangoutCardMeta
          icon={<UsersIcon className="size-3" strokeWidth={1.8} />}
        >
          <ParticipantStack participants={row.participants} />
        </HangoutCardMeta>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/dashboard/hangouts/${row.id}`)}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-full bg-[#3300C9] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#2D00B4]"
        >
          View Details
        </button>

        <div className="shrink-0">
          <HangoutRowActions row={row} />
        </div>
      </div>
    </article>
  );
}

export default function DashboardHangoutsScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return hangoutRows;
    }

    return hangoutRows.filter((row) =>
      [
        row.venueName,
        row.location,
        row.eventName,
        row.checkInDate,
        row.amount,
        row.dateCreated,
        row.status,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, viewMode]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => paginatedRows.some((row) => row.id === id)),
    );
  }, [paginatedRows]);

  const allChecked =
    paginatedRows.length > 0 &&
    paginatedRows.every((row) => selectedIds.includes(row.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(paginatedRows.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const tableData: TableData<HangoutRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Select all hangouts"
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
        id: "venueName",
        header: "Venue",
        headerClassName: "min-w-[180px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <HangoutVenueCell row={row} />,
      },
      {
        id: "location",
        header: "Location",
        accessor: "location",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "eventName",
        header: "Event Name",
        accessor: "eventName",
        headerClassName: "min-w-[170px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "checkInDate",
        header: "Check in Date",
        accessor: "checkInDate",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "participants",
        header: "Participants",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <ParticipantStack participants={row.participants} />,
      },
      {
        id: "amount",
        header: "Amount",
        accessor: "amount",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3 font-medium",
      },
      {
        id: "dateCreated",
        header: "Date Created",
        accessor: "dateCreated",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "min-w-[100px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        id: "actions",
        header: null,
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <HangoutRowActions row={row} />,
      },
    ],
    rows: paginatedRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[14px] last:border-r last:rounded-r-[14px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn(
        "transition-colors",
        selectedIds.includes(row.id) ? "bg-transparent" : "group",
      ),
    emptyState: (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">
          No hangouts match your search right now.
        </p>
      </div>
    ),
    emptyRowClassName: "bg-white",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hangouts"
        description="Relive your celebrations"
        actions={
          <>
            <Button
              type="button"
              onClick={() => toast("Hangout planning flow will be connected next.")}
              className="h-[44px] rounded-full px-4 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-white/35 bg-white/10">
                  <CalendarDaysIcon className="size-4" />
                </span>
                <span>Plan Hangout</span>
              </span>
            </Button>

            <HeaderActionIconButton label="Export hangouts">
              <UploadIcon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>

            <HeaderActionIconButton label="Hangout settings">
              <Settings2Icon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hangoutMetrics.map((metric) => (
          <HangoutMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[#F1EDF8] pb-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
              Hangout History
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
                  viewMode === "list"
                    ? "text-[#3300C9]"
                    : "text-[#9A97A5] hover:text-[#5A4CB8]",
                )}
              >
                <ListIcon className="size-4" />
                <span>Lists</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors",
                  viewMode === "grid"
                    ? "text-[#3300C9]"
                    : "text-[#9A97A5] hover:text-[#5A4CB8]",
                )}
              >
                <LayoutGridIcon className="size-4" />
                <span>Grid</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-[260px] lg:w-[320px]">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
                <Input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search names......."
                  className="h-10 rounded-[16px] border-[#ECE8F7] bg-white pl-9 text-sm text-[#434343] shadow-none placeholder:text-[#9A97A5] focus-visible:border-[#D7CEF2] focus-visible:ring-0"
                />
              </div>

              <button
                type="button"
                aria-label="Filter hangouts"
                onClick={() => toast("Hangout filters will be connected next.")}
                className="flex size-10 items-center justify-center rounded-[12px] border border-[#ECE8F7] bg-white text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
              >
                <FilterIcon className="size-4 text-[#434343]" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="mt-4 overflow-x-auto">
            <Table
              data={tableData}
              tableClassName="w-full min-w-[1120px] border-separate border-spacing-y-3"
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <HangoutGridCard key={row.id} row={row} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-[#7D7D7D]">
                  No hangouts match your search right now.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5">
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

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  CalendarDaysIcon,
  MailIcon,
  MoreHorizontal,
  SendIcon,
  Settings2Icon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import PageHeader from "@/components/dashboard/PageHeader";
import FilterIcon from "@/components/icons/FilterIcon";
import ViewIcon from "@/components/icons/ViewIcon";
import Pagination from "@/components/Pagination";
import Table, { type TableData } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/search-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { cn } from "@/lib/utils";

type ScheduleStatus = "Upcoming" | "Past";

type ScheduleRecipient = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
};

type ScheduleRow = {
  id: string;
  recipient: ScheduleRecipient;
  scheduledDate: string;
  status: ScheduleStatus;
};

type ScheduleMetric = {
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
  icon: ReactNode;
  iconBg: string;
};

const PAGE_SIZE = 5;

const scheduleMetrics: ScheduleMetric[] = [
  {
    value: "48",
    label: "Total Events",
    hint: "+12% this month",
    hintColor: "#3300C9",
    icon: <CalendarDaysIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />,
    iconBg: "#EFE6FD",
  },
  {
    value: "3",
    label: "Total Recipients",
    icon: <UsersIcon className="size-5 text-[#E9A300]" strokeWidth={1.8} />,
    iconBg: "#FFF1DD",
  },
  {
    value: "6",
    label: "Total Events this month",
    hint: "+2 new this week",
    hintColor: "#24A959",
    icon: <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />,
    iconBg: "#D9F4E2",
  },
  {
    value: "$264",
    label: "Amount Spent",
    icon: <TrendingUpIcon className="size-5 text-[#FF6E6E]" strokeWidth={1.8} />,
    iconBg: "#FDE0DE",
  },
];

const scheduleRows: ScheduleRow[] = [
  {
    id: "schedule-1",
    recipient: {
      id: "recipient-1",
      name: "Taiwo Adeniyi",
      email: "oluwatosin13@gmail.com",
      phoneNumber: "+23470-6572-4230",
      initials: "TA",
      avatarBg: "#FDE0DE",
      avatarColor: "#C34040",
    },
    scheduledDate: "22/03/2025",
    status: "Upcoming",
  },
  {
    id: "schedule-2",
    recipient: {
      id: "recipient-2",
      name: "Brooklyn Simmons",
      email: "jessica.hanson@gmail.com",
      phoneNumber: "+23470-6572-4230",
      initials: "BS",
      avatarBg: "#DDF0FF",
      avatarColor: "#0067C9",
    },
    scheduledDate: "22/03/2025",
    status: "Upcoming",
  },
  {
    id: "schedule-3",
    recipient: {
      id: "recipient-3",
      name: "Eleanor Pena",
      email: "deanna.curtis@gmail.com",
      phoneNumber: "+23470-6572-4230",
      initials: "EP",
      avatarBg: "#FCEEC8",
      avatarColor: "#8A5B00",
    },
    scheduledDate: "22/03/2025",
    status: "Upcoming",
  },
  {
    id: "schedule-4",
    recipient: {
      id: "recipient-4",
      name: "Esther Howard",
      email: "nathan.roberts@gmail.com",
      phoneNumber: "+23470-6572-4230",
      initials: "EH",
      avatarBg: "#D9F4E2",
      avatarColor: "#1C8C4B",
    },
    scheduledDate: "22/03/2025",
    status: "Upcoming",
  },
  {
    id: "schedule-5",
    recipient: {
      id: "recipient-5",
      name: "Jenny Wilson",
      email: "jessica.hanson@gmail.com",
      phoneNumber: "+23470-6572-4230",
      initials: "JW",
      avatarBg: "#EFE6FD",
      avatarColor: "#3300C9",
    },
    scheduledDate: "22/03/2025",
    status: "Upcoming",
  },
  {
    id: "schedule-6",
    recipient: {
      id: "recipient-6",
      name: "Courtney Henry",
      email: "courtney.henry@gmail.com",
      phoneNumber: "+23481-2244-9012",
      initials: "CH",
      avatarBg: "#FDE0DE",
      avatarColor: "#C34040",
    },
    scheduledDate: "17/01/2025",
    status: "Past",
  },
  {
    id: "schedule-7",
    recipient: {
      id: "recipient-7",
      name: "Cody Fisher",
      email: "cody.fisher@gmail.com",
      phoneNumber: "+23481-6677-9030",
      initials: "CF",
      avatarBg: "#DDF0FF",
      avatarColor: "#0067C9",
    },
    scheduledDate: "14/01/2025",
    status: "Past",
  },
  {
    id: "schedule-8",
    recipient: {
      id: "recipient-8",
      name: "Kristin Watson",
      email: "kristin.watson@gmail.com",
      phoneNumber: "+23480-9012-3301",
      initials: "KW",
      avatarBg: "#FCEEC8",
      avatarColor: "#8A5B00",
    },
    scheduledDate: "08/01/2025",
    status: "Past",
  },
  {
    id: "schedule-9",
    recipient: {
      id: "recipient-9",
      name: "Savannah Nguyen",
      email: "savannah.nguyen@gmail.com",
      phoneNumber: "+23470-2401-9930",
      initials: "SN",
      avatarBg: "#D9F4E2",
      avatarColor: "#1C8C4B",
    },
    scheduledDate: "04/01/2025",
    status: "Past",
  },
  {
    id: "schedule-10",
    recipient: {
      id: "recipient-10",
      name: "Ronald Richards",
      email: "ronald.richards@gmail.com",
      phoneNumber: "+23481-0011-7250",
      initials: "RR",
      avatarBg: "#EFE6FD",
      avatarColor: "#3300C9",
    },
    scheduledDate: "29/12/2024",
    status: "Past",
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

function ScheduleMetricCard({ metric }: { metric: ScheduleMetric }) {
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

function RecipientCell({ recipient }: { recipient: ScheduleRecipient }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{
          backgroundColor: recipient.avatarBg,
          color: recipient.avatarColor,
        }}
        title={recipient.name}
      >
        {recipient.initials}
      </span>

      <span className="font-medium text-[#434343]">{recipient.name}</span>
    </div>
  );
}

function StatusPill({ status }: { status: ScheduleStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[78px] items-center justify-center rounded-full px-3 py-1 text-xs font-medium",
        status === "Upcoming"
          ? "bg-[#FFF1DD] text-[#FF9D1C]"
          : "bg-[#E6F7EC] text-[#24A959]",
      )}
    >
      {status}
    </span>
  );
}

function ScheduleRowActions({ row }: { row: ScheduleRow }) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More options for ${row.recipient.name}`}
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
            onSelect={() => toast(`Viewing ${row.recipient.name} will be connected next.`)}
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

export default function ScheduleScreen() {
  const [activeTab, setActiveTab] = useState<ScheduleStatus>("Upcoming");
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scheduleMetricsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scheduleRows.filter((row) => {
      const matchesTab = row.status === activeTab;

      if (!matchesTab) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        row.recipient.name,
        row.recipient.email,
        row.recipient.phoneNumber,
        row.scheduledDate,
        row.status,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [activeTab, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query]);

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

  const tableData: TableData<ScheduleRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Select all schedule rows"
          />
        ),
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "w-[36px] px-3 py-3",
        render: (row) => (
          <Checkbox
            checked={selectedIds.includes(row.id)}
            onChange={() => toggleRow(row.id)}
            aria-label={`Select ${row.recipient.name}`}
          />
        ),
      },
      {
        id: "recipient",
        header: "Recipients",
        headerClassName: "min-w-[160px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <RecipientCell recipient={row.recipient} />,
      },
      {
        id: "email",
        header: "Email Address",
        accessor: (row) => row.recipient.email,
        headerClassName: "min-w-[190px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "scheduledDate",
        header: "Scheduled Date",
        accessor: "scheduledDate",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "phoneNumber",
        header: "Phone Number",
        accessor: (row) => row.recipient.phoneNumber,
        headerClassName: "min-w-[150px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
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
        render: (row) => <ScheduleRowActions row={row} />,
      },
    ],
    rows: paginatedRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[14px] last:border-r last:rounded-r-[14px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selectedIds.includes(row.id) ? "" : "group"),
    emptyState: (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">
          No scheduled items match your current search.
        </p>
      </div>
    ),
    emptyRowClassName: "bg-white",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Event & Message"
        description="Schedule events & Message ahead and keep in touch with your loved ones"
        actions={
          <>
            <Button
              type="button"
              onClick={() => toast("Schedule event flow will be connected next.")}
              className="h-[44px] rounded-full px-4 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-white/35 bg-white/10">
                  <CalendarDaysIcon className="size-4" />
                </span>
                <span>Schedule Event</span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={() => toast("Schedule message flow will be connected next.")}
              className="h-[44px] rounded-full border-[#3300C9] px-4 text-sm font-medium text-[#3300C9] hover:bg-[#F6F2FF]"
            >
              <span className="inline-flex items-center gap-2.5">
                <SendIcon className="size-4" />
                <span>Schedule Message</span>
              </span>
            </Button>

            <HeaderActionIconButton label="Schedule actions">
              <ShoppingBagIcon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>

            <HeaderActionIconButton label="Schedule settings">
              <Settings2Icon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>
          </>
        }
      />

      <>
        <section className="sm:hidden">
          <div className="overflow-hidden" ref={scheduleMetricsEmblaRef}>
            <div className="flex gap-3">
              {scheduleMetrics.map((metric) => (
                <div key={metric.label} className="min-w-0 flex-[0_0_100%]">
                  <ScheduleMetricCard metric={metric} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
          {scheduleMetrics.map((metric) => (
            <ScheduleMetricCard key={metric.label} metric={metric} />
          ))}
        </section>
      </>

      <section className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[#F1EDF8] pb-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
              Schedule History
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex items-center gap-5 lg:justify-center">
              {(["Upcoming", "Past"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "border-b-2 px-1 pb-2 text-sm transition-colors",
                    activeTab === tab
                      ? "border-[#3300C9] font-medium text-[#3300C9]"
                      : "border-transparent text-[#9A97A5] hover:text-[#5A4CB8]",
                  )}
                >
                  {tab === "Upcoming" ? "Upcoming Event" : "Past Event"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <SearchInput
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search names......"
                containerClassName="w-full sm:w-[280px]"
                className="h-10 rounded-[16px] border-[#ECE8F7] bg-white text-sm text-[#434343] shadow-none placeholder:text-[#9A97A5] focus-visible:border-[#D7CEF2] focus-visible:ring-0"
              />

              <button
                type="button"
                aria-label="Filter schedule"
                onClick={() => toast("Schedule filters will be connected next.")}
                className="flex size-10 items-center justify-center rounded-[12px] border border-[#ECE8F7] bg-white text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
              >
                <FilterIcon className="size-4 text-[#434343]" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table
            data={tableData}
            tableClassName="w-full min-w-[920px] border-separate border-spacing-y-3"
          />
        </div>

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

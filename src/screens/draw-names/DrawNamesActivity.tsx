"use client";

import { useState } from "react";
import { MoreHorizontal, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination";
import { cn } from "@/lib/utils";

type Participant = {
  initials: string;
  color: string;
  bg: string;
};

type DrawStatus = "Completed" | "Draft" | "In Progress";

type Activity = {
  id: number;
  eventName: string;
  eventDate: string;
  budget: string;
  createdBy: string;
  participants: Participant[];
  overflow: number;
  status: DrawStatus;
};

const paletteA: Participant = {
  initials: "AO",
  color: "#3300C9",
  bg: "#EFE6FD",
};
const paletteB: Participant = {
  initials: "TM",
  color: "#C28A00",
  bg: "#FCEEC8",
};
const paletteC: Participant = {
  initials: "SE",
  color: "#1FAB54",
  bg: "#D9F4E2",
};
const paletteD: Participant = {
  initials: "OK",
  color: "#E04F4F",
  bg: "#FDE0DE",
};

const activities: Activity[] = [
  {
    id: 1,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    budget: "₦230,000",
    createdBy: "Taiwo Adeniyi",
    participants: [paletteA, paletteB, paletteC],
    overflow: 6,
    status: "Completed",
  },
  {
    id: 2,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    participants: [paletteB, paletteD, paletteA],
    overflow: 6,
    status: "Draft",
  },
  {
    id: 3,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    participants: [paletteC, paletteA, paletteB],
    overflow: 6,
    status: "Draft",
  },
  {
    id: 4,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    participants: [paletteA, paletteC, paletteD],
    overflow: 6,
    status: "Draft",
  },
  {
    id: 5,
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦230,000",
    createdBy: "Tayo Oye",
    participants: [paletteD, paletteB, paletteC],
    overflow: 6,
    status: "Completed",
  },
];

const GRID_COLS =
  "grid-cols-[36px_minmax(140px,1.2fr)_minmax(110px,1fr)_minmax(110px,1fr)_minmax(130px,1fr)_minmax(120px,1fr)_minmax(110px,0.9fr)_36px]";

const statusStyles: Record<DrawStatus, string> = {
  Completed: "bg-[#E6F7EC] text-[#1FAB54]",
  Draft: "bg-[#FFF1DD] text-[#C28A00]",
  "In Progress": "bg-[#EFE6FD] text-[#3300C9]",
};

function FilterButtonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 4h12M4 8h8M6 12h4"
        stroke="#434343"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ParticipantStack({
  participants,
  overflow,
}: {
  participants: Participant[];
  overflow: number;
}) {
  return (
    <div className="flex items-center -space-x-2">
      {participants.map((p, i) => (
        <span
          key={`${p.initials}-${i}`}
          className="flex size-6 items-center justify-center rounded-full border-2 border-white text-[9px] font-semibold"
          style={{ backgroundColor: p.bg, color: p.color }}
        >
          {p.initials}
        </span>
      ))}
      <span className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#EFE6FD] text-[9px] font-semibold text-[#3300C9]">
        +{overflow}
      </span>
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

export default function DrawNamesActivity() {
  const [selected, setSelected] = useState<number[]>([]);
  const allChecked =
    selected.length > 0 && selected.length === activities.length;

  const toggleAll = () => {
    if (allChecked) {
      setSelected([]);
    } else {
      setSelected(activities.map((a) => a.id));
    }
  };

  const toggleRow = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  return (
    <section className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[15px] font-semibold text-[#1e1e1e]">
          Recent Activity
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-[260px]">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
            <Input
              placeholder="Search name......."
              className="h-9 rounded-full border-[#ECE8F7] bg-[#FCFBFF] pl-9 text-xs text-[#434343] placeholder:text-[#9A97A5] focus-visible:border-[#d6ccf5] focus-visible:ring-[#d6ccf5]/40"
            />
          </div>

          <button
            type="button"
            aria-label="Filter activity"
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-[#ECE8F7] bg-white transition-colors hover:bg-[#F6F2FF]"
          >
            <FilterButtonIcon />
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[760px]">
          <div
            className={cn(
              "grid items-center px-3 pb-2 text-[12px] font-medium text-[#7d7d7d]",
              GRID_COLS,
            )}
            role="row"
          >
            <div role="columnheader">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                aria-label="Select all draws"
                className="size-4 cursor-pointer accent-[#3300C9]"
              />
            </div>
            <div role="columnheader">Event Name</div>
            <div role="columnheader">Event Date</div>
            <div role="columnheader">Budget</div>
            <div role="columnheader">Created by</div>
            <div role="columnheader">Participants</div>
            <div role="columnheader">Status</div>
            <div role="columnheader" aria-label="row actions" />
          </div>

          <div className="space-y-2">
            {activities.map((row) => {
              const isChecked = selected.includes(row.id);
              return (
                <div
                  key={row.id}
                  role="row"
                  className={cn(
                    "grid items-center rounded-[12px] px-3 py-3 text-[12px] text-[#434343] transition-colors",
                    GRID_COLS,
                    isChecked
                      ? "bg-[#F1ECFF]"
                      : "bg-[#FAF9FE] hover:bg-[#F4F0FF]",
                  )}
                >
                  <div role="cell">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.eventName}`}
                      className="size-4 cursor-pointer accent-[#3300C9]"
                    />
                  </div>
                  <div role="cell" className="pr-3 font-medium">
                    {row.eventName}
                  </div>
                  <div role="cell" className="pr-3">
                    {row.eventDate}
                  </div>
                  <div role="cell" className="pr-3">
                    {row.budget}
                  </div>
                  <div role="cell" className="pr-3">
                    {row.createdBy}
                  </div>
                  <div role="cell" className="pr-3">
                    <ParticipantStack
                      participants={row.participants}
                      overflow={row.overflow}
                    />
                  </div>
                  <div role="cell" className="pr-3">
                    <StatusPill status={row.status} />
                  </div>
                  <div role="cell" className="flex justify-end">
                    <button
                      type="button"
                      aria-label={`More options for ${row.eventName}`}
                      className="text-[#9A97A5] transition-colors hover:text-[#434343]"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Pagination total={10} className="mt-4" />
    </section>
  );
}

"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  CalendarDaysIcon,
  MoreHorizontal,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  ShoppingBagIcon,
  StoreIcon,
  UsersIcon,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import { cn } from "@/lib/utils";

type GiftsTab = "sent" | "received";
type GiftStatus = "Delivered" | "Pending" | "Completed";

type GiftRowPerson = {
  name: string;
};

type GiftRow = {
  id: string;
  item: string;
  image: StaticImageData;
  eventName: string;
  eventDate: string;
  amount: string;
  status: GiftStatus;
  sentTo?: GiftRowPerson[];
  receivedFrom?: GiftRowPerson[];
};

type StatCardData = {
  icon: ReactNode;
  iconBg: string;
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
};

const recipientPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
] as const;

const statusStyles: Record<GiftStatus, string> = {
  Delivered: "bg-[#E6F7EC] text-[#1FAB54]",
  Pending: "bg-[#FFF1DD] text-[#FF9D1C]",
  Completed: "bg-[#E6F7EC] text-[#24A959]",
};

const giftStats: StatCardData[] = [
  {
    icon: <ShoppingBagIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />,
    iconBg: "#EFE6FD",
    value: "48",
    label: "Total Gifts",
    hint: "+12% this month",
    hintColor: "#3300C9",
  },
  {
    icon: <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />,
    iconBg: "#D9F4E2",
    value: "$264",
    label: "Total Amount Spent",
    hint: "+2 new this week",
    hintColor: "#24A959",
  },
  {
    icon: <UsersIcon className="size-5 text-[#C28A00]" strokeWidth={1.8} />,
    iconBg: "#FCEEC8",
    value: "3",
    label: "Total People",
  },
  {
    icon: <StoreIcon className="size-5 text-[#C28A00]" strokeWidth={1.8} />,
    iconBg: "#FCEEC8",
    value: "3",
    label: "Total Sellers",
  },
];

const sentRows: GiftRow[] = [
  {
    id: "sent-1",
    item: "Head Set",
    image: featureImg1,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    amount: "₦10,000",
    status: "Delivered",
    sentTo: [{ name: "Taiwo Adeniyi" }],
  },
  {
    id: "sent-2",
    item: "Hp Laptop",
    image: featureImg2,
    eventName: "Wedding",
    eventDate: "22/3/2025",
    amount: "₦10,000",
    status: "Pending",
    sentTo: [
      { name: "Rita Bello" },
      { name: "Tolu Ayeni" },
      { name: "James Frank" },
      { name: "Adebayo Fiyin" },
      { name: "Seun Oye" },
      { name: "Demi Martins" },
      { name: "Chika Obi" },
      { name: "Joy Eze" },
      { name: "Tade Ojo" },
    ],
  },
  {
    id: "sent-3",
    item: "Nike Shoes",
    image: featureImg3,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    amount: "₦10,000",
    status: "Pending",
    sentTo: [{ name: "James Frank" }],
  },
  {
    id: "sent-4",
    item: "Ergonomic Chair",
    image: featureImg4,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    amount: "₦10,000",
    status: "Delivered",
    sentTo: [{ name: "Adeoye Fiyin" }],
  },
  {
    id: "sent-5",
    item: "Head Set",
    image: featureImg1,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    amount: "₦10,000",
    status: "Completed",
    sentTo: [{ name: "Seun Oye" }],
  },
];

const receivedRows: GiftRow[] = [
  {
    id: "received-1",
    item: "Gift Box",
    image: featureImg4,
    eventName: "Birthday",
    eventDate: "22/3/2025",
    amount: "₦18,000",
    status: "Delivered",
    receivedFrom: [{ name: "Tayo Oye" }],
  },
  {
    id: "received-2",
    item: "Leather Bag",
    image: featureImg2,
    eventName: "Anniversary",
    eventDate: "23/4/2025",
    amount: "₦35,000",
    status: "Pending",
    receivedFrom: [{ name: "Rita Bello" }],
  },
  {
    id: "received-3",
    item: "Running Shoes",
    image: featureImg3,
    eventName: "Wedding",
    eventDate: "05/5/2025",
    amount: "₦22,000",
    status: "Completed",
    receivedFrom: [{ name: "Adenike Sola" }],
  },
  {
    id: "received-4",
    item: "Bluetooth Speaker",
    image: featureImg1,
    eventName: "Birthday",
    eventDate: "11/5/2025",
    amount: "₦15,000",
    status: "Delivered",
    receivedFrom: [{ name: "James Frank" }],
  },
];

function getRecipientStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return recipientPalette[hash % recipientPalette.length];
}

function toInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function GiftsStatCard({
  icon,
  iconBg,
  value,
  label,
  hint,
  hintColor,
}: StatCardData) {
  return (
    <div className="rounded-2xl border border-[#EEEAF7] bg-white p-5 shadow-[0_2px_6px_rgba(33,16,93,0.04)]">
      <div className="flex items-start justify-between">
        <span
          className="flex size-10 items-center justify-center rounded-[10px]"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </span>

        <button
          type="button"
          aria-label={`More options for ${label}`}
          className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <p className="mt-5 text-[34px] font-bold leading-none tracking-[-0.02em] text-[#1E1E1E]">
        {value}
      </p>
      <p className="mt-2 text-[13px] font-medium text-[#7D7D7D]">{label}</p>

      {hint ? (
        <p
          className="mt-2 text-[12px] font-medium"
          style={{ color: hintColor ?? "#24A959" }}
        >
          {hint}
        </p>
      ) : (
        <p className="mt-2 h-[18px]" aria-hidden="true" />
      )}
    </div>
  );
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
      className="flex size-10 items-center justify-center rounded-full border border-[#ECE8F7] bg-white text-[#6F6C75] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
    >
      {children}
    </button>
  );
}

function RecipientAvatar({ name }: { name: string }) {
  const { bg, color } = getRecipientStyle(name);

  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white text-[9px] font-semibold"
      style={{ backgroundColor: bg, color }}
      title={name}
    >
      {toInitials(name)}
    </span>
  );
}

function RecipientCell({ people }: { people: GiftRowPerson[] }) {
  if (people.length <= 1) {
    const person = people[0];

    if (!person) {
      return <span className="text-sm text-[#7D7D7D]">-</span>;
    }

    return (
      <div className="flex items-center gap-2.5">
        <RecipientAvatar name={person.name} />
        <span className="text-sm font-medium text-[#1E1E1E]">{person.name}</span>
      </div>
    );
  }

  const visiblePeople = people.slice(0, 3);
  const overflowCount = people.length - visiblePeople.length;

  return (
    <div className="flex items-center">
      <div className="flex items-center -space-x-2">
        {visiblePeople.map((person) => (
          <RecipientAvatar key={person.name} name={person.name} />
        ))}
        {overflowCount > 0 ? (
          <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
            +{overflowCount}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: GiftStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[84px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

export default function DashboardGiftsScreen() {
  const [activeTab, setActiveTab] = useState<GiftsTab>("sent");
  const [query, setQuery] = useState("");

  const rows = activeTab === "sent" ? sentRows : receivedRows;
  const counterpartLabel = activeTab === "sent" ? "Sent to" : "Received from";

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => {
      const counterpartNames =
        activeTab === "sent"
          ? row.sentTo?.map((person) => person.name).join(" ")
          : row.receivedFrom?.map((person) => person.name).join(" ");

      return [
        row.item,
        row.eventName,
        row.eventDate,
        row.amount,
        row.status,
        counterpartNames,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [activeTab, query, rows]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gifts"
        description="Track gifts sent and received"
        actions={
          <>
            <Button
              type="button"
              className="h-[44px] rounded-full px-5 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-white/35 bg-white/10">
                  <PlusIcon className="size-4" />
                </span>
                <span>Get a Gift</span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outlined"
              className="h-[44px] rounded-full border-[#3300C9] bg-white px-5 text-sm font-medium text-[#3300C9] hover:bg-[#F6F2FF]"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-[#3300C9]/30 bg-[#F6F2FF]">
                  <PlusIcon className="size-4" />
                </span>
                <span>Browse Gifts</span>
              </span>
            </Button>

            <HeaderActionIconButton label="Download gifts">
              <ShoppingBagIcon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>

            <HeaderActionIconButton label="Gift settings">
              <Settings2Icon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {giftStats.map((stat) => (
          <GiftsStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[#F1EDF8] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("sent")}
              className={cn(
                "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                activeTab === "sent"
                  ? "border-[#3300C9] text-[#3300C9]"
                  : "border-transparent text-[#9A97A5]",
              )}
            >
              Gifts Sent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("received")}
              className={cn(
                "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                activeTab === "received"
                  ? "border-[#3300C9] text-[#3300C9]"
                  : "border-transparent text-[#9A97A5]",
              )}
            >
              Gifts Received
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[320px]">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search gifts......"
                className="h-10 rounded-[16px] border-[#ECE8F7] bg-white pl-9 text-sm text-[#434343] shadow-none placeholder:text-[#9A97A5] focus-visible:border-[#D7CEF2] focus-visible:ring-0"
              />
            </div>

            <button
              type="button"
              aria-label="Filter gifts"
              className="flex size-10 items-center justify-center rounded-[12px] border border-[#ECE8F7] bg-white text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
            >
              <FilterIcon className="size-4.5" />
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[940px] border-separate border-spacing-y-3">
            <thead>
              <tr>
                <th className="w-12 px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  <Checkbox aria-label="Select all gifts" />
                </th>
                <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  Item
                </th>
                <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  Event Name
                </th>
                <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  Event Date
                </th>
                <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  {counterpartLabel}
                </th>
                <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  Amount
                </th>
                <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                  Status
                </th>
                <th className="w-12 px-3 py-2" />
              </tr>
            </thead>

            <tbody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => {
                  const people =
                    activeTab === "sent"
                      ? row.sentTo ?? []
                      : row.receivedFrom ?? [];

                  return (
                    <tr
                      key={row.id}
                      className="[&>td]:border-y [&>td]:border-[#F1EDF8] [&>td]:bg-white [&>td]:py-3.5"
                    >
                      <td className="rounded-l-[16px] border-l border-[#F1EDF8] px-3">
                        <Checkbox aria-label={`Select ${row.item}`} />
                      </td>
                      <td className="px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center overflow-hidden rounded-[10px] bg-[#F7F6FB]">
                            <Image
                              src={row.image}
                              alt={row.item}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <span className="text-sm font-medium text-[#1E1E1E]">
                            {row.item}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 text-sm text-[#434343]">{row.eventName}</td>
                      <td className="px-3 text-sm text-[#434343]">{row.eventDate}</td>
                      <td className="px-3">
                        <RecipientCell people={people} />
                      </td>
                      <td className="px-3 text-sm font-medium text-[#434343]">
                        {row.amount}
                      </td>
                      <td className="px-3">
                        <StatusPill status={row.status} />
                      </td>
                      <td className="rounded-r-[16px] border-r border-[#F1EDF8] px-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            aria-label={`More options for ${row.item}`}
                            className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="rounded-[16px] border border-[#F1EDF8] bg-[#FCFBFF] px-6 py-10 text-center text-sm text-[#7D7D7D]"
                  >
                    No gifts match your search right now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination total={10} className="mt-4" />
      </section>
    </div>
  );
}

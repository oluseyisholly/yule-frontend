"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  CalendarDaysIcon,
  ExternalLinkIcon,
  GiftIcon,
  MoreHorizontal,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  Share2Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import EventDateStep from "@/components/EventDateStep";
import ModalButton from "@/components/ModalButtons";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import ContentModal from "@/components/ui/modal";
import Table, { type TableData } from "@/components/ui/Table";
import { Input } from "@/components/ui/input";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateWishlistEventMutation } from "@/features/wishlist-events/hooks/useCreateWishlistEventMutation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type WishListStatus = "Completed" | "Draft";
type WishListCreateStep = "event" | "event-date";

type WishListParticipant = {
  id: number;
  name: string;
  initials: string;
  bg: string;
  color: string;
};

type WishListRow = {
  id: string;
  eventName: string;
  eventDate: string;
  budget: string;
  createdBy: string;
  participants: WishListParticipant[];
  status: WishListStatus;
};

type WishListStat = {
  icon: ReactNode;
  iconBg: string;
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
};

const statusStyles: Record<WishListStatus, string> = {
  Completed: "bg-[#E6F7EC] text-[#1FAB54]",
  Draft: "bg-[#FFF1DD] text-[#FF9D1C]",
};

const participantPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
  { color: "#5A4CB8", bg: "#E8E6F8" },
] as const;

const wishListStats: WishListStat[] = [
  {
    icon: <GiftIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />,
    iconBg: "#EFE6FD",
    value: "48",
    label: "Total Gifts",
    hint: "+12% this month",
    hintColor: "#3300C9",
  },
  {
    icon: (
      <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />
    ),
    iconBg: "#D9F4E2",
    value: "6",
    label: "Active Wish Lists",
    hint: "+2 new this week",
    hintColor: "#24A959",
  },
  {
    icon: <UsersIcon className="size-5 text-[#C28A00]" strokeWidth={1.8} />,
    iconBg: "#FCEEC8",
    value: "3",
    label: "Total Names",
  },
  {
    icon: <Share2Icon className="size-5 text-[#E04F4F]" strokeWidth={1.8} />,
    iconBg: "#FDE0DE",
    value: "12",
    label: "Active Members",
  },
];

function createParticipants(names: string[]) {
  return names.map((name, index) => {
    const [first = "", second = ""] = name.split(" ");
    const initials = `${first.charAt(0)}${second.charAt(0)}`
      .trim()
      .toUpperCase();
    const palette = participantPalette[index % participantPalette.length];

    return {
      id: index + 1,
      name,
      initials: initials || "WL",
      bg: palette.bg,
      color: palette.color,
    };
  });
}

const wishListRows: WishListRow[] = [
  {
    id: "wishlist-1",
    eventName: "Birthday",
    eventDate: "22/3/2025",
    budget: "₦10,000",
    createdBy: "Taiwo Adeniyi",
    participants: createParticipants([
      "Rita Bello",
      "Bola Tinubu",
      "Eze Agwu",
      "Yaya Bello",
      "Toluwani Ayeni",
      "James Frank",
    ]),
    status: "Completed",
  },
  {
    id: "wishlist-2",
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦10,000",
    createdBy: "Tayo Oye",
    participants: createParticipants([
      "Balo Victor",
      "Tolu Aina",
      "Moyo Allen",
      "Rasheed Bello",
      "Yemi Cole",
      "Adaobi Jane",
    ]),
    status: "Draft",
  },
  {
    id: "wishlist-3",
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦10,000",
    createdBy: "Tayo Oye",
    participants: createParticipants([
      "Boma George",
      "Carl James",
      "Dami Ope",
      "Kenny Luke",
      "Timi Roy",
      "Bisi Tade",
    ]),
    status: "Draft",
  },
  {
    id: "wishlist-4",
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦10,000",
    createdBy: "Tayo Oye",
    participants: createParticipants([
      "Helen Cole",
      "Seun Oye",
      "Joy Eze",
      "Timi Cook",
      "Lara Dean",
      "Rita James",
    ]),
    status: "Draft",
  },
  {
    id: "wishlist-5",
    eventName: "Ramadan",
    eventDate: "22/3/2025",
    budget: "₦10,000",
    createdBy: "Tayo Oye",
    participants: createParticipants([
      "Ayo Grant",
      "Ken Woods",
      "Grace Ola",
      "Yinka Dove",
      "Tolu King",
      "David Cole",
    ]),
    status: "Completed",
  },
];

function WishListStatCard({
  icon,
  iconBg,
  value,
  label,
  hint,
  hintColor,
}: WishListStat) {
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
          <MoreHorizontal className="size-4" />
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

function ParticipantStack({
  participants,
  overflowCount,
}: {
  participants: WishListParticipant[];
  overflowCount: number;
}) {
  return (
    <div className="flex items-center -space-x-2">
      {participants.map((participant, index) => (
        <span
          key={`${participant.name}-${index}`}
          className="flex size-8 items-center justify-center rounded-full border border-white text-[9px] font-semibold"
          style={{ backgroundColor: participant.bg, color: participant.color }}
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

function StatusPill({ status }: { status: WishListStatus }) {
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

export default function WishListScreen() {
  const authUser = useAuthStore((state) => state.user);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [createWishListStep, setCreateWishListStep] =
    useState<WishListCreateStep>("event");
  const [isCreateWishListModalOpen, setIsCreateWishListModalOpen] =
    useState(false);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState("");
  const [selectedWishListDate, setSelectedWishListDate] = useState("");
  const [createdWishlistEventId, setCreatedWishlistEventId] = useState("");
  const [createdWishlistEventEventId, setCreatedWishlistEventEventId] =
    useState("");

  const {
    data: availableEventTypesResponse,
    isError: isAvailableEventTypesError,
    refetch: refetchAvailableEventTypes,
  } = useAvailableEventTypesQuery({
    per_page: 25,
    page: 1,
  });
  const createWishlistEventMutation = useCreateWishlistEventMutation();

  const greetingName = authUser?.firstName?.trim() || "Susan";

  const eventTypeOptions = useMemo<OverlaySelectOption[]>(
    () =>
      (availableEventTypesResponse?.data?.data ?? [])
        .filter((eventType) => eventType.isActive)
        .map((eventType) => ({
          value: eventType.id,
          label: eventType.name,
          icon: getEventTypeIcon(eventType.key),
        })),
    [availableEventTypesResponse],
  );

  const selectedEventTypeOption = useMemo(
    () =>
      eventTypeOptions.find((eventType) => eventType.value === selectedEventTypeId) ??
      null,
    [eventTypeOptions, selectedEventTypeId],
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return wishListRows;
    }

    return wishListRows.filter((row) => {
      const participantNames = row.participants.map(
        (participant) => participant.name,
      );
      const haystack = [row.eventName, row.createdBy, ...participantNames]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [searchValue]);

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

  const handleCloseCreateWishListModal = () => {
    setIsCreateWishListModalOpen(false);
    setCreateWishListStep("event");
    setSelectedEventTypeId("");
    setSelectedWishListDate("");
    setCreatedWishlistEventId("");
    setCreatedWishlistEventEventId("");
  };

  const handleCreateWishList = async () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    try {
      const response = await createWishlistEventMutation.mutateAsync({
        event: {
          title: selectedEventTypeOption.label,
          description: "",
          eventTypeId: selectedEventTypeOption.value,
          eventDate: new Date().toISOString(),
        },
        allowMultipleItems: true,
        visibility: "private",
      });

      setCreatedWishlistEventId(response.data.id);
      setCreatedWishlistEventEventId(response.data.eventId);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "wishlist-event-last-created-id",
          response.data.id,
        );
        window.localStorage.setItem(
          "wishlist-event-last-created-event-id",
          response.data.eventId,
        );
      }

      toast.success(response.message);
      setCreateWishListStep("event-date");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create this wish list right now.",
      );
    }
  };

  const handleWishListDateNext = () => {
    if (!selectedWishListDate) {
      return;
    }

    if (typeof window !== "undefined") {
      if (createdWishlistEventId) {
        window.localStorage.setItem(
          "wishlist-event-last-created-id",
          createdWishlistEventId,
        );
      }

      if (createdWishlistEventEventId) {
        window.localStorage.setItem(
          "wishlist-event-last-created-event-id",
          createdWishlistEventEventId,
        );
      }

      window.localStorage.setItem(
        "wishlist-event-last-selected-date",
        selectedWishListDate,
      );
    }

    handleCloseCreateWishListModal();
  };

  const tableData: TableData<WishListRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Select all wish lists"
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
          <div className="flex justify-end">
            <button
              type="button"
              aria-label={`More options for ${row.eventName}`}
              className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ),
      },
    ],
    rows: filteredRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[12px] last:border-r last:rounded-r-[12px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selected.includes(row.id) ? "" : "group"),
    emptyState: (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">No wish list activity found.</p>
      </div>
    ),
    emptyRowClassName: "bg-white",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Wish List"
        description="Create and manage your gifts preference"
        actions={
          <>
            <Button
              type="button"
              onClick={() => setIsCreateWishListModalOpen(true)}
              className="h-[44px] rounded-full px-5 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-white/35 bg-white/10">
                  <PlusIcon className="size-4" />
                </span>
                <span>Create Wish List</span>
              </span>
            </Button>

            <HeaderActionIconButton label="Share wish list">
              <Share2Icon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>

            <HeaderActionIconButton label="Wish list settings">
              <Settings2Icon className="size-4.5" strokeWidth={1.8} />
            </HeaderActionIconButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wishListStats.map((stat) => (
          <WishListStatCard key={stat.label} {...stat} />
        ))}
      </div>

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
                className="h-[48px] rounded-[16px] border-[#F0EEFF] pl-9 text-xs text-[#434343] placeholder:text-[#9A97A5] focus-visible:border-[#D6CCF5] focus-visible:ring-[#D6CCF5]/40"
              />
            </div>

            <button
              type="button"
              aria-label="Filter wish lists"
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

        <Pagination total={10} className="mt-4" />
      </section>

      <ContentModal
        open={isCreateWishListModalOpen}
        onClose={handleCloseCreateWishListModal}
        title="Create Wish List"
        showHeader={false}
        closeOnOverlayClick={false}
        dialogClassName="max-w-[536px] rounded-[20px] bg-white"
        bodyClassName="px-8 py-10 sm:px-10 sm:py-10"
      >
        {createWishListStep === "event" ? (
          <div className="space-y-7">
            <div className="space-y-2 text-left">
              <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
                Hi {greetingName},
              </p>
              <p className="text-[20px] font-normal text-[#434343]">
                What event are you celebrating?
              </p>
            </div>

            <OverlaySelect
              value={selectedEventTypeId}
              onValueChange={setSelectedEventTypeId}
              options={eventTypeOptions}
              placeholder="Select Event"
              panelTitle="Select Event"
              searchPlaceholder=""
              triggerClassName="text-[10px]"
            />

            {isAvailableEventTypesError ? (
              <button
                type="button"
                onClick={() => refetchAvailableEventTypes()}
                className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry loading events
              </button>
            ) : null}

            <ModalButton
              onClick={handleCreateWishList}
              disabled={
                !selectedEventTypeId || createWishlistEventMutation.isPending
              }
            >
              {createWishlistEventMutation.isPending ? "Saving..." : "Next"}
            </ModalButton>
          </div>
        ) : (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Event"}
            value={selectedWishListDate}
            onChange={setSelectedWishListDate}
            onBack={() => setCreateWishListStep("event")}
            onNext={handleWishListDateNext}
            heading="What's the date?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        )}
      </ContentModal>
    </div>
  );
}

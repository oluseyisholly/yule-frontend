"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDaysIcon,
  GiftIcon,
  MoreHorizontal,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  Share2Icon,
  UsersIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/dashboard/PageHeader";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import EventDateStep from "@/components/EventDateStep";
import BackButton from "@/components/BackButton";
import DeleteIcon from "@/components/icons/DeleteIcon";
import EditPencilIcon from "@/components/icons/EditPencilIcon";
import DrawNameInviteStep, {
  type DrawNameInviteParticipant,
} from "@/components/DrawNameInviteStep";
import GroupNameStep from "@/components/GroupNameStep";
import ModalButton from "@/components/ModalButtons";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import ContentModal from "@/components/ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import Table, { type TableData } from "@/components/ui/Table";
import { Input } from "@/components/ui/input";
import ViewIcon from "@/components/icons/ViewIcon";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useWishlistEventsQuery } from "@/features/wishlist-events/hooks/useWishlistEventsQuery";
import { useCreateWishlistEventMutation } from "@/features/wishlist-events/hooks/useCreateWishlistEventMutation";
import { useUpdateWishlistEventMutation } from "@/features/wishlist-events/hooks/useUpdateWishlistEventMutation";
import { useCreateBulkGiftsMutation } from "@/features/gifts/hooks/useCreateBulkGiftsMutation";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import type {
  WishlistEventParticipant,
  WishlistEventRecord,
} from "@/features/wishlist-events/types";
import { cn } from "@/lib/utils";
import {
  isWishListModalStep,
  type WishListModalStep,
} from "@/screens/wish-list/modal-steps";
import { useWishListModalRouteState } from "@/screens/wish-list/useWishListModalRouteState";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildWishListFlowSelectionKey,
  EMPTY_WISHLIST_FLOW_SELECTION,
  useWishListFlowStore,
} from "@/stores/wishlist-flow-store";

type WishListStatus = "Completed" | "Draft" | "Ongoing" | string;

type WishListParticipant = {
  id: number;
  name: string;
  initials: string;
  bg: string;
  color: string;
};

type WishListCelebrationType = "" | "gifts" | "hangouts" | "both";

type WishListRow = {
  id: string;
  wishlistEventId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventDeadline: string;
  eventDateValue: string;
  eventDeadlineValue: string;
  eventTypeId: string;
  titleValue: string;
  allowMultipleItems: boolean;
  visibility: string;
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

const wishListCelebrationTypeOptions: Array<{
  value: Exclude<WishListCelebrationType, "">;
  label: string;
}> = [
  { value: "gifts", label: "Gifts" },
  { value: "hangouts", label: "Hangouts" },
  { value: "both", label: "Both Gifts & Hangouts" },
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

function getWishListStatusStyles(status: string) {
  const normalizedStatus = status.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "bg-[#E6F7EC] text-[#1FAB54]";
  }

  if (normalizedStatus === "ongoing") {
    return "bg-[#E8F0FF] text-[#2F6BFF]";
  }

  return "bg-[#FFF1DD] text-[#FF9D1C]";
}

function formatWishListStatus(status?: string | null): WishListStatus {
  const normalizedStatus = status?.trim().toLowerCase();

  if (!normalizedStatus) {
    return "Draft";
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}

function formatWishListEventDate(value?: string | null) {
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

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const [datePart] = value.split("T");
  return datePart ?? "";
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function toWishlistDeadlineIsoDate(value: string) {
  return `${value}T10:00:00.000Z`;
}

function isDateLaterThan(dateValue: string, comparedToValue: string) {
  if (!dateValue || !comparedToValue) {
    return false;
  }

  return dateValue > comparedToValue;
}

function getParticipantDisplayName(participant: WishlistEventParticipant) {
  const actor = participant.eventContact ?? participant.user;

  if (!actor) {
    return "Participant";
  }

  return `${actor.firstName} ${actor.lastName}`.trim() || actor.email || "Participant";
}

function mapWishlistParticipants(participants: WishlistEventParticipant[] = []) {
  return createParticipants(participants.map(getParticipantDisplayName));
}

function mapWishlistRecordToRow(record: WishlistEventRecord): WishListRow {
  const createdBy = record.event.createdBy
    ? `${record.event.createdBy.firstName} ${record.event.createdBy.lastName}`.trim()
    : "—";

  return {
    id: record.id,
    wishlistEventId: record.id,
    eventId: record.eventId,
    eventName: record.event.title || "Untitled event",
    eventDate: formatWishListEventDate(record.event.eventDate),
    eventDeadline: formatWishListEventDate(record.eventDeadline),
    eventDateValue: toDateInputValue(record.event.eventDate),
    eventDeadlineValue: toDateInputValue(record.eventDeadline),
    eventTypeId: record.event.eventTypeId,
    titleValue: record.event.title || "Untitled event",
    allowMultipleItems: record.allowMultipleItems,
    visibility: record.visibility,
    createdBy: createdBy || "—",
    participants: mapWishlistParticipants(record.event.participants ?? []),
    status: formatWishListStatus(record.event.status),
  };
}

function hasWishListFlowDraft(
  selection:
    | {
        lastVisitedStep: WishListModalStep | null;
        selectedEventTypeId: string;
        eventDate: string;
        eventDeadline: string;
        eventName: string;
        celebrationType: WishListCelebrationType;
      }
    | undefined
    | null,
) {
  if (!selection) {
    return false;
  }

  return Boolean(
    selection.lastVisitedStep ||
      selection.selectedEventTypeId ||
      selection.eventDate ||
      selection.eventDeadline ||
      selection.eventName ||
      selection.celebrationType,
  );
}

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
        getWishListStatusStyles(status),
      )}
    >
      {status}
    </span>
  );
}

function WishListRowActions({
  row,
  onEdit,
  onRequestDelete,
}: {
  row: WishListRow;
  onEdit: (row: WishListRow) => void;
  onRequestDelete: (row: WishListRow) => void;
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
            onSelect={() => {
              toast("Wishlist view will be connected next.");
            }}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            <ViewIcon className="size-4 text-[#292D32]" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onEdit(row)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            <EditPencilIcon className="size-4 text-[#292D32]" />
            Edit Wish List
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#F0ECFA]" />
          <DropdownMenuItem
            onSelect={() => onRequestDelete(row)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#E04F4F] focus:bg-[#FDEEEE] focus:text-[#E04F4F]"
          >
            <DeleteIcon className="size-4 text-[#DC2626]" />
            Delete Wish List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function WishListScreen() {
  const authUser = useAuthStore((state) => state.user);
  const {
    isOpen,
    currentStep,
    mode,
    eventId,
    wishlistEventId,
    openModal,
    setCurrentStep,
    closeModal,
  } = useWishListModalRouteState();
  const flowSelectionsByKey = useWishListFlowStore(
    (state) => state.flowSelectionsByKey,
  );
  const setWishListDraftFields = useWishListFlowStore(
    (state) => state.setDraftFields,
  );
  const setStoredSelectedWishlistGiftIds = useWishListFlowStore(
    (state) => state.setSelectedWishlistGiftIds,
  );
  const setStoredSelectedWishlistGiftProductsById = useWishListFlowStore(
    (state) => state.setSelectedWishlistGiftProductsById,
  );
  const resetWishListFlowSelection = useWishListFlowStore(
    (state) => state.resetFlowSelection,
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistInviteSearchValue, setWishlistInviteSearchValue] = useState("");
  const [isWishlistInviteCopyListOpen, setIsWishlistInviteCopyListOpen] =
    useState(false);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<WishListRow | null>(
    null,
  );

  const {
    data: availableEventTypesResponse,
    isError: isAvailableEventTypesError,
    refetch: refetchAvailableEventTypes,
  } = useAvailableEventTypesQuery({
    per_page: 25,
    page: 1,
  });
  const createWishlistEventMutation = useCreateWishlistEventMutation();
  const updateWishlistEventMutation = useUpdateWishlistEventMutation();
  const createBulkGiftsMutation = useCreateBulkGiftsMutation();
  const {
    data: wishlistEventsResponse,
    isError: isWishlistEventsError,
    isFetching: isWishlistEventsFetching,
    isLoading: isWishlistEventsLoading,
    refetch: refetchWishlistEvents,
  } = useWishlistEventsQuery({
    per_page: 10,
    page: currentPage,
    searchQuery: debouncedSearchValue,
  });

  const flowSelectionKey = useMemo(
    () => buildWishListFlowSelectionKey(mode, wishlistEventId, eventId),
    [eventId, mode, wishlistEventId],
  );
  const storedFlowSelection = useWishListFlowStore(
    (state) => state.flowSelectionsByKey[flowSelectionKey],
  );
  const flowSelection = useMemo(
    () => ({
      ...EMPTY_WISHLIST_FLOW_SELECTION,
      ...(storedFlowSelection ?? {}),
    }),
    [storedFlowSelection],
  );
  const selectedEventTypeId = flowSelection.selectedEventTypeId;
  const selectedWishListDate = flowSelection.eventDate;
  const selectedWishListDeadline = flowSelection.eventDeadline;
  const wishListSuggestedName = flowSelection.eventName;
  const selectedCelebrationType = flowSelection.celebrationType;
  const selectedWishlistGiftIds = flowSelection.selectedWishlistGiftIds;
  const selectedWishlistGiftProductsById =
    flowSelection.selectedWishlistGiftProductsById;
  const greetingName = authUser?.firstName?.trim() || "Susan";
  const isWishlistGiftSelectionStep = currentStep === "gift-selection";
  const isWishlistInviteStep = currentStep === "invite";
  const {
    data: myParticipantResponse,
    isLoading: isMyParticipantLoading,
    isFetching: isMyParticipantFetching,
    refetch: refetchMyParticipant,
  } = useMyParticipantQuery(eventId, {
    enabled:
      isOpen &&
      (isWishlistGiftSelectionStep || isWishlistInviteStep) &&
      Boolean(eventId),
  });
  const currentParticipantId = myParticipantResponse?.data?.id ?? null;

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
  const wishlistInviteParticipants = useMemo<DrawNameInviteParticipant[]>(() => {
    if (!authUser || !currentParticipantId) {
      return [];
    }

    const firstName = authUser.firstName?.trim() ?? "";
    const lastName = authUser.lastName?.trim() ?? "";
    const fullName = `${firstName} ${lastName}`.trim() || authUser.email || "Participant";
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
      .trim()
      .toUpperCase() || "WL";

    return [
      {
        id: currentParticipantId,
        participantId: currentParticipantId,
        name: fullName,
        role:
          myParticipantResponse?.data?.role === "creator"
            ? "Creator"
            : "Participant",
        initials,
        avatarBg: "#EFE6FD",
        avatarColor: "#3300C9",
        inviteUrl: null,
      },
    ];
  }, [authUser, currentParticipantId, myParticipantResponse?.data?.role]);
  const filteredWishlistInviteParticipants = useMemo(() => {
    const normalizedSearchValue = wishlistInviteSearchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return wishlistInviteParticipants;
    }

    return wishlistInviteParticipants.filter((participant) =>
      participant.name.toLowerCase().includes(normalizedSearchValue),
    );
  }, [wishlistInviteParticipants, wishlistInviteSearchValue]);
  const wishListRows = useMemo(
    () =>
      (wishlistEventsResponse?.data?.data ?? []).map(mapWishlistRecordToRow),
    [wishlistEventsResponse],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    setSelected((current) =>
      current.filter((selectedId) =>
        wishListRows.some((row) => row.id === selectedId),
      ),
    );
  }, [wishListRows]);

  const allChecked =
    wishListRows.length > 0 && selected.length === wishListRows.length;

  const toggleAll = () => {
    if (allChecked) {
      setSelected([]);
      return;
    }

    setSelected(wishListRows.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((rowId) => rowId !== id)
        : [...previous, id],
    );
  };

  useEffect(() => {
    if (isOpen && currentStep !== "event" && !wishlistEventId) {
      closeModal();
    }
  }, [closeModal, currentStep, isOpen, wishlistEventId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setWishListDraftFields(flowSelectionKey, {
      lastVisitedStep: currentStep,
    });
  }, [
    currentStep,
    flowSelectionKey,
    isOpen,
    setWishListDraftFields,
  ]);

  useEffect(() => {
    if (!isOpen || mode !== "edit" || !wishlistEventId) {
      return;
    }

    const matchingRow = wishListRows.find(
      (row) => row.wishlistEventId === wishlistEventId,
    );
    const createFlowSelection =
      flowSelectionsByKey[
        buildWishListFlowSelectionKey("create", wishlistEventId, eventId)
      ] ?? EMPTY_WISHLIST_FLOW_SELECTION;

    if (!matchingRow) {
      if (
        hasWishListFlowDraft(createFlowSelection) &&
        !hasWishListFlowDraft(flowSelection)
      ) {
        setWishListDraftFields(flowSelectionKey, {
          lastVisitedStep:
            createFlowSelection.lastVisitedStep && isWishListModalStep(createFlowSelection.lastVisitedStep)
              ? createFlowSelection.lastVisitedStep
              : "event",
          selectedEventTypeId: createFlowSelection.selectedEventTypeId,
          eventDate: createFlowSelection.eventDate,
          eventDeadline: createFlowSelection.eventDeadline,
          eventName: createFlowSelection.eventName,
          celebrationType: createFlowSelection.celebrationType,
        });
      }

      return;
    }

    const sourceSelection = hasWishListFlowDraft(flowSelection)
      ? flowSelection
      : createFlowSelection;
    const nextFields: {
      lastVisitedStep?: WishListModalStep;
      selectedEventTypeId?: string;
      eventDate?: string;
      eventDeadline?: string;
      eventName?: string;
      celebrationType?: Exclude<WishListCelebrationType, "">;
    } = {};

    if (!flowSelection.selectedEventTypeId) {
      const nextSelectedEventTypeId =
        sourceSelection.selectedEventTypeId || matchingRow.eventTypeId;

      if (nextSelectedEventTypeId) {
        nextFields.selectedEventTypeId = nextSelectedEventTypeId;
      }
    }

    if (!flowSelection.eventDate) {
      const nextEventDate =
        sourceSelection.eventDate || matchingRow.eventDateValue;

      if (nextEventDate) {
        nextFields.eventDate = nextEventDate;
      }
    }

    if (!flowSelection.eventDeadline) {
      const nextEventDeadline =
        sourceSelection.eventDeadline || matchingRow.eventDeadlineValue;

      if (nextEventDeadline) {
        nextFields.eventDeadline = nextEventDeadline;
      }
    }

    if (!flowSelection.eventName) {
      const nextEventName =
        sourceSelection.eventName || matchingRow.titleValue;

      if (nextEventName) {
        nextFields.eventName = nextEventName;
      }
    }

    if (!flowSelection.celebrationType && sourceSelection.celebrationType) {
      nextFields.celebrationType = sourceSelection.celebrationType;
    }

    if (!flowSelection.lastVisitedStep) {
      nextFields.lastVisitedStep =
        sourceSelection.lastVisitedStep &&
        isWishListModalStep(sourceSelection.lastVisitedStep)
          ? sourceSelection.lastVisitedStep
          : "event";
    }

    if (Object.keys(nextFields).length > 0) {
      setWishListDraftFields(flowSelectionKey, nextFields);
    }
  }, [
    eventId,
    flowSelection,
    flowSelectionKey,
    flowSelectionsByKey,
    isOpen,
    mode,
    setWishListDraftFields,
    wishListRows,
    wishlistEventId,
  ]);

  const handleOpenCreateWishListModal = () => {
    resetWishListFlowSelection(
      buildWishListFlowSelectionKey("create", null, null),
    );
    openModal("event", "create", null, null);
  };

  const handleOpenEditWishListModal = (row: WishListRow) => {
    const editFlowKey = buildWishListFlowSelectionKey(
      "edit",
      row.wishlistEventId,
      row.eventId,
    );
    const createFlowKey = buildWishListFlowSelectionKey(
      "create",
      row.wishlistEventId,
      row.eventId,
    );
    const existingEditSelection =
      flowSelectionsByKey[editFlowKey] ?? EMPTY_WISHLIST_FLOW_SELECTION;
    const existingCreateSelection =
      flowSelectionsByKey[createFlowKey] ?? EMPTY_WISHLIST_FLOW_SELECTION;
    const sourceSelection = hasWishListFlowDraft(existingEditSelection)
      ? existingEditSelection
      : existingCreateSelection;
    const resumeStep =
      sourceSelection.lastVisitedStep &&
      isWishListModalStep(sourceSelection.lastVisitedStep)
        ? sourceSelection.lastVisitedStep
        : "event";

    setWishListDraftFields(editFlowKey, {
      lastVisitedStep: resumeStep,
      selectedEventTypeId:
        sourceSelection.selectedEventTypeId || row.eventTypeId,
      eventDate: sourceSelection.eventDate || row.eventDateValue,
      eventDeadline:
        sourceSelection.eventDeadline || row.eventDeadlineValue,
      eventName: sourceSelection.eventName || row.titleValue,
      celebrationType: sourceSelection.celebrationType,
    });
    if (
      !existingEditSelection.selectedWishlistGiftIds.length &&
      existingCreateSelection.selectedWishlistGiftIds.length
    ) {
      setStoredSelectedWishlistGiftIds(
        editFlowKey,
        existingCreateSelection.selectedWishlistGiftIds,
      );
    }
    if (
      !Object.keys(existingEditSelection.selectedWishlistGiftProductsById).length &&
      Object.keys(existingCreateSelection.selectedWishlistGiftProductsById).length
    ) {
      setStoredSelectedWishlistGiftProductsById(
        editFlowKey,
        existingCreateSelection.selectedWishlistGiftProductsById,
      );
    }
    openModal(resumeStep, "edit", row.eventId, row.wishlistEventId);
  };

  const handleCreateWishList = async () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    if (mode === "edit") {
      if (!wishListSuggestedName.trim()) {
        setWishListDraftFields(flowSelectionKey, {
          eventName: selectedEventTypeOption.label,
        });
      }

      if (!wishlistEventId) {
        toast.error("Unable to resolve this wish list right now.");
        return;
      }

      try {
        await updateWishlistEventMutation.mutateAsync({
          id: wishlistEventId,
          payload: {
            event: {
              eventTypeId: selectedEventTypeOption.value,
            },
          },
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update this wish list right now.",
        );
        return;
      }

      setCurrentStep("event-date", "edit", eventId, wishlistEventId);
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
      const nextWishlistEventId = response.data.id;
      const nextEventId = response.data.eventId;
      const nextFlowKey = buildWishListFlowSelectionKey(
        "create",
        nextWishlistEventId,
        nextEventId,
      );

      setWishListDraftFields(nextFlowKey, {
        lastVisitedStep: "event-date",
        selectedEventTypeId,
        eventDate: selectedWishListDate,
        eventDeadline: selectedWishListDeadline,
        eventName: response.data.event.title || selectedEventTypeOption.label,
        celebrationType: selectedCelebrationType,
      });

      if (flowSelectionKey !== nextFlowKey) {
        resetWishListFlowSelection(flowSelectionKey);
      }

      toast.success(response.message);
      setCurrentStep(
        "event-date",
        "create",
        nextEventId,
        nextWishlistEventId,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create this wish list right now.",
      );
    }
  };

  const handleWishListEventDateNext = async () => {
    if (!selectedWishListDate) {
      return;
    }

    if (!wishlistEventId) {
      toast.error("Unable to resolve this wish list right now.");
      return;
    }

    try {
      await updateWishlistEventMutation.mutateAsync({
        id: wishlistEventId,
        payload: {
          event: {
            eventDate: toIsoDate(selectedWishListDate),
          },
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this wish list right now.",
      );
      return;
    }

    setCurrentStep("gift-deadline", mode, eventId, wishlistEventId);
  };

  const handleWishListDeadlineNext = async () => {
    if (!selectedWishListDeadline) {
      return;
    }

    if (isDateLaterThan(selectedWishListDeadline, selectedWishListDate)) {
      toast.error("Gift deadline cannot be later than the event date.");
      return;
    }

    if (!wishListSuggestedName.trim()) {
      setWishListDraftFields(flowSelectionKey, {
        eventName: selectedEventTypeOption?.label ?? "",
      });
    }

    if (!wishlistEventId) {
      toast.error("Unable to resolve this wish list right now.");
      return;
    }

    try {
      await updateWishlistEventMutation.mutateAsync({
        id: wishlistEventId,
        payload: {
          eventDeadline: toWishlistDeadlineIsoDate(selectedWishListDeadline),
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this wish list right now.",
      );
      return;
    }

    setCurrentStep("event-name", mode, eventId, wishlistEventId);
  };

  const handleSaveWishListDetails = async () => {
    if (!wishlistEventId) {
      toast.error("Unable to resolve this wish list right now.");
      return;
    }

    if (!selectedEventTypeId || !selectedWishListDate || !selectedWishListDeadline) {
      toast.error("Please complete all wish list details.");
      return;
    }

    if (isDateLaterThan(selectedWishListDeadline, selectedWishListDate)) {
      toast.error("Gift deadline cannot be later than the event date.");
      return;
    }

    try {
      const response = await updateWishlistEventMutation.mutateAsync({
        id: wishlistEventId,
        payload: {
          eventDeadline: toWishlistDeadlineIsoDate(selectedWishListDeadline),
          event: {
            title:
              wishListSuggestedName.trim() ||
              selectedEventTypeOption?.label ||
              "Untitled event",
            eventTypeId: selectedEventTypeId,
            eventDate: toIsoDate(selectedWishListDate),
          },
        },
      });

      toast.success(response.message);
      setWishListDraftFields(flowSelectionKey, {
        eventName:
          wishListSuggestedName.trim() ||
          selectedEventTypeOption?.label ||
          "Untitled event",
      });
      setCurrentStep("celebration-type", mode, eventId, wishlistEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this wish list right now.",
      );
    }
  };

  const handleWishListCelebrationTypeNext = () => {
    if (!selectedCelebrationType) {
      return;
    }

    setCurrentStep("gift-selection", mode, eventId, wishlistEventId);
  };

  const handleWishlistGiftProductToggle = (
    product: MarketplaceProduct,
    checked: boolean,
  ) => {
    if (checked) {
      setStoredSelectedWishlistGiftProductsById(flowSelectionKey, {
        ...selectedWishlistGiftProductsById,
        [product._id]: product,
      });
      return;
    }

    if (!(product._id in selectedWishlistGiftProductsById)) {
      return;
    }

    const nextProductsById = { ...selectedWishlistGiftProductsById };
    delete nextProductsById[product._id];
    setStoredSelectedWishlistGiftProductsById(
      flowSelectionKey,
      nextProductsById,
    );
  };

  const handleWishListGiftSelectionNext = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this wish list event right now.");
      return;
    }

    let resolvedParticipantId = currentParticipantId;

    if (!resolvedParticipantId) {
      const refreshedParticipantResponse = await refetchMyParticipant();
      resolvedParticipantId =
        refreshedParticipantResponse.data?.data?.id ?? null;
    }

    if (!resolvedParticipantId) {
      toast.error("Unable to resolve your participant record right now.");
      return;
    }

    const selectedProducts = selectedWishlistGiftIds
      .map((selectedId) => selectedWishlistGiftProductsById[selectedId])
      .filter((product): product is MarketplaceProduct => Boolean(product));

    if (!selectedProducts.length) {
      toast.error("Please select at least one gift before continuing.");
      return;
    }

    const hasIncompleteGiftDetails = selectedProducts.some(
      (product) =>
        !product.title?.trim() ||
        product.title.trim() === "Selected gift" ||
        !Number.isFinite(product.amount) ||
        product.amount <= 0,
    );

    if (hasIncompleteGiftDetails) {
      toast.error(
        "Some selected gifts are not fully loaded yet. Please reselect them before continuing.",
      );
      return;
    }

    try {
      const response = await createBulkGiftsMutation.mutateAsync({
        eventId,
        recipientParticipantId: resolvedParticipantId,
        gifts: selectedProducts.map((product) => ({
          participantGiftId: product._id,
          title: product.title,
          description: product.description ?? "",
          amount: product.amount,
          currency: "NGN",
          imageUrl: product.images[0] || undefined,
          categorySlug: product.categorySlug || undefined,
          subCategorySlug: product.subCategorySlug || undefined,
          condition: product.condition || undefined,
          locationState: product.location?.state || undefined,
          locationCity: product.location?.city || undefined,
          sellerId: product.sellerId || undefined,
          productSlug: product.slug || undefined,
        })),
      });

      toast.success(response.message);
      setCurrentStep("invite", mode, eventId, wishlistEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
            : "Unable to save selected gifts right now.",
      );
    }
  };

  const handleWishlistInviteBack = () => {
    setCurrentStep("gift-selection", mode, eventId, wishlistEventId);
  };

  const handleWishlistInviteSendEmail = () => {
    toast("Wishlist invitation emails will be connected next.");
  };

  const handleWishlistInviteToggleCopyList = () => {
    setIsWishlistInviteCopyListOpen((current) => !current);
  };

  const handleWishlistInviteCopyLink = () => {
    toast.error(
      "No invitation link is available for this participant yet.",
    );
  };

  const handleDeleteWishList = async () => {
    if (!pendingDeleteRow) {
      return;
    }

    toast("Wishlist delete will be connected next.");
    setPendingDeleteRow(null);
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
        id: "eventDeadline",
        header: "Event Deadline",
        accessor: "eventDeadline",
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

          return row.participants.length > 0 ? (
            <ParticipantStack
              participants={visibleParticipants}
              overflowCount={overflowCount}
            />
          ) : (
            <span className="text-[#9A97A5]">—</span>
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
          <WishListRowActions
            row={row}
            onEdit={handleOpenEditWishListModal}
            onRequestDelete={setPendingDeleteRow}
          />
        ),
      },
    ],
    rows: wishListRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[12px] last:border-r last:rounded-r-[12px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selected.includes(row.id) ? "" : "group"),
    emptyState: (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">
          {isWishlistEventsLoading || isWishlistEventsFetching
            ? "Loading wish list activity..."
            : isWishlistEventsError
              ? "Unable to load wish list activity."
              : "No wish list activity found."}
        </p>
        {isWishlistEventsError ? (
          <button
            type="button"
            onClick={() => refetchWishlistEvents()}
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
        title="Create Wish List"
        description="Create and manage your gifts preference"
        actions={
          <>
            <Button
              type="button"
              onClick={handleOpenCreateWishListModal}
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
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setCurrentPage(1);
                }}
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

        <Pagination
          total={Math.max(wishlistEventsResponse?.data.totalPages ?? 1, 1)}
          initialPage={currentPage}
          onPageChange={setCurrentPage}
          className="mt-4"
        />
      </section>

      <ContentModal
        open={isOpen}
        onClose={closeModal}
        title="Create Wish List"
        showHeader={false}
        closeOnOverlayClick={false}
        bodyScrollable={!isWishlistGiftSelectionStep}
        dialogClassName={cn(
          "rounded-[20px] bg-white",
          isWishlistGiftSelectionStep
            ? "max-w-[1240px]"
            : isWishlistInviteStep
              ? "max-w-[700px]"
            : "max-w-[536px]",
        )}
        bodyClassName={cn(
          isWishlistGiftSelectionStep
            ? "flex h-[90vh] min-h-0 px-6 py-6 sm:px-6 sm:py-6"
            : "px-8 py-10 sm:px-10 sm:py-10",
        )}
      >
        {currentStep === "event" ? (
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
              onValueChange={(value) =>
                setWishListDraftFields(flowSelectionKey, {
                  selectedEventTypeId: value,
                })
              }
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
        ) : currentStep === "event-name" ? (
          <GroupNameStep
            value={wishListSuggestedName}
            onChange={(value) =>
              setWishListDraftFields(flowSelectionKey, {
                eventName: value,
              })
            }
            onBack={() =>
              setCurrentStep("gift-deadline", mode, eventId, wishlistEventId)
            }
            onNext={handleSaveWishListDetails}
            title="Below is a suggestion of a name for your event."
            description="Feel free to edit as you see fit."
            placeholder="Write event name"
            nextLabel={
              updateWishlistEventMutation.isPending ? "Saving..." : "Next"
            }
            nextDisabled={updateWishlistEventMutation.isPending}
          />
        ) : currentStep === "celebration-type" ? (
          <div className="space-y-8 pt-1">
            <div className="space-y-3 text-left">
              <p className="text-[20px] font-medium leading-tight text-[#434343]">
                Let&apos;s get to the good part!
              </p>
              <p className="max-w-[360px] text-[20px] font-normal leading-[1.35] text-[#434343]">
                What would you like to have for your{" "}
                <span className="font-medium">
                  &apos;
                  {(selectedEventTypeOption?.label ?? wishListSuggestedName) ||
                    "Event"}
                  &apos;
                </span>{" "}
                celebration?
              </p>
            </div>

            <div className="space-y-3">
              {wishListCelebrationTypeOptions.map((option) => {
                const isSelected = selectedCelebrationType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setWishListDraftFields(flowSelectionKey, {
                        celebrationType: option.value,
                      })
                    }
                    className={cn(
                      "flex h-[42px] w-full items-center justify-center rounded-[10px] border text-[14px] font-medium transition-colors",
                      isSelected
                        ? "border-[#3300C9] bg-[#F6F2FF] text-[#3300C9]"
                        : "border-[#3300C9] bg-white text-[#3300C9] hover:bg-[#F8F5FF]",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <BackButton
                onClick={() =>
                  setCurrentStep("event-name", mode, eventId, wishlistEventId)
                }
                className="flex min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />

              <ModalButton
                type="button"
                onClick={handleWishListCelebrationTypeNext}
                disabled={!selectedCelebrationType}
                className="!h-[38px] max-w-[100px] rounded-[18px]"
              >
                Next
              </ModalButton>
            </div>
          </div>
        ) : currentStep === "gift-selection" ? (
          <WishlistGiftSelectionStep
            selectedIds={selectedWishlistGiftIds}
            onSelectedIdsChange={(ids) =>
              setStoredSelectedWishlistGiftIds(flowSelectionKey, ids)
            }
            onSelectedProductToggle={handleWishlistGiftProductToggle}
            onBack={() =>
              setCurrentStep("celebration-type", mode, eventId, wishlistEventId)
            }
            onNext={handleWishListGiftSelectionNext}
            nextDisabled={
              !selectedWishlistGiftIds.length ||
              createBulkGiftsMutation.isPending ||
              isMyParticipantLoading ||
              isMyParticipantFetching
            }
            nextLabel={
              createBulkGiftsMutation.isPending
                ? "Saving..."
                : isMyParticipantLoading || isMyParticipantFetching
                  ? "Loading..."
                  : "Next"
            }
          />
        ) : currentStep === "invite" ? (
          <DrawNameInviteStep
            onBack={handleWishlistInviteBack}
            participants={filteredWishlistInviteParticipants}
            isCopyListOpen={isWishlistInviteCopyListOpen}
            onToggleCopyList={handleWishlistInviteToggleCopyList}
            onSendEmail={handleWishlistInviteSendEmail}
            onCopyLink={handleWishlistInviteCopyLink}
            searchValue={wishlistInviteSearchValue}
            onSearchValueChange={setWishlistInviteSearchValue}
          />
        ) : (
          <>
            {currentStep === "event-date" ? (
              <EventDateStep
                eventName={selectedEventTypeOption?.label ?? "Event"}
                value={selectedWishListDate}
                onChange={(value) =>
                  setWishListDraftFields(flowSelectionKey, {
                    eventDate: value,
                  })
                }
                onBack={() =>
                  setCurrentStep("event", mode, eventId, wishlistEventId)
                }
                onNext={handleWishListEventDateNext}
                heading="What's the date?"
                headingAlign="left"
                showGoToEventNameLink={false}
              />
            ) : (
              <EventDateStep
                eventName="Gift Deadline"
                value={selectedWishListDeadline}
                onChange={(value) =>
                  setWishListDraftFields(flowSelectionKey, {
                    eventDeadline: value,
                  })
                }
                onBack={() =>
                  setCurrentStep("event-date", mode, eventId, wishlistEventId)
                }
                onNext={handleWishListDeadlineNext}
                heading="Gift Deadline"
                headingAlign="left"
                showGoToEventNameLink={false}
              />
            )}
          </>
        )}
      </ContentModal>

      <ConfirmationModal
        open={Boolean(pendingDeleteRow)}
        onClose={() => setPendingDeleteRow(null)}
        onConfirm={handleDeleteWishList}
        action="delete"
        title="Delete Wish List"
        description={
          pendingDeleteRow
            ? `Are you sure you want to delete ${pendingDeleteRow.eventName}?`
            : "Are you sure you want to delete this wish list?"
        }
        confirmText="Delete"
        isLoading={false}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </div>
  );
}

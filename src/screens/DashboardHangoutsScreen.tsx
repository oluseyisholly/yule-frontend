"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  CalendarDaysIcon,
  LayoutGridIcon,
  ListIcon,
  MoreHorizontal,
  SearchIcon,
  Settings2Icon,
  TrendingUpIcon,
  UploadIcon,
  UsersIcon,
} from "lucide-react";
import AddColleagueForm, {
  type AddColleagueFormValues,
} from "@/components/AddColleagueForm";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import DrawNameInviteStep, {
  type DrawNameInviteParticipant,
} from "@/components/DrawNameInviteStep";
import PageHeader from "@/components/dashboard/PageHeader";
import EventDateStep from "@/components/EventDateStep";
import GroupNameStep from "@/components/GroupNameStep";
import HangoutGuestCountStep from "@/components/HangoutGuestCountStep";
import ModalButton from "@/components/ModalButtons";
import OverlayRecordPicker from "@/components/OverlayRecordPicker";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import UserAvatar from "@/components/UserAvatar";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import DeleteIcon from "@/components/icons/DeleteIcon";
import EditPencilIcon from "@/components/icons/EditPencilIcon";
import FilterIcon from "@/components/icons/FilterIcon";
import InviteEmailIcon from "@/components/icons/InviteEmailIcon";
import ViewIcon from "@/components/icons/ViewIcon";
import Pagination from "@/components/Pagination";
import {
  ModalPanelSkeleton,
  TableLoadingState,
} from "@/components/ui/context-skeletons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { Input } from "@/components/ui/input";
import ContentModal from "@/components/ui/modal";
import Table, { type TableData } from "@/components/ui/Table";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import featureImg5 from "@/assets/icons/featureImg5.svg";
import featureImg6 from "@/assets/icons/featureImg6.svg";
import { useContactsQuery } from "@/features/contacts/hooks/useContactsQuery";
import { useCreateContactMutation } from "@/features/contacts/hooks/useCreateContactMutation";
import { useDeleteContactMutation } from "@/features/contacts/hooks/useDeleteContactMutation";
import { useEnsureMyContactMutation } from "@/features/contacts/hooks/useEnsureMyContactMutation";
import { useUpdateContactMutation } from "@/features/contacts/hooks/useUpdateContactMutation";
import type { Contact } from "@/features/contacts/types";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import { canManageHangoutEvent } from "@/features/hangout-events/access";
import { useCompleteHangoutEventMutation } from "@/features/hangout-events/hooks/useCompleteHangoutEventMutation";
import { useCreateHangoutEventMutation } from "@/features/hangout-events/hooks/useCreateHangoutEventMutation";
import { useDeleteHangoutEventMutation } from "@/features/hangout-events/hooks/useDeleteHangoutEventMutation";
import { useHangoutEventQuery } from "@/features/hangout-events/hooks/useHangoutEventQuery";
import { useHangoutEventsQuery } from "@/features/hangout-events/hooks/useHangoutEventsQuery";
import { useHangoutMetricsQuery } from "@/features/hangout-events/hooks/useHangoutMetricsQuery";
import { useUpdateHangoutEventMutation } from "@/features/hangout-events/hooks/useUpdateHangoutEventMutation";
import type {
  HangoutEventActor,
  HangoutEventParticipant,
  HangoutEventRecord,
} from "@/features/hangout-events/types";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useCreateParticipantsBulkMutation } from "@/features/participants/hooks/useCreateParticipantsBulkMutation";
import { cn } from "@/lib/utils";
import {
  isHangoutModalStep,
  type HangoutModalStep,
} from "@/screens/hangouts/modal-steps";
import { useHangoutModalRouteState } from "@/screens/hangouts/useHangoutModalRouteState";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildHangoutFlowSelectionKey,
  EMPTY_HANGOUT_FLOW_SELECTION,
  type HangoutFlowSelectionState,
  useHangoutFlowStore,
} from "@/stores/hangout-flow-store";

type ViewMode = "list" | "grid";
type HangoutStatusLabel = "Past" | "Upcoming";
type HangoutActivityTab = "organizer" | "participant";

type HangoutMetric = {
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
  icon: ReactNode;
  iconBg: string;
};

type HangoutParticipantBubble = {
  id: string;
  initials: string;
  profileUrl?: string | null;
  bg: string;
  color: string;
  name: string;
};

type HangoutRow = {
  id: string;
  eventId: string;
  hangoutEventId: string | null;
  eventTypeId: string;
  eventStatus: string;
  venueName: string;
  location: string;
  eventName: string;
  eventDateValue: string;
  checkInDateValue: string;
  checkOutDateValue: string;
  numberOfGuestsValue: string;
  checkInDate: string;
  amount: string;
  dateCreated: string;
  status: HangoutStatusLabel;
  image: StaticImageData | string;
  gallery: Array<StaticImageData | string>;
  participants: HangoutParticipantBubble[];
  participantContactIds: string[];
  createdBy: string;
  canManage: boolean;
  description: string;
  guests: string;
  vendorName: string;
  vendorVerified: boolean;
};

const PAGE_SIZE = 5;
const fallbackHangoutImages = [
  featureImg1,
  featureImg2,
  featureImg3,
  featureImg4,
  featureImg5,
  featureImg6,
];
const RECORD_AVATAR_STYLES = [
  { avatarBg: "#FCEEC8", avatarColor: "#8A5B00" },
  { avatarBg: "#D9F4E2", avatarColor: "#1C8C4B" },
  { avatarBg: "#EFE6FD", avatarColor: "#3300C9" },
  { avatarBg: "#FDE0DE", avatarColor: "#C34040" },
  { avatarBg: "#DDF0FF", avatarColor: "#0067C9" },
  { avatarBg: "#E8E6F8", avatarColor: "#5A4CB8" },
] as const;
const EMPTY_NEW_COLLEAGUE_FORM: AddColleagueFormValues = {
  gender: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
};

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
          onClick={() =>
            toast(`${metric.label} options will be connected next.`)
          }
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

function formatHangoutMetricValue(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatHangoutMetricCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function ParticipantStack({
  participants,
}: {
  participants: HangoutParticipantBubble[];
}) {
  const visibleParticipants = participants.slice(0, 3);
  const overflowCount = Math.max(
    participants.length - visibleParticipants.length,
    0,
  );

  return (
    <div className="flex items-center -space-x-2">
      {visibleParticipants.map((participant) => (
        <UserAvatar
          key={participant.id}
          name={participant.name}
          initials={participant.initials}
          imageUrl={participant.profileUrl}
          bgColor={participant.bg}
          textColor={participant.color}
          className="size-8 border border-white text-[9px] font-semibold"
          title={participant.name}
        />
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
  status: HangoutStatusLabel;
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

function HangoutRowActions({
  row,
  activeTab,
  onView,
  onEdit,
  onDelete,
}: {
  row: HangoutRow;
  activeTab: HangoutActivityTab;
  onView: (row: HangoutRow) => void;
  onEdit: (row: HangoutRow) => void;
  onDelete: (row: HangoutRow) => void;
}) {
  const normalizedEventStatus = row.eventStatus.trim().toLowerCase();
  const isCompletedEvent = normalizedEventStatus === "completed";
  const canManageRow = activeTab === "organizer" && row.canManage;
  const canDeleteRow = canManageRow && !isCompletedEvent;

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

          {canManageRow ? (
            <>
              <DropdownMenuItem
                onSelect={() => onEdit(row)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
              >
                {isCompletedEvent ? (
                  <InviteEmailIcon className="size-4 text-[#292D32]" />
                ) : (
                  <EditPencilIcon className="size-4 text-[#292D32]" />
                )}
                {isCompletedEvent ? "Invite Hangout" : "Edit Hangout"}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!canDeleteRow}
                onSelect={() => {
                  if (!canDeleteRow) {
                    return;
                  }

                  onDelete(row);
                }}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm focus:bg-[#FFF4F3]",
                  canDeleteRow
                    ? "cursor-pointer text-[#E04F4F] focus:text-[#E04F4F]"
                    : "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]",
                )}
              >
                <DeleteIcon
                  className={cn(
                    "size-4",
                    canDeleteRow ? "text-[#E04F4F]" : "text-[#B8B5C3]",
                  )}
                />
                Delete Hangout
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function HangoutGridCard({
  row,
  activeTab,
  onView,
  onEdit,
  onDelete,
}: {
  row: HangoutRow;
  activeTab: HangoutActivityTab;
  onView: (row: HangoutRow) => void;
  onEdit: (row: HangoutRow) => void;
  onDelete: (row: HangoutRow) => void;
}) {
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
          {row.checkInDate}
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
          onClick={() => onView(row)}
          className="inline-flex h-8 flex-1 items-center justify-center rounded-full bg-[#3300C9] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#2D00B4]"
        >
          View Details
        </button>

        <div className="shrink-0">
          <HangoutRowActions
            row={row}
            activeTab={activeTab}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  );
}

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

function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function toIsoDate(value: string) {
  return new Date(`${value}T00:00:00`).toISOString();
}

function normalizeAmount(value?: number | string | null) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCurrency(
  amount?: number | string | null,
  currency: string = "NGN",
) {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  const numericAmount = normalizeAmount(amount);

  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `${currency} ${new Intl.NumberFormat("en-NG", {
      maximumFractionDigits: 0,
    }).format(numericAmount)}`;
  }
}

function getContactAvatarStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return RECORD_AVATAR_STYLES[hash % RECORD_AVATAR_STYLES.length];
}

function toDisplayName(person?: HangoutEventActor | null) {
  if (!person) {
    return "";
  }

  const fullName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();

  return fullName || person.email?.trim() || "";
}

function mapContactToRecordItem(
  contact: Contact,
  currentUserContactId: string | null,
): SearchableRecordItem {
  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const firstInitial = contact.firstName.trim().charAt(0);
  const lastInitial = contact.lastName.trim().charAt(0);
  const { avatarBg, avatarColor } = getContactAvatarStyle(
    contact.id || fullName,
  );

  return {
    id: contact.id,
    name:
      fullName ||
      contact.email ||
      contact.phone ||
      contact.phoneNumber ||
      "Unnamed contact",
    subtitle:
      contact.email ||
      contact.phone ||
      contact.phoneNumber ||
      contact.note ||
      "Contact",
    email: contact.email,
    createdById: contact.createdById ?? null,
    isManageable: Boolean(
      currentUserContactId && contact.createdById === currentUserContactId,
    ),
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: contact.phoneNumber || contact.phone || "",
    gender:
      contact.gender === "male" || contact.gender === "female"
        ? contact.gender
        : "",
    profileUrl: contact.profileUrl?.trim() || null,
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
  };
}

function mapHangoutParticipantToRecordItem(
  participant: HangoutEventParticipant,
): SearchableRecordItem | null {
  const contact = participant.eventContact;

  if (!contact) {
    return null;
  }

  const fullName = `${contact.firstName} ${contact.lastName}`.trim();
  const firstInitial = contact.firstName.trim().charAt(0);
  const lastInitial = contact.lastName.trim().charAt(0);
  const { avatarBg, avatarColor } = getContactAvatarStyle(
    contact.id || fullName || participant.id,
  );

  return {
    id: contact.id || participant.eventContactId || participant.id,
    name: fullName || contact.email || "Unnamed contact",
    subtitle: contact.email || "Contact",
    email: contact.email,
    createdById: null,
    isManageable: false,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phoneNumber: "",
    gender: "",
    profileUrl: contact.profileUrl?.trim() || null,
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
  };
}

function mergeRecordItems(...groups: SearchableRecordItem[][]) {
  const nextRecordItemsById = new Map<string, SearchableRecordItem>();

  groups.flat().forEach((item) => {
    nextRecordItemsById.set(item.id, item);
  });

  return Array.from(nextRecordItemsById.values());
}

function toHangoutStatus(record: HangoutEventRecord): HangoutStatusLabel {
  const referenceDate = record.checkInDate || record.event.eventDate;

  if (!referenceDate) {
    return "Upcoming";
  }

  const parsedDate = new Date(referenceDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Upcoming";
  }

  parsedDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return parsedDate < today ? "Past" : "Upcoming";
}

function toHangoutParticipantBubble(
  participant: HangoutEventParticipant,
): HangoutParticipantBubble | null {
  const name = toDisplayName(participant.eventContact);

  if (!name) {
    return null;
  }

  const contactId = participant.eventContact?.id || participant.id;
  const firstInitial =
    participant.eventContact?.firstName?.trim().charAt(0) ?? "";
  const lastInitial =
    participant.eventContact?.lastName?.trim().charAt(0) ?? "";
  const initials =
    `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
    name.slice(0, 2).toUpperCase();
  const { avatarBg, avatarColor } = getContactAvatarStyle(contactId);

  return {
    id: contactId,
    initials,
    profileUrl: participant.eventContact?.profileUrl?.trim() || null,
    bg: avatarBg,
    color: avatarColor,
    name,
  };
}

function normalizeHangoutFlowSelection(
  selection?: Partial<HangoutFlowSelectionState> | null,
): HangoutFlowSelectionState {
  return {
    ...EMPTY_HANGOUT_FLOW_SELECTION,
    ...(selection ?? {}),
    selectedParticipantContactIds: Array.isArray(
      selection?.selectedParticipantContactIds,
    )
      ? selection.selectedParticipantContactIds
      : EMPTY_HANGOUT_FLOW_SELECTION.selectedParticipantContactIds,
  };
}

function hasHangoutFlowDraft(selection: HangoutFlowSelectionState) {
  return (
    selection.lastVisitedStep !==
      EMPTY_HANGOUT_FLOW_SELECTION.lastVisitedStep ||
    selection.selectedEventTypeId !==
      EMPTY_HANGOUT_FLOW_SELECTION.selectedEventTypeId ||
    selection.eventDate !== EMPTY_HANGOUT_FLOW_SELECTION.eventDate ||
    selection.eventName !== EMPTY_HANGOUT_FLOW_SELECTION.eventName ||
    selection.checkInDate !== EMPTY_HANGOUT_FLOW_SELECTION.checkInDate ||
    selection.checkOutDate !== EMPTY_HANGOUT_FLOW_SELECTION.checkOutDate ||
    selection.guestCount !== EMPTY_HANGOUT_FLOW_SELECTION.guestCount ||
    selection.selectedParticipantContactIds.length > 0 ||
    selection.selectedListingIds.length > 0 ||
    Object.keys(selection.selectedListingsById).length > 0
  );
}

function toHangoutEventRow(
  record: HangoutEventRecord,
  canManage: boolean,
  index: number,
): HangoutRow {
  const allParticipants = record.event.participants ?? [];
  const participants = allParticipants
    .map(toHangoutParticipantBubble)
    .filter((participant): participant is HangoutParticipantBubble =>
      Boolean(participant),
    );
  const participantContactIds = Array.from(
    new Set(
      allParticipants
        .filter(
          (participant) =>
            participant.role?.trim().toLowerCase() === "participant" &&
            Boolean(participant.eventContactId?.trim()),
        )
        .map((participant) => participant.eventContactId!.trim()),
    ),
  );
  const fallbackImage =
    fallbackHangoutImages[index % fallbackHangoutImages.length];
  const resolvedImage = record.imageUrl?.trim() || fallbackImage;

  return {
    id: record.eventId,
    eventId: record.eventId,
    hangoutEventId: record.hangoutEventId?.trim() || null,
    eventTypeId: record.event.eventTypeId,
    eventStatus: record.event.status?.trim() || "",
    venueName: record.location?.trim() || "Hangout venue",
    location: record.location?.trim() || "-",
    eventName: record.event.title?.trim() || "Untitled hangout",
    eventDateValue: toDateInputValue(record.event.eventDate),
    checkInDateValue: toDateInputValue(record.checkInDate),
    checkOutDateValue: toDateInputValue(record.checkOutDate),
    numberOfGuestsValue:
      typeof record.numberOfGuests === "number" && record.numberOfGuests > 0
        ? String(record.numberOfGuests)
        : "",
    checkInDate: formatDate(record.checkInDate || record.event.eventDate),
    amount: formatCurrency(record.amount, "NGN"),
    dateCreated: formatDate(record.checkInDate || record.event.eventDate),
    status: toHangoutStatus(record),
    image: resolvedImage,
    gallery: Array.from({ length: 5 }, () => resolvedImage),
    participants,
    participantContactIds,
    createdBy: toDisplayName(record.event.createdBy) || "-",
    canManage,
    description:
      record.event.description?.trim() || "Hangout details will be added soon.",
    guests:
      record.numberOfGuests && record.numberOfGuests > 0
        ? `${record.numberOfGuests} guest${record.numberOfGuests > 1 ? "s" : ""}`
        : "-",
    vendorName: record.event.title?.trim() || "Hangout host",
    vendorVerified: false,
  };
}

export default function DashboardHangoutsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<HangoutActivityTab>("organizer");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recordSearchValue, setRecordSearchValue] = useState("");
  const [debouncedRecordSearchValue, setDebouncedRecordSearchValue] =
    useState("");
  const [customContactRecordItems, setCustomContactRecordItems] = useState<
    SearchableRecordItem[]
  >([]);
  const [newColleagueForm, setNewColleagueForm] =
    useState<AddColleagueFormValues>(EMPTY_NEW_COLLEAGUE_FORM);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordPendingDelete, setRecordPendingDelete] =
    useState<SearchableRecordItem | null>(null);
  const { data: hangoutMetricsData } = useHangoutMetricsQuery();
  const [pendingDeleteHangoutRow, setPendingDeleteHangoutRow] =
    useState<HangoutRow | null>(null);
  const [
    isCompleteHangoutEventConfirmationOpen,
    setIsCompleteHangoutEventConfirmationOpen,
  ] = useState(false);
  const [isHangoutInviteCopyListOpen, setIsHangoutInviteCopyListOpen] =
    useState(false);
  const [hangoutInviteSearchValue, setHangoutInviteSearchValue] = useState("");
  const [ensuredCurrentContactId, setEnsuredCurrentContactId] = useState<
    string | null
  >(null);
  const [hasEnsuredCurrentContact, setHasEnsuredCurrentContact] =
    useState(false);
  const [ensureCurrentContactRequested, setEnsureCurrentContactRequested] =
    useState(false);
  const [hangoutMetricsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const setCurrentContactId = useAuthStore(
    (state) => state.setCurrentContactId,
  );
  const greetingName = authUser?.firstName?.trim() || "there";
  const resolvedCurrentContactId =
    currentContactId?.trim() || ensuredCurrentContactId;

  const {
    isOpen: isHangoutFlowOpen,
    currentStep: currentHangoutFlowStep,
    mode,
    eventId,
    legacyEventTypeId,
    openModal: openHangoutFlowModal,
    setCurrentStep: setHangoutFlowStep,
    replaceCurrentStep: replaceHangoutFlowStep,
    closeModal: closeHangoutFlowModal,
  } = useHangoutModalRouteState();
  const flowSelectionKey = buildHangoutFlowSelectionKey(mode, eventId);
  const flowSelectionsByKey = useHangoutFlowStore(
    (state) => state.flowSelectionsByKey,
  );
  const setHangoutFlowDraftFields = useHangoutFlowStore(
    (state) => state.setDraftFields,
  );
  const setSelectedParticipantContactIds = useHangoutFlowStore(
    (state) => state.setSelectedParticipantContactIds,
  );
  const setStoredSelectedListingIds = useHangoutFlowStore(
    (state) => state.setSelectedListingIds,
  );
  const setSelectedListingsById = useHangoutFlowStore(
    (state) => state.setSelectedListingsById,
  );
  const resetHangoutFlowSelection = useHangoutFlowStore(
    (state) => state.resetFlowSelection,
  );
  const currentFlowSelection = useMemo(
    () => normalizeHangoutFlowSelection(flowSelectionsByKey[flowSelectionKey]),
    [flowSelectionKey, flowSelectionsByKey],
  );
  const selectedHangoutEventTypeId = currentFlowSelection.selectedEventTypeId;
  const selectedHangoutEventDate = currentFlowSelection.eventDate;
  const hangoutEventName = currentFlowSelection.eventName;
  const selectedHangoutCheckInDate = currentFlowSelection.checkInDate;
  const selectedHangoutCheckOutDate = currentFlowSelection.checkOutDate;
  const selectedHangoutGuestCount = currentFlowSelection.guestCount;
  const selectedListingIds = currentFlowSelection.selectedListingIds;
  const selectedListingsById = currentFlowSelection.selectedListingsById;
  const selectedParticipantContactIds =
    currentFlowSelection.selectedParticipantContactIds;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, viewMode]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [activeTab]);

  const {
    data: availableEventTypesResponse,
    isLoading: isAvailableEventTypesLoading,
    isError: isAvailableEventTypesError,
    refetch: refetchAvailableEventTypes,
  } = useAvailableEventTypesQuery(
    {
      page: 1,
      per_page: 100,
    },
    {
      enabled: isHangoutFlowOpen && currentHangoutFlowStep === "event",
    },
  );
  const {
    data: hangoutEventsResponse,
    isLoading: isHangoutEventsLoading,
    isFetching: isHangoutEventsFetching,
    isError: isHangoutEventsError,
    refetch: refetchHangoutEvents,
  } = useHangoutEventsQuery({
    scope: activeTab,
    page: currentPage,
    per_page: PAGE_SIZE,
    searchQuery: debouncedQuery,
  });
  const {
    data: currentHangoutEventRecord,
    refetch: refetchCurrentHangoutEvent,
  } = useHangoutEventQuery(isHangoutFlowOpen && eventId ? eventId : null);
  const selectedMarketplaceListingId =
    currentHangoutEventRecord?.hangoutEventId?.trim() || null;
  const { data: selectedMarketplaceListing } = useMarketplaceProductQuery(
    selectedMarketplaceListingId,
    {
      enabled:
        isHangoutFlowOpen &&
        currentHangoutFlowStep === "hangout-selection" &&
        Boolean(selectedMarketplaceListingId),
    },
  );
  const createHangoutEventMutation = useCreateHangoutEventMutation();
  const updateHangoutEventMutation = useUpdateHangoutEventMutation();
  const completeHangoutEventMutation = useCompleteHangoutEventMutation();
  const deleteHangoutEventMutation = useDeleteHangoutEventMutation();
  const createEventTypeMutation = useCreateEventTypeMutation();
  const updateEventTypeMutation = useUpdateEventTypeMutation();
  const deleteEventTypeMutation = useDeleteEventTypeMutation();
  const ensureMyContactMutation = useEnsureMyContactMutation();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();
  const createParticipantsBulkMutation = useCreateParticipantsBulkMutation();
  const shouldEnableContactsQuery =
    isHangoutFlowOpen &&
    (currentHangoutFlowStep === "record" ||
      currentHangoutFlowStep === "add-record");
  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
    isFetching: isContactsFetching,
    isError: isContactsError,
    refetch: refetchContacts,
  } = useContactsQuery(
    {
      per_page: 25,
      page: 1,
      searchQuery: debouncedRecordSearchValue,
    },
    {
      enabled: shouldEnableContactsQuery,
    },
  );

  const totalPages = Math.max(1, hangoutEventsResponse?.data.totalPages ?? 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const eventTypeOptions = useMemo<OverlaySelectOption[]>(
    () =>
      (availableEventTypesResponse?.data?.data ?? [])
        .filter((eventType) => eventType.isActive)
        .map((eventType) => ({
          value: eventType.id,
          label: eventType.name,
          icon: getEventTypeIcon(eventType.key),
          isManageable: Boolean(eventType.user_id ?? eventType.createdById),
        })),
    [availableEventTypesResponse],
  );
  const selectedEventTypeOption = useMemo(
    () =>
      eventTypeOptions.find(
        (eventType) => eventType.value === selectedHangoutEventTypeId,
      ) ?? null,
    [eventTypeOptions, selectedHangoutEventTypeId],
  );
  const eventRows = useMemo<HangoutRow[]>(
    () =>
      (hangoutEventsResponse?.data.data ?? []).map((record, index) =>
        toHangoutEventRow(
          record,
          canManageHangoutEvent(record, {
            currentUserId: authUser?.id ?? null,
            currentContactId,
          }),
          index,
        ),
      ),
    [authUser?.id, currentContactId, hangoutEventsResponse?.data.data],
  );
  const currentEventRow = useMemo(() => {
    const listedRow = eventRows.find((row) => row.eventId === eventId);

    if (listedRow) {
      return listedRow;
    }

    if (!currentHangoutEventRecord || !eventId) {
      return null;
    }

    return toHangoutEventRow(
      currentHangoutEventRecord,
      canManageHangoutEvent(currentHangoutEventRecord, {
        currentUserId: authUser?.id ?? null,
        currentContactId,
      }),
      0,
    );
  }, [
    authUser?.id,
    currentContactId,
    currentHangoutEventRecord,
    eventId,
    eventRows,
  ]);
  const selectedParticipantRecordItems = useMemo(
    () =>
      mergeRecordItems(
        (currentHangoutEventRecord?.event.participants ?? [])
          .filter(
            (participant) =>
              participant.role?.trim().toLowerCase() === "participant",
          )
          .map(mapHangoutParticipantToRecordItem)
          .filter((participant): participant is SearchableRecordItem =>
            Boolean(participant),
          ),
      ),
    [currentHangoutEventRecord],
  );
  const fetchedContactRecordItems = useMemo(
    () =>
      (contactsResponse?.data.data ?? []).map((contact) =>
        mapContactToRecordItem(contact, resolvedCurrentContactId),
      ),
    [contactsResponse?.data.data, resolvedCurrentContactId],
  );
  const contactRecordOptions = useMemo(
    () =>
      mergeRecordItems(
        customContactRecordItems,
        selectedParticipantRecordItems,
        fetchedContactRecordItems,
      ),
    [
      customContactRecordItems,
      fetchedContactRecordItems,
      selectedParticipantRecordItems,
    ],
  );
  const hangoutInviteParticipants = useMemo<DrawNameInviteParticipant[]>(() => {
    const eventParticipants =
      currentHangoutEventRecord?.event.participants?.filter(
        (participant) =>
          participant.role?.trim().toLowerCase() === "participant",
      ) ?? [];

    if (eventParticipants.length) {
      return eventParticipants
        .map((participant) => {
          const contact = participant.eventContact;
          const name = toDisplayName(contact);

          if (!contact || !name) {
            return null;
          }

          const firstInitial = contact.firstName?.trim().charAt(0) ?? "";
          const lastInitial = contact.lastName?.trim().charAt(0) ?? "";
          const initials =
            `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
            name.slice(0, 2).toUpperCase();
          const { avatarBg, avatarColor } = getContactAvatarStyle(
            contact.id || participant.eventContactId || participant.id,
          );

          return {
            id: contact.id || participant.eventContactId || participant.id,
            participantId: participant.id,
            name,
            role: contact.email || "Pending invite",
            initials: initials || "CT",
            avatarBg: avatarBg || "#EFE6FD",
            avatarColor: avatarColor || "#3300C9",
            inviteUrl: null,
          } satisfies DrawNameInviteParticipant;
        })
        .filter(Boolean) as DrawNameInviteParticipant[];
    }

    return selectedParticipantContactIds
      .map((contactId) => {
        const record = contactRecordOptions.find(
          (item) => item.id === contactId,
        );

        if (!record) {
          return null;
        }

        return {
          id: record.id,
          participantId: record.id,
          name: record.name,
          role: record.email || record.subtitle || "Pending invite",
          initials: record.initials || "CT",
          avatarBg: record.avatarBg || "#EFE6FD",
          avatarColor: record.avatarColor || "#3300C9",
          inviteUrl: null,
        } satisfies DrawNameInviteParticipant;
      })
      .filter(Boolean) as DrawNameInviteParticipant[];
  }, [
    contactRecordOptions,
    currentHangoutEventRecord?.event.participants,
    selectedParticipantContactIds,
  ]);
  const hangoutMetrics = useMemo<HangoutMetric[]>(
    () => [
      {
        value: formatHangoutMetricValue(
          hangoutMetricsData?.totalHangouts.value ?? 0,
        ),
        label: "Total Hangout",
        hint: `${(hangoutMetricsData?.totalHangouts.percentageChangeThisMonth ?? 0) >= 0 ? "+" : ""}${hangoutMetricsData?.totalHangouts.percentageChangeThisMonth ?? 0}% this month`,
        hintColor: "#3300C9",
        icon: (
          <CalendarDaysIcon
            className="size-5 text-[#3300C9]"
            strokeWidth={1.8}
          />
        ),
        iconBg: "#EFE6FD",
      },
      {
        value: formatHangoutMetricValue(
          hangoutMetricsData?.peopleMet.value ?? 0,
        ),
        label: "People Met",
        icon: <UsersIcon className="size-5 text-[#E9A300]" strokeWidth={1.8} />,
        iconBg: "#FFF1DD",
      },
      {
        value: formatHangoutMetricValue(
          hangoutMetricsData?.totalThisMonth.value ?? 0,
        ),
        label: "Total this month",
        hint: `+${hangoutMetricsData?.totalThisMonth.newThisWeek ?? 0} new this week`,
        hintColor: "#24A959",
        icon: (
          <CalendarDaysIcon
            className="size-5 text-[#1FAB54]"
            strokeWidth={1.8}
          />
        ),
        iconBg: "#D9F4E2",
      },
      {
        value: formatHangoutMetricCurrency(
          hangoutMetricsData?.amountSpent.value ?? 0,
        ),
        label: "Amount Spent",
        hint: `${(hangoutMetricsData?.amountSpent.percentageChangeThisMonth ?? 0) >= 0 ? "+" : ""}${hangoutMetricsData?.amountSpent.percentageChangeThisMonth ?? 0}% this month`,
        hintColor: "#FF6E6E",
        icon: (
          <TrendingUpIcon className="size-5 text-[#FF6E6E]" strokeWidth={1.8} />
        ),
        iconBg: "#FDE0DE",
      },
    ],
    [hangoutMetricsData],
  );
  const filteredHangoutInviteParticipants = useMemo(() => {
    const normalizedSearch = hangoutInviteSearchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return hangoutInviteParticipants;
    }

    return hangoutInviteParticipants.filter((participant) =>
      participant.name.toLowerCase().includes(normalizedSearch),
    );
  }, [hangoutInviteParticipants, hangoutInviteSearchValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedRecordSearchValue(recordSearchValue.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [recordSearchValue]);

  useEffect(() => {
    if (currentContactId?.trim()) {
      setEnsuredCurrentContactId(currentContactId.trim());
      setHasEnsuredCurrentContact(true);
      setEnsureCurrentContactRequested(true);
    }
  }, [currentContactId]);

  useEffect(() => {
    if (!shouldEnableContactsQuery) {
      return;
    }

    if (
      hasEnsuredCurrentContact ||
      ensureCurrentContactRequested ||
      ensureMyContactMutation.isPending
    ) {
      return;
    }

    let isCancelled = false;

    const ensureCurrentContact = async () => {
      setEnsureCurrentContactRequested(true);

      try {
        const response = await ensureMyContactMutation.mutateAsync();
        const nextContactId = response.data?.id?.trim() || null;

        if (isCancelled) {
          return;
        }

        if (nextContactId) {
          setEnsuredCurrentContactId(nextContactId);
          setCurrentContactId(nextContactId);
        }

        setHasEnsuredCurrentContact(true);
      } catch {
        if (isCancelled) {
          return;
        }

        setEnsureCurrentContactRequested(false);
      }
    };

    void ensureCurrentContact();

    return () => {
      isCancelled = true;
    };
  }, [
    ensureCurrentContactRequested,
    ensureMyContactMutation,
    hasEnsuredCurrentContact,
    setCurrentContactId,
    shouldEnableContactsQuery,
  ]);

  useEffect(() => {
    if (
      !isHangoutFlowOpen ||
      mode !== "edit" ||
      !eventId ||
      !currentHangoutEventRecord
    ) {
      return;
    }

    const nextFields: Partial<HangoutFlowSelectionState> = {};

    if (!selectedHangoutEventTypeId) {
      nextFields.selectedEventTypeId =
        currentHangoutEventRecord.event.eventTypeId;
    }

    if (!selectedHangoutEventDate) {
      nextFields.eventDate = toDateInputValue(
        currentHangoutEventRecord.event.eventDate,
      );
    }

    if (!hangoutEventName.trim()) {
      nextFields.eventName =
        currentHangoutEventRecord.event.title?.trim() || "Untitled hangout";
    }

    if (!selectedHangoutCheckInDate) {
      nextFields.checkInDate = toDateInputValue(
        currentHangoutEventRecord.checkInDate,
      );
    }

    if (!selectedHangoutCheckOutDate) {
      nextFields.checkOutDate = toDateInputValue(
        currentHangoutEventRecord.checkOutDate,
      );
    }

    if (!selectedHangoutGuestCount) {
      nextFields.guestCount =
        typeof currentHangoutEventRecord.numberOfGuests === "number" &&
        currentHangoutEventRecord.numberOfGuests > 0
          ? String(currentHangoutEventRecord.numberOfGuests)
          : "";
    }

    if (Object.keys(nextFields).length > 0) {
      setHangoutFlowDraftFields(flowSelectionKey, nextFields);
    }
  }, [
    currentHangoutEventRecord,
    eventId,
    flowSelectionKey,
    hangoutEventName,
    isHangoutFlowOpen,
    mode,
    selectedHangoutCheckInDate,
    selectedHangoutCheckOutDate,
    selectedHangoutEventDate,
    selectedHangoutGuestCount,
    selectedHangoutEventTypeId,
    setHangoutFlowDraftFields,
  ]);

  useEffect(() => {
    if (
      !isHangoutFlowOpen ||
      mode !== "edit" ||
      !eventId ||
      selectedParticipantContactIds.length > 0
    ) {
      return;
    }

    if (!currentEventRow?.participantContactIds.length) {
      return;
    }

    setSelectedParticipantContactIds(
      flowSelectionKey,
      currentEventRow.participantContactIds,
    );
  }, [
    currentEventRow,
    eventId,
    flowSelectionKey,
    isHangoutFlowOpen,
    mode,
    selectedParticipantContactIds.length,
    setSelectedParticipantContactIds,
  ]);

  useEffect(() => {
    if (!isHangoutFlowOpen || !eventId) {
      return;
    }

    if (!selectedListingIds.length && selectedMarketplaceListingId) {
      setStoredSelectedListingIds(flowSelectionKey, [
        selectedMarketplaceListingId,
      ]);
    }
  }, [
    eventId,
    flowSelectionKey,
    isHangoutFlowOpen,
    selectedListingIds.length,
    selectedMarketplaceListingId,
    setStoredSelectedListingIds,
  ]);

  useEffect(() => {
    if (
      !isHangoutFlowOpen ||
      !selectedMarketplaceListingId ||
      !selectedMarketplaceListing
    ) {
      return;
    }

    if (selectedListingsById[selectedMarketplaceListingId]) {
      return;
    }

    setSelectedListingsById(flowSelectionKey, {
      ...selectedListingsById,
      [selectedMarketplaceListingId]: selectedMarketplaceListing,
    });
  }, [
    flowSelectionKey,
    isHangoutFlowOpen,
    selectedListingsById,
    selectedMarketplaceListing,
    selectedMarketplaceListingId,
    setSelectedListingsById,
  ]);

  useEffect(() => {
    if (!isHangoutFlowOpen) {
      return;
    }

    setHangoutFlowDraftFields(flowSelectionKey, {
      lastVisitedStep: currentHangoutFlowStep,
    });
  }, [
    currentHangoutFlowStep,
    flowSelectionKey,
    isHangoutFlowOpen,
    setHangoutFlowDraftFields,
  ]);

  useEffect(() => {
    if (
      !isHangoutFlowOpen ||
      currentHangoutFlowStep !== "event" ||
      !legacyEventTypeId
    ) {
      return;
    }

    if (!selectedHangoutEventTypeId) {
      setHangoutFlowDraftFields(flowSelectionKey, {
        selectedEventTypeId: legacyEventTypeId,
      });
    }

    replaceHangoutFlowStep("event", mode, eventId);
  }, [
    currentHangoutFlowStep,
    eventId,
    flowSelectionKey,
    isHangoutFlowOpen,
    legacyEventTypeId,
    mode,
    replaceHangoutFlowStep,
    selectedHangoutEventTypeId,
    setHangoutFlowDraftFields,
  ]);

  useEffect(() => {
    if (isHangoutFlowOpen && currentHangoutFlowStep !== "event" && !eventId) {
      closeHangoutFlowModal();
    }
  }, [
    closeHangoutFlowModal,
    currentHangoutFlowStep,
    eventId,
    isHangoutFlowOpen,
  ]);

  const allChecked =
    eventRows.length > 0 &&
    eventRows.every((row) => selectedIds.includes(row.id));

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => eventRows.some((row) => row.id === id)),
    );
  }, [eventRows]);

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(eventRows.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const handleOpenHangoutFlow = () => {
    resetHangoutFlowSelection(buildHangoutFlowSelectionKey("create", null));
    openHangoutFlowModal("event", "create", null);
  };

  const openHangoutEventFlow = (
    row: HangoutRow,
    nextStep: HangoutModalStep,
  ) => {
    const editFlowKey = buildHangoutFlowSelectionKey("edit", row.eventId);
    const createFlowKey = buildHangoutFlowSelectionKey("create", row.eventId);
    const existingEditSelection = normalizeHangoutFlowSelection(
      flowSelectionsByKey[editFlowKey],
    );
    const existingCreateSelection = normalizeHangoutFlowSelection(
      flowSelectionsByKey[createFlowKey],
    );
    const sourceSelection = hasHangoutFlowDraft(existingEditSelection)
      ? existingEditSelection
      : existingCreateSelection;
    const nextSelectedParticipantContactIds =
      sourceSelection.selectedParticipantContactIds.length > 0
        ? sourceSelection.selectedParticipantContactIds
        : row.participantContactIds;
    const nextSelectedListingIds =
      sourceSelection.selectedListingIds.length > 0
        ? sourceSelection.selectedListingIds
        : row.hangoutEventId
          ? [row.hangoutEventId]
          : [];

    setHangoutFlowDraftFields(editFlowKey, {
      lastVisitedStep: nextStep,
      selectedEventTypeId:
        sourceSelection.selectedEventTypeId || row.eventTypeId,
      eventDate: sourceSelection.eventDate || row.eventDateValue,
      eventName: sourceSelection.eventName || row.eventName,
      checkInDate: sourceSelection.checkInDate || row.checkInDateValue,
      checkOutDate: sourceSelection.checkOutDate || row.checkOutDateValue,
      guestCount: sourceSelection.guestCount || row.numberOfGuestsValue,
    });
    setSelectedParticipantContactIds(
      editFlowKey,
      nextSelectedParticipantContactIds,
    );
    setStoredSelectedListingIds(editFlowKey, nextSelectedListingIds);

    if (
      !Object.keys(existingEditSelection.selectedListingsById).length &&
      Object.keys(existingCreateSelection.selectedListingsById).length
    ) {
      setSelectedListingsById(
        editFlowKey,
        existingCreateSelection.selectedListingsById,
      );
    }
    openHangoutFlowModal(nextStep, "edit", row.eventId);
  };

  const handleViewHangout = (row: HangoutRow) => {
    router.push(`/dashboard/hangouts/${encodeURIComponent(row.eventId)}`);
  };

  const handleEditHangout = (row: HangoutRow) => {
    const editFlowKey = buildHangoutFlowSelectionKey("edit", row.eventId);
    const createFlowKey = buildHangoutFlowSelectionKey("create", row.eventId);
    const existingEditSelection = normalizeHangoutFlowSelection(
      flowSelectionsByKey[editFlowKey],
    );
    const existingCreateSelection = normalizeHangoutFlowSelection(
      flowSelectionsByKey[createFlowKey],
    );
    const sourceSelection = hasHangoutFlowDraft(existingEditSelection)
      ? existingEditSelection
      : existingCreateSelection;
    const resumeStep =
      row.eventStatus.trim().toLowerCase() === "completed"
        ? "invite"
        : sourceSelection.lastVisitedStep &&
            isHangoutModalStep(sourceSelection.lastVisitedStep)
          ? sourceSelection.lastVisitedStep
          : "event";

    openHangoutEventFlow(row, resumeStep);
  };

  const handleDeleteHangout = async () => {
    if (!pendingDeleteHangoutRow) {
      return;
    }

    try {
      const response = await deleteHangoutEventMutation.mutateAsync(
        pendingDeleteHangoutRow.eventId,
      );
      toast.success(response.message);
      setPendingDeleteHangoutRow(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this hangout right now.",
      );
    }
  };

  const handleCreateEventOption = async (name: string) => {
    const response = await createEventTypeMutation.mutateAsync({ name });

    if (response.data?.id) {
      toast.success(response.message);

      return {
        value: response.data.id,
        label: response.data.name,
        icon: getEventTypeIcon(response.data.key ?? null),
        isManageable: Boolean(
          response.data.user_id ?? response.data.createdById,
        ),
      } satisfies OverlaySelectOption;
    }
  };

  const handleUpdateEventOption = async (
    option: OverlaySelectOption,
    name: string,
  ) => {
    const response = await updateEventTypeMutation.mutateAsync({
      id: option.value,
      payload: { name },
    });

    toast.success(response.message);

    return {
      ...option,
      label: response.data?.name ?? name,
      icon: getEventTypeIcon(response.data?.key ?? null),
      isManageable: option.isManageable,
    } satisfies OverlaySelectOption;
  };

  const handleDeleteEventOption = async (option: OverlaySelectOption) => {
    const response = await deleteEventTypeMutation.mutateAsync(option.value);
    toast.success(response.message);
  };

  const handleHangoutFlowEventNext = async () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    if (mode === "edit") {
      if (!eventId) {
        toast.error("Unable to resolve this hangout right now.");
        return;
      }

      try {
        await updateHangoutEventMutation.mutateAsync({
          eventId,
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
            : "Unable to update this hangout right now.",
        );
        return;
      }

      setHangoutFlowStep("event-date", mode, eventId);
      return;
    }

    try {
      const response = await createHangoutEventMutation.mutateAsync({
        event: {
          title: selectedEventTypeOption.label,
          eventTypeId: selectedEventTypeOption.value,
        },
      });
      const nextEventId = response.data.eventId;
      const nextFlowKey = buildHangoutFlowSelectionKey("create", nextEventId);

      setHangoutFlowDraftFields(nextFlowKey, {
        lastVisitedStep: "event-date",
        selectedEventTypeId: selectedEventTypeOption.value,
        eventDate: selectedHangoutEventDate,
        eventName: response.data.event.title || selectedEventTypeOption.label,
      });

      if (selectedParticipantContactIds.length) {
        setSelectedParticipantContactIds(
          nextFlowKey,
          selectedParticipantContactIds,
        );
      }

      if (flowSelectionKey !== nextFlowKey) {
        resetHangoutFlowSelection(flowSelectionKey);
      }

      toast.success(response.message);
      setHangoutFlowStep("event-date", "create", nextEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create this hangout right now.",
      );
    }
  };

  const handleHangoutEventDateNext = async () => {
    if (!selectedHangoutEventDate) {
      return;
    }

    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    try {
      await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          event: {
            eventDate: toIsoDate(selectedHangoutEventDate),
          },
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this hangout right now.",
      );
      return;
    }

    setHangoutFlowStep("event-name", mode, eventId);
  };

  const handleSaveHangoutEventDetails = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    if (!selectedHangoutEventTypeId || !selectedHangoutEventDate) {
      toast.error("Please complete all hangout details.");
      return;
    }

    const resolvedTitle =
      hangoutEventName.trim() ||
      selectedEventTypeOption?.label ||
      "Untitled hangout";

    try {
      const response = await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          event: {
            title: resolvedTitle,
            eventTypeId: selectedHangoutEventTypeId,
            eventDate: toIsoDate(selectedHangoutEventDate),
          },
        },
      });

      toast.success(response.message);
      setHangoutFlowDraftFields(flowSelectionKey, {
        eventName: resolvedTitle,
      });
      setHangoutFlowStep("check-in-date", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this hangout right now.",
      );
    }
  };

  const handleHangoutCheckInDateNext = async () => {
    if (!selectedHangoutCheckInDate) {
      toast.error("Please select a check-in date.");
      return;
    }

    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    try {
      await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          checkInDate: toIsoDate(selectedHangoutCheckInDate),
        },
      });
      setHangoutFlowStep("check-out-date", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this hangout right now.",
      );
    }
  };

  const handleHangoutCheckOutDateNext = async () => {
    if (!selectedHangoutCheckOutDate) {
      toast.error("Please select a check-out date.");
      return;
    }

    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    try {
      await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          checkOutDate: toIsoDate(selectedHangoutCheckOutDate),
        },
      });
      setHangoutFlowStep("record", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this hangout right now.",
      );
    }
  };

  const handleHangoutGuestCountNext = async () => {
    const parsedGuestCount = Number(selectedHangoutGuestCount);

    if (!Number.isFinite(parsedGuestCount) || parsedGuestCount <= 0) {
      toast.error("Please enter the number of guests.");
      return;
    }

    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    try {
      await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          numberOfGuests: parsedGuestCount,
        },
      });
      setHangoutFlowStep("record", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this hangout right now.",
      );
    }
  };

  const activeContactMutationPending =
    createContactMutation.isPending || updateContactMutation.isPending;
  const isSaveNewColleagueDisabled =
    !newColleagueForm.gender ||
    !newColleagueForm.firstName.trim() ||
    !newColleagueForm.lastName.trim();

  const handleOpenAddNewColleague = () => {
    setEditingRecordId(null);
    setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
    setHangoutFlowStep("add-record", mode, eventId);
  };

  const handleOpenEditColleague = (item: SearchableRecordItem) => {
    setEditingRecordId(item.id);
    setNewColleagueForm({
      gender: item.gender || "",
      firstName: item.firstName || item.name.split(" ")[0] || "",
      lastName: item.lastName || item.name.split(" ").slice(1).join(" ") || "",
      phoneNumber: item.phoneNumber || "",
      email: item.email || "",
    });
    setHangoutFlowStep("add-record", mode, eventId);
  };

  const handleNewColleagueChange = <K extends keyof AddColleagueFormValues>(
    field: K,
    value: AddColleagueFormValues[K],
  ) => {
    setNewColleagueForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveNewColleague = async () => {
    const firstNameValue = newColleagueForm.firstName.trim();
    const lastNameValue = newColleagueForm.lastName.trim();
    const genderValue = newColleagueForm.gender;

    if (!genderValue || !firstNameValue || !lastNameValue) {
      return;
    }

    try {
      const payload = {
        gender: genderValue,
        firstName: firstNameValue,
        lastName: lastNameValue,
        phoneNumber: newColleagueForm.phoneNumber.trim(),
        email: newColleagueForm.email.trim(),
      };
      const response = editingRecordId
        ? await updateContactMutation.mutateAsync({
            id: editingRecordId,
            payload,
          })
        : await createContactMutation.mutateAsync(payload);
      const savedRecord = mapContactToRecordItem(
        response.data,
        resolvedCurrentContactId,
      );

      setCustomContactRecordItems((current) =>
        mergeRecordItems(
          current.filter((item) => item.id !== savedRecord.id),
          [savedRecord],
        ),
      );

      if (!editingRecordId) {
        setSelectedParticipantContactIds(flowSelectionKey, [
          ...new Set([...selectedParticipantContactIds, response.data.id]),
        ]);
      }

      setEditingRecordId(null);
      setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
      setRecordSearchValue("");
      setDebouncedRecordSearchValue("");
      toast.success(response.message);
      await refetchContacts();
      setHangoutFlowStep("record", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editingRecordId
            ? "Unable to update contact right now."
            : "Unable to create contact right now.",
      );
    }
  };

  const handleDeleteColleague = async () => {
    if (!recordPendingDelete) {
      return;
    }

    try {
      const response = await deleteContactMutation.mutateAsync(
        recordPendingDelete.id,
      );

      setCustomContactRecordItems((current) =>
        current.filter((item) => item.id !== recordPendingDelete.id),
      );
      setSelectedParticipantContactIds(
        flowSelectionKey,
        selectedParticipantContactIds.filter(
          (selectedId) => selectedId !== recordPendingDelete.id,
        ),
      );
      setRecordPendingDelete(null);
      setEditingRecordId(null);
      setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
      toast.success(response.message);
      await refetchContacts();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete contact right now.",
      );
    }
  };

  const handleHangoutListingIdsChange = (ids: string[]) => {
    setStoredSelectedListingIds(flowSelectionKey, ids);

    const nextSelectedListingsById = Object.fromEntries(
      Object.entries(selectedListingsById).filter(([id]) => ids.includes(id)),
    ) as Record<string, MarketplaceProduct>;

    setSelectedListingsById(flowSelectionKey, nextSelectedListingsById);
  };

  const handleHangoutListingToggle = (
    product: MarketplaceProduct,
    checked: boolean,
  ) => {
    const nextListingsById = { ...selectedListingsById };

    if (checked) {
      nextListingsById[product._id] = product;
    } else {
      delete nextListingsById[product._id];
    }

    setSelectedListingsById(flowSelectionKey, nextListingsById);
  };

  const handleHangoutParticipantsNext = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant.");
      return;
    }

    try {
      const response = await createParticipantsBulkMutation.mutateAsync({
        eventId,
        role: "participant",
        contactIds: selectedParticipantContactIds,
      });

      await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          numberOfGuests: selectedParticipantContactIds.length,
        },
      });

      setHangoutFlowDraftFields(flowSelectionKey, {
        guestCount: String(selectedParticipantContactIds.length),
      });

      await Promise.all([refetchHangoutEvents(), refetchCurrentHangoutEvent()]);
      toast.success(response.message || "Participants saved successfully.");
      setHangoutFlowStep("hangout-selection", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add participants right now.",
      );
    }
  };

  const handleHangoutSelectionNext = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    if (!selectedListingIds.length) {
      toast.error("Please select a hangout option before continuing.");
      return;
    }

    const selectedProduct = selectedListingIds
      .map((selectedId) => selectedListingsById[selectedId])
      .find((product): product is MarketplaceProduct => Boolean(product));

    if (!selectedProduct) {
      toast.error(
        "The selected hangout option is not fully loaded yet. Please reselect it and try again.",
      );
      return;
    }

    try {
      const selectedProductDescription = selectedProduct.description?.trim();

      const response = await updateHangoutEventMutation.mutateAsync({
        eventId,
        payload: {
          hangoutEventId: selectedProduct._id,
          imageUrl: selectedProduct.images[0] || undefined,
          amount: selectedProduct.amount,
          event: selectedProductDescription
            ? {
                description: selectedProductDescription,
              }
            : undefined,
        },
      });

      await Promise.all([refetchHangoutEvents(), refetchCurrentHangoutEvent()]);
      toast.success(response.message || "Hangout details saved successfully.");
      setIsCompleteHangoutEventConfirmationOpen(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save this hangout option right now.",
      );
    }
  };

  const handleConfirmCompleteHangoutEvent = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this hangout right now.");
      return;
    }

    try {
      const completeResponse =
        await completeHangoutEventMutation.mutateAsync(eventId);

      await Promise.all([refetchHangoutEvents(), refetchCurrentHangoutEvent()]);
      toast.success(completeResponse.message);
      setIsCompleteHangoutEventConfirmationOpen(false);
      setIsHangoutInviteCopyListOpen(false);
      setHangoutInviteSearchValue("");
      setHangoutFlowStep("invite", mode, eventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this hangout right now.",
      );
    }
  };

  const handleHangoutInviteBack = () => {
    setHangoutFlowStep("hangout-selection", mode, eventId);
  };

  const handleHangoutInviteToggleCopyList = () => {
    setIsHangoutInviteCopyListOpen((current) => !current);
  };

  const handleHangoutInviteSendEmail = () => {
    toast("Hangout invitation email will be connected once the API is ready.");
  };

  const handleHangoutInviteCopyLink = () => {
    toast("Hangout invitation links will be available once the API is ready.");
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
        render: (row) => (
          <HangoutRowActions
            row={row}
            activeTab={activeTab}
            onView={handleViewHangout}
            onEdit={handleEditHangout}
            onDelete={setPendingDeleteHangoutRow}
          />
        ),
      },
    ],
    rows: eventRows,
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
              onClick={handleOpenHangoutFlow}
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

      <>
        <section className="sm:hidden">
          <div className="overflow-hidden" ref={hangoutMetricsEmblaRef}>
            <div className="flex gap-3">
              {hangoutMetrics.map((metric) => (
                <div key={metric.label} className="min-w-0 flex-[0_0_100%]">
                  <HangoutMetricCard metric={metric} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="hidden gap-4 sm:grid sm:grid-cols-2 xl:grid-cols-4">
          {hangoutMetrics.map((metric) => (
            <HangoutMetricCard key={metric.label} metric={metric} />
          ))}
        </section>
      </>

      <section className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[#F1EDF8] pb-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
              Hangout History
            </p>
            <div className="mt-3 flex items-center gap-5 border-b border-[#F1EDF8]">
              <button
                type="button"
                onClick={() => setActiveTab("organizer")}
                className={cn(
                  "border-b-2 pb-2 text-sm font-medium transition-colors",
                  activeTab === "organizer"
                    ? "border-[#3300C9] text-[#3300C9]"
                    : "border-transparent text-[#9A97A5] hover:text-[#5A4CB8]",
                )}
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("participant")}
                className={cn(
                  "border-b-2 pb-2 text-sm font-medium transition-colors",
                  activeTab === "participant"
                    ? "border-[#3300C9] text-[#3300C9]"
                    : "border-transparent text-[#9A97A5] hover:text-[#5A4CB8]",
                )}
              >
                Participant
              </button>
            </div>
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

        {isHangoutEventsLoading || isHangoutEventsFetching ? (
          <div className="mt-4">
            <TableLoadingState rows={5} />
          </div>
        ) : isHangoutEventsError ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-[#7D7D7D]">
              Unable to load hangouts right now.
            </p>
            <button
              type="button"
              onClick={() => void refetchHangoutEvents()}
              className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry loading hangouts
            </button>
          </div>
        ) : viewMode === "list" ? (
          <div className="mt-4 overflow-x-auto">
            <Table
              data={tableData}
              tableClassName="w-full min-w-[1120px] border-separate border-spacing-y-3"
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {eventRows.length > 0 ? (
              eventRows.map((row) => (
                <HangoutGridCard
                  key={row.id}
                  row={row}
                  activeTab={activeTab}
                  onView={handleViewHangout}
                  onEdit={handleEditHangout}
                  onDelete={setPendingDeleteHangoutRow}
                />
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

      <ConfirmationModal
        open={Boolean(pendingDeleteHangoutRow)}
        onClose={() => setPendingDeleteHangoutRow(null)}
        onConfirm={handleDeleteHangout}
        action="delete"
        title="Delete Hangout"
        description="Are you sure you want to delete this hangout?"
        confirmText="Delete"
        isLoading={deleteHangoutEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={Boolean(recordPendingDelete)}
        onClose={() => setRecordPendingDelete(null)}
        onConfirm={handleDeleteColleague}
        action="delete"
        title="Delete Contact"
        description="Are you sure you want to delete this contact?"
        confirmText="Delete"
        isLoading={deleteContactMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isCompleteHangoutEventConfirmationOpen}
        onClose={() => setIsCompleteHangoutEventConfirmationOpen(false)}
        onConfirm={handleConfirmCompleteHangoutEvent}
        action="save"
        title="Complete Hangout"
        description="Are you sure you are ready to complete this hangout and continue to the invite step?"
        confirmText="Yes, Continue"
        isLoading={completeHangoutEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ContentModal
        open={isHangoutFlowOpen}
        onClose={closeHangoutFlowModal}
        title="Plan Hangout"
        showHeader={false}
        closeOnOverlayClick={false}
        bodyScrollable={currentHangoutFlowStep !== "hangout-selection"}
        dialogClassName={cn(
          "rounded-[18px] bg-white sm:rounded-[20px]",
          currentHangoutFlowStep === "hangout-selection"
            ? "max-h-[calc(100vh-1.5rem)] max-w-[1240px]"
            : "max-w-[536px]",
        )}
        bodyClassName={cn(
          currentHangoutFlowStep === "hangout-selection"
            ? "!max-h-[calc(100vh-1.5rem)] flex h-[calc(100vh-1.5rem)] min-h-0 px-4 py-4 sm:px-8 sm:py-8 lg:px-10"
            : "px-4 py-6 sm:px-8 sm:py-10 lg:px-10",
        )}
      >
        {currentHangoutFlowStep === "event-date" ? (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Event"}
            value={selectedHangoutEventDate}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                eventDate: value,
              })
            }
            onBack={() => setHangoutFlowStep("event", mode, eventId)}
            onNext={handleHangoutEventDateNext}
            heading="What's the date?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        ) : currentHangoutFlowStep === "event-name" ? (
          <GroupNameStep
            value={hangoutEventName}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                eventName: value,
              })
            }
            onBack={() => setHangoutFlowStep("event-date", mode, eventId)}
            onNext={handleSaveHangoutEventDetails}
            title="Below is a suggestion of a name for your event."
            description="Feel free to edit as you see fit."
            placeholder="Write event name"
            nextLabel={
              updateHangoutEventMutation.isPending ? "Saving..." : "Next"
            }
            nextDisabled={updateHangoutEventMutation.isPending}
          />
        ) : currentHangoutFlowStep === "check-in-date" ? (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Hangout"}
            value={selectedHangoutCheckInDate}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                checkInDate: value,
              })
            }
            onBack={() => setHangoutFlowStep("event-name", mode, eventId)}
            onNext={handleHangoutCheckInDateNext}
            heading="When is check-in?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        ) : currentHangoutFlowStep === "check-out-date" ? (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Hangout"}
            value={selectedHangoutCheckOutDate}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                checkOutDate: value,
              })
            }
            onBack={() => setHangoutFlowStep("check-in-date", mode, eventId)}
            onNext={handleHangoutCheckOutDateNext}
            heading="When is check-out?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        ) : currentHangoutFlowStep === "hangout-selection" ? (
          <WishlistGiftSelectionStep
            selectedIds={selectedListingIds}
            onSelectedIdsChange={handleHangoutListingIdsChange}
            onSelectedProductToggle={handleHangoutListingToggle}
            onBack={() => setHangoutFlowStep("record", mode, eventId)}
            onNext={handleHangoutSelectionNext}
            nextDisabled={
              !selectedListingIds.length ||
              updateHangoutEventMutation.isPending ||
              completeHangoutEventMutation.isPending
            }
            nextLabel={
              updateHangoutEventMutation.isPending ||
              completeHangoutEventMutation.isPending
                ? "Saving..."
                : "Next"
            }
            selectionMode="single"
            title="Pick a place for your hangout."
            description="Choose one option to represent this hangout. We'll save the selected image and listing reference to your event."
            searchPlaceholder="Search for hangout"
            emptyStateText="No hangout options matched your current filters."
          />
        ) : currentHangoutFlowStep === "invite" ? (
          <DrawNameInviteStep
            title={
              <>
                Invite members to your
                <br />
                hangout.
              </>
            }
            onBack={handleHangoutInviteBack}
            participants={filteredHangoutInviteParticipants}
            isCopyListOpen={isHangoutInviteCopyListOpen}
            onToggleCopyList={handleHangoutInviteToggleCopyList}
            onSendEmail={handleHangoutInviteSendEmail}
            onCopyLink={handleHangoutInviteCopyLink}
            searchValue={hangoutInviteSearchValue}
            onSearchValueChange={setHangoutInviteSearchValue}
          />
        ) : currentHangoutFlowStep === "add-record" ? (
          <AddColleagueForm
            values={newColleagueForm}
            onChange={handleNewColleagueChange}
            onBack={() => {
              setEditingRecordId(null);
              setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
              setHangoutFlowStep("record", mode, eventId);
            }}
            onSave={handleSaveNewColleague}
            saveDisabled={isSaveNewColleagueDisabled}
            isSaving={activeContactMutationPending}
            saveLabel={editingRecordId ? "Edit" : "Save"}
            savingLabel={editingRecordId ? "Editing" : "Saving"}
          />
        ) : currentHangoutFlowStep === "record" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
                Hey {greetingName},
              </p>
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                Who&apos;d you like to hangout with?
              </p>
            </div>

            <div className="mx-auto max-w-[494px]">
              <OverlayRecordPicker
                items={contactRecordOptions}
                selectedIds={selectedParticipantContactIds}
                onSelectedIdsChange={(ids) =>
                  setSelectedParticipantContactIds(flowSelectionKey, ids)
                }
                placeholder="Search for colleague"
                panelTitle="Search for colleague"
                searchPlaceholder=""
                searchValue={recordSearchValue}
                onSearchValueChange={setRecordSearchValue}
                disableLocalFiltering
                isLoading={
                  ensureMyContactMutation.isPending ||
                  isContactsLoading ||
                  isContactsFetching
                }
                emptyStateText={
                  isContactsError
                    ? "Unable to load contacts."
                    : "No colleague found."
                }
                triggerBottomAction={
                  <BackButton
                    onClick={() =>
                      setHangoutFlowStep("check-out-date", mode, eventId)
                    }
                    className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                    iconClassName="size-[24px]"
                  />
                }
                addActionLabel="Add New"
                onAddAction={handleOpenAddNewColleague}
                onEditItem={handleOpenEditColleague}
                onDeleteItem={setRecordPendingDelete}
                suspendDismiss={Boolean(recordPendingDelete)}
                footer={
                  <ModalButton
                    type="button"
                    onClick={handleHangoutParticipantsNext}
                    disabled={
                      !selectedParticipantContactIds.length ||
                      createParticipantsBulkMutation.isPending
                    }
                  >
                    {createParticipantsBulkMutation.isPending
                      ? "Saving..."
                      : "Next"}
                  </ModalButton>
                }
                triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
              />
            </div>

            {ensureMyContactMutation.isError || isContactsError ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (ensureMyContactMutation.isError) {
                      setHasEnsuredCurrentContact(false);
                      setEnsureCurrentContactRequested(false);
                    }

                    if (isContactsError) {
                      void refetchContacts();
                    }
                  }}
                  className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  Retry loading contacts
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-7">
            <div className="space-y-2 text-left">
              <p className="text-[18px] font-medium leading-tight text-[#1E1E1E] sm:text-[20px]">
                Hi {greetingName},
              </p>
              <p className="text-[18px] font-normal text-[#434343] sm:text-[20px]">
                What event are you celebrating?
              </p>
            </div>

            {isAvailableEventTypesLoading ? (
              <ModalPanelSkeleton />
            ) : (
              <OverlaySelect
                value={
                  selectedHangoutEventTypeId ||
                  EMPTY_HANGOUT_FLOW_SELECTION.selectedEventTypeId
                }
                onValueChange={(value) =>
                  setHangoutFlowDraftFields(flowSelectionKey, {
                    selectedEventTypeId: value,
                  })
                }
                options={eventTypeOptions}
                placeholder="Select Event"
                panelTitle="Select Event"
                searchPlaceholder=""
                addActionLabel="Add New"
                onCreateOption={handleCreateEventOption}
                onUpdateOption={handleUpdateEventOption}
                onDeleteOption={handleDeleteEventOption}
                triggerClassName="text-[10px]"
              />
            )}

            {isAvailableEventTypesError ? (
              <button
                type="button"
                onClick={() => void refetchAvailableEventTypes()}
                className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry loading events
              </button>
            ) : null}

            <ModalButton
              type="button"
              onClick={handleHangoutFlowEventNext}
              disabled={
                !selectedHangoutEventTypeId ||
                createHangoutEventMutation.isPending ||
                updateHangoutEventMutation.isPending
              }
            >
              {createHangoutEventMutation.isPending ||
              updateHangoutEventMutation.isPending
                ? "Saving..."
                : "Next"}
            </ModalButton>
          </div>
        )}
      </ContentModal>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
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
import FlowActionButtons from "@/components/FlowActionButtons";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import CustomColleagueReview from "@/components/CustomColleagueReview";
import EmailInviteComposeModal from "@/components/EmailInviteComposeModal";
import DrawNameInviteStep, {
  type DrawNameInviteParticipant,
} from "@/components/DrawNameInviteStep";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import PageHeader from "@/components/dashboard/PageHeader";
import EventDateStep from "@/components/EventDateStep";
import GroupNameStep from "@/components/GroupNameStep";
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
import StatusPill from "@/components/ui/status-pill";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { Input } from "@/components/ui/input";
import ContentModal from "@/components/ui/modal";
import Table, { type TableData } from "@/components/ui/Table";
import { useContactsQuery } from "@/features/contacts/hooks/useContactsQuery";
import { useCreateContactMutation } from "@/features/contacts/hooks/useCreateContactMutation";
import { useDeleteContactMutation } from "@/features/contacts/hooks/useDeleteContactMutation";
import { useEnsureMyContactMutation } from "@/features/contacts/hooks/useEnsureMyContactMutation";
import { useUpdateContactMutation } from "@/features/contacts/hooks/useUpdateContactMutation";
import { useCreateBulkContactsMutation } from "@/features/contacts/hooks/useCreateBulkContactsMutation";
import type { Contact } from "@/features/contacts/types";
import { useExternalBusinessesQuery } from "@/features/auth/hooks/useExternalBusinessesQuery";
import {
  type OnedaProfile,
  useOnedaProfilesQuery,
} from "@/features/auth/hooks/useOnedaProfilesQuery";
import type { ExternalBusinessRecord } from "@/features/auth/types";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import { canManageHangoutEvent } from "@/features/hangout-events/access";
import { useCompleteHangoutEventMutation } from "@/features/hangout-events/hooks/useCompleteHangoutEventMutation";
import { useDeleteHangoutEventMutation } from "@/features/hangout-events/hooks/useDeleteHangoutEventMutation";
import { useHangoutEventQuery } from "@/features/hangout-events/hooks/useHangoutEventQuery";
import { useHangoutEventsQuery } from "@/features/hangout-events/hooks/useHangoutEventsQuery";
import { useHangoutMetricsQuery } from "@/features/hangout-events/hooks/useHangoutMetricsQuery";
import { useSetupHangoutEventMutation } from "@/features/hangout-events/hooks/useSetupHangoutEventMutation";
import { useUpdateHangoutEventSetupMutation } from "@/features/hangout-events/hooks/useUpdateHangoutEventSetupMutation";
import type {
  HangoutEventActor,
  HangoutEventParticipant,
  HangoutEventRecord,
  HangoutEventSetupPayload,
} from "@/features/hangout-events/types";
import { useContactGiftCartItemsQuery } from "@/features/gifts/hooks/useContactGiftCartItemsQuery";
import { useContactGiftCartParticipantGiftIdsQuery } from "@/features/gifts/hooks/useContactGiftCartParticipantGiftIdsQuery";
import type { ContactGiftCartItem } from "@/features/gifts/types";
import { useMarketplaceProductQuery } from "@/features/marketplace/hooks/useMarketplaceProductQuery";
import type {
  MarketplaceCondition,
  MarketplaceProduct,
} from "@/features/marketplace/types";
import { useEventParticipantIdsQuery } from "@/features/participants/hooks/useEventParticipantIdsQuery";
import { useSendEmailMutation } from "@/features/email/hooks/useSendEmailMutation";
import { cn, shareInvite } from "@/lib/utils";
import {
  buildInviteShareMessage,
  buildSignedInInviteUrl,
} from "@/lib/invite-links";
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

const FLOW_BACK_TRIGGER_CLASS =
  "flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]";

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
  hangoutId: string | null;
  eventId: string;
  hangoutEventId: string | null;
  eventTypeId: string;
  eventStatus: string;
  fulfillmentStatus: "Fulfilled" | "Not Fulfilled";
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
  image: string | null;
  gallery: string[];
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

function getHangoutInitials(value: string) {
  const chunks = value.trim().split(/\s+/).filter(Boolean);
  const first = chunks[0]?.charAt(0) ?? "";
  const second = chunks.length > 1 ? (chunks[1]?.charAt(0) ?? "") : "";

  return `${first}${second}`.toUpperCase() || "HG";
}

function HangoutImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full items-center justify-center bg-[#EFE6FD] text-[#3300C9]",
        className,
      )}
    >
      <span className="font-semibold tracking-wide">
        {getHangoutInitials(label)}
      </span>
    </div>
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
        {row.image ? (
          <Image
            src={row.image}
            alt={row.venueName}
            fill
            className="object-cover"
            sizes="40px"
          />
        ) : (
          <HangoutImagePlaceholder
            label={row.venueName}
            className="text-[12px]"
          />
        )}
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
        {row.image ? (
          <Image
            src={row.image}
            alt={row.venueName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <HangoutImagePlaceholder
            label={row.venueName}
            className="text-[34px]"
          />
        )}

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

function isDateAfter(firstDate: string, secondDate: string) {
  const firstTime = new Date(`${firstDate}T00:00:00`).getTime();
  const secondTime = new Date(`${secondDate}T00:00:00`).getTime();

  if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
    return false;
  }

  return firstTime > secondTime;
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
  _currentUserContactId: string | null,
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
    userId: contact.userId ?? null,
    createdById: contact.createdById ?? null,
    isManageable: !contact.userId,
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

function mapContactGiftCartItemToMarketplaceProduct(
  item: ContactGiftCartItem,
): MarketplaceProduct | null {
  const productId = item.participantGiftId?.trim() || item.id?.trim() || "";

  if (!productId) {
    return null;
  }

  const amount =
    typeof item.amount === "number" ? item.amount : Number(item.amount ?? 0);

  return {
    _id: productId,
    title: item.title?.trim() || "Selected gift",
    description: item.description ?? "",
    amount: Number.isFinite(amount) ? amount : 0,
    images: item.imageUrl?.trim() ? [item.imageUrl.trim()] : [],
    categorySlug: item.categorySlug || undefined,
    subCategorySlug: item.subCategorySlug || undefined,
    condition: (item.condition as MarketplaceCondition | undefined) || undefined,
    location: {
      state: item.locationState || undefined,
      city: item.locationCity || undefined,
    },
    sellerId: item.sellerId || undefined,
    slug: item.productSlug || undefined,
  };
}

function getExternalBusinessRootId(business: ExternalBusinessRecord) {
  return business.id?.trim() || business._id?.trim() || "";
}

function mapExternalBusinessToRecordItem(
  business: ExternalBusinessRecord,
): SearchableRecordItem | null {
  const businessId = getExternalBusinessRootId(business);
  const businessName = business.businessName?.trim() || "";

  if (!businessId || !businessName) {
    return null;
  }

  const subtitleParts = [
    business.businessLocation?.trim(),
    business.state?.trim(),
    business.country?.trim(),
    business.industry?.trim(),
  ].filter(Boolean);
  const { avatarBg, avatarColor } = getContactAvatarStyle(businessId);
  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return {
    id: businessId,
    name: businessName,
    subtitle: subtitleParts.join(" • ") || "Business",
    createdById: null,
    isManageable: false,
    firstName: businessName,
    lastName: "",
    phoneNumber: "",
    gender: "",
    initials: initials || "ON",
    avatarBg,
    avatarColor,
  };
}

function mapOnedaProfileToRecordItem(
  profile: OnedaProfile,
): SearchableRecordItem {
  const firstName = profile.accountId.firstName?.trim() || "";
  const lastName = profile.accountId.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = profile.accountId.email?.trim() || "";
  const { avatarBg, avatarColor } = getContactAvatarStyle(
    profile._id || email || fullName,
  );

  return {
    id: profile._id,
    name: fullName || email || "Unnamed contact",
    subtitle: email || "Contact",
    email,
    createdById: null,
    isManageable: false,
    firstName,
    lastName,
    phoneNumber: profile.accountId.phoneNumber?.trim() || "",
    gender: "",
    profileUrl: profile.profilePhotoUrl?.trim() || null,
    initials:
      `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() ||
      "CT",
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
    selectedOnedaBusinessIds: Array.isArray(selection?.selectedOnedaBusinessIds)
      ? selection.selectedOnedaBusinessIds
      : EMPTY_HANGOUT_FLOW_SELECTION.selectedOnedaBusinessIds,
    selectedOnedaContactIds: Array.isArray(selection?.selectedOnedaContactIds)
      ? selection.selectedOnedaContactIds
      : EMPTY_HANGOUT_FLOW_SELECTION.selectedOnedaContactIds,
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
    selection.selectedOnedaBusinessIds.length > 0 ||
    selection.selectedOnedaContactIds.length > 0 ||
    selection.selectedParticipantContactIds.length > 0 ||
    selection.selectedListingIds.length > 0 ||
    Object.keys(selection.selectedListingsById).length > 0
  );
}

function toHangoutEventRow(
  record: HangoutEventRecord,
  canManage: boolean,
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
  const resolvedImage = record.imageUrl?.trim() || null;

  return {
    id: record.eventId,
    hangoutId: record.id?.trim() || null,
    eventId: record.eventId,
    hangoutEventId: record.hangoutEventId?.trim() || null,
    eventTypeId: record.event.eventTypeId,
    eventStatus: record.event.status?.trim() || "",
    fulfillmentStatus: record.isFulfilled ? "Fulfilled" : "Not Fulfilled",
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
    gallery: resolvedImage ? Array.from({ length: 5 }, () => resolvedImage) : [],
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
  const [eventTypeSearchValue, setEventTypeSearchValue] = useState("");
  const [debouncedEventTypeSearchValue, setDebouncedEventTypeSearchValue] =
    useState("");
  const [customContactRecordItems, setCustomContactRecordItems] = useState<
    SearchableRecordItem[]
  >([]);
  const [locallyRemovedRecordContactIds, setLocallyRemovedRecordContactIds] =
    useState<string[]>([]);
  const [newColleagueForm, setNewColleagueForm] =
    useState<AddColleagueFormValues>(EMPTY_NEW_COLLEAGUE_FORM);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [recordPendingDelete, setRecordPendingDelete] =
    useState<SearchableRecordItem | null>(null);
  const [pendingDeleteHangoutRow, setPendingDeleteHangoutRow] =
    useState<HangoutRow | null>(null);
  const [viewingHangoutProduct, setViewingHangoutProduct] =
    useState<MarketplaceProduct | null>(null);
  const [
    isCompleteHangoutEventConfirmationOpen,
    setIsCompleteHangoutEventConfirmationOpen,
  ] = useState(false);
  const [isSavingHangoutSetupAsDraft, setIsSavingHangoutSetupAsDraft] =
    useState(false);
  const [
    isSavingHangoutSetupAndCompleting,
    setIsSavingHangoutSetupAndCompleting,
  ] = useState(false);
  const [
    isDiscardHangoutFlowConfirmationOpen,
    setIsDiscardHangoutFlowConfirmationOpen,
  ] = useState(false);
  const [isHangoutInviteEmailComposeOpen, setIsHangoutInviteEmailComposeOpen] =
    useState(false);
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
  const authToken = useAuthStore((state) => state.token);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const setCurrentContactId = useAuthStore(
    (state) => state.setCurrentContactId,
  );
  const greetingName = authUser?.firstName?.trim() || "there";
  const onedaAccountId =
    authUser?.profile?.accountId?._id?.trim() ||
    authUser?.hostAccountId?.trim() ||
    null;
  const resolvedCurrentContactId =
    currentContactId?.trim() || ensuredCurrentContactId;

  const {
    isOpen: isHangoutFlowOpen,
    currentStep: currentHangoutFlowStep,
    mode,
    eventId,
    hangoutEventId,
    legacyEventTypeId,
    openModal: openHangoutFlowModal,
    setCurrentStep: setHangoutFlowStep,
    replaceCurrentStep: replaceHangoutFlowStep,
    closeModal: closeHangoutFlowModal,
  } = useHangoutModalRouteState();
  const effectiveHangoutFlowStep =
    currentHangoutFlowStep === "event-date"
      ? "event-name"
      : currentHangoutFlowStep;
  const { data: hangoutMetricsData } = useHangoutMetricsQuery(
    !isHangoutFlowOpen,
  );
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
  const hangoutEventName = currentFlowSelection.eventName;
  const selectedHangoutCheckInDate = currentFlowSelection.checkInDate;
  const selectedHangoutCheckOutDate = currentFlowSelection.checkOutDate;
  const selectedHangoutGuestCount = currentFlowSelection.guestCount;
  const selectedOnedaBusinessIds =
    currentFlowSelection.selectedOnedaBusinessIds;
  const selectedOnedaContactIds = currentFlowSelection.selectedOnedaContactIds;
  const selectedListingIds = currentFlowSelection.selectedListingIds;
  const selectedListingsById = currentFlowSelection.selectedListingsById;
  const selectedParticipantContactIds =
    currentFlowSelection.selectedParticipantContactIds;
  const hasStoredParticipantSelection = useMemo(
    () => selectedParticipantContactIds.length > 0,
    [selectedParticipantContactIds],
  );
  const hasStoredHangoutListingSelection = useMemo(
    () =>
      selectedListingIds.length > 0 ||
      Object.keys(selectedListingsById).length > 0,
    [selectedListingIds, selectedListingsById],
  );
  const hasStoredHangoutSetupDraft = useMemo(
    () =>
      Boolean(
        selectedHangoutEventTypeId ||
          hangoutEventName.trim() ||
          selectedHangoutCheckInDate ||
          selectedHangoutCheckOutDate ||
          selectedHangoutGuestCount,
      ),
    [
      hangoutEventName,
      selectedHangoutCheckInDate,
      selectedHangoutCheckOutDate,
      selectedHangoutEventTypeId,
      selectedHangoutGuestCount,
    ],
  );
  const shouldHydrateHangoutSetupFromBackend =
    isHangoutFlowOpen &&
    mode === "edit" &&
    Boolean(eventId) &&
    ["event", "event-name", "check-in-date", "check-out-date"].includes(
      effectiveHangoutFlowStep,
    ) &&
    !hasStoredHangoutSetupDraft;
  const shouldHydrateHangoutListingFromBackend =
    isHangoutFlowOpen &&
    mode === "edit" &&
    Boolean(eventId) &&
    currentHangoutFlowStep === "hangout-selection" &&
    !hasStoredHangoutListingSelection;
  const shouldHydrateHangoutInviteFromBackend =
    isHangoutFlowOpen &&
    mode === "edit" &&
    Boolean(eventId) &&
    currentHangoutFlowStep === "invite" &&
    (!hasStoredParticipantSelection ||
      !hangoutEventId?.trim() ||
      !hangoutEventName.trim());

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
      searchQuery: debouncedEventTypeSearchValue,
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
  } = useHangoutEventsQuery(
    {
      scope: activeTab,
      page: currentPage,
      per_page: PAGE_SIZE,
      searchQuery: debouncedQuery,
    },
    {
      enabled: !isHangoutFlowOpen,
    },
  );
  const {
    data: currentHangoutEventRecord,
  } = useHangoutEventQuery(eventId ?? null, {
    enabled:
      isHangoutFlowOpen &&
      Boolean(eventId) &&
      (shouldHydrateHangoutSetupFromBackend ||
        shouldHydrateHangoutListingFromBackend ||
        shouldHydrateHangoutInviteFromBackend),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  const currentHangoutEventId =
    currentHangoutEventRecord?.hangoutEventId?.trim() || null;
  const selectedMarketplaceListingId =
    currentHangoutEventId;
  
  useEffect(() => {
    if (
      !isHangoutFlowOpen ||
      mode !== "edit" ||
      !eventId ||
      !currentHangoutEventId ||
      hangoutEventId === currentHangoutEventId
    ) {
      return;
    }

    replaceHangoutFlowStep(
      currentHangoutFlowStep,
      mode,
      eventId,
      currentHangoutEventId,
    );
  }, [
    currentHangoutEventId,
    currentHangoutFlowStep,
    eventId,
    hangoutEventId,
    isHangoutFlowOpen,
    mode,
    replaceHangoutFlowStep,
  ]);

  const {
    data: onedaBusinesses = [],
    isLoading: isOnedaBusinessesLoading,
    isFetching: isOnedaBusinessesFetching,
    isError: isOnedaBusinessesError,
    refetch: refetchOnedaBusinesses,
  } = useExternalBusinessesQuery(onedaAccountId, authToken, {
    enabled:
      isHangoutFlowOpen &&
      effectiveHangoutFlowStep === "oneda-business" &&
      Boolean(onedaAccountId) &&
      Boolean(authToken),
  });
  const selectedOnedaBusinessId = useMemo(() => {
    const candidateId = selectedOnedaBusinessIds.at(-1)?.trim() ?? "";

    if (!candidateId) {
      return null;
    }

    if (!onedaBusinesses.length) {
      return candidateId;
    }

    const selectedBusiness = onedaBusinesses.find(
      (business) => getExternalBusinessRootId(business) === candidateId,
    );

    return selectedBusiness
      ? getExternalBusinessRootId(selectedBusiness)
      : null;
  }, [onedaBusinesses, selectedOnedaBusinessIds]);
  const {
    data: onedaProfiles = [],
    isLoading: isOnedaProfilesLoading,
    isFetching: isOnedaProfilesFetching,
    isError: isOnedaProfilesError,
    refetch: refetchOnedaProfiles,
  } = useOnedaProfilesQuery(
    selectedOnedaBusinessId,
    authToken,
    debouncedRecordSearchValue,
    {
      enabled:
        isHangoutFlowOpen &&
        effectiveHangoutFlowStep === "oneda-contact" &&
        Boolean(selectedOnedaBusinessId),
    },
  );
  const { data: selectedMarketplaceListing } = useMarketplaceProductQuery(
    selectedMarketplaceListingId,
    {
      enabled:
        isHangoutFlowOpen &&
        currentHangoutFlowStep === "hangout-selection" &&
        Boolean(selectedMarketplaceListingId) &&
        shouldHydrateHangoutListingFromBackend,
    },
  );
  const {
    data: caughtMyEyeHangoutGiftIdsResponse,
    isLoading: isCaughtMyEyeHangoutGiftIdsLoading,
    isFetching: isCaughtMyEyeHangoutGiftIdsFetching,
  } = useContactGiftCartParticipantGiftIdsQuery({
    enabled:
      isHangoutFlowOpen && currentHangoutFlowStep === "hangout-selection",
  });
  const {
    data: caughtMyEyeHangoutCartItemsResponse,
    isLoading: isCaughtMyEyeHangoutCartItemsLoading,
    isFetching: isCaughtMyEyeHangoutCartItemsFetching,
  } = useContactGiftCartItemsQuery(
    {
      page: 1,
      per_page: 250,
    },
    {
      enabled:
        isHangoutFlowOpen && currentHangoutFlowStep === "hangout-selection",
    },
  );
  const caughtMyEyeHangoutGiftIds = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...(caughtMyEyeHangoutGiftIdsResponse?.data.participantGiftIds ?? []),
            ...(
              caughtMyEyeHangoutCartItemsResponse?.data.data?.map(
                (item) => item.participantGiftId,
              ) ?? []
            ),
          ].filter((giftId): giftId is string => Boolean(giftId?.trim())),
        ),
      ),
    [
      caughtMyEyeHangoutCartItemsResponse,
      caughtMyEyeHangoutGiftIdsResponse,
    ],
  );
  const caughtMyEyeHangoutProducts = useMemo(
    () =>
      (
        caughtMyEyeHangoutCartItemsResponse?.data.data ?? []
      )
        .map((item) => mapContactGiftCartItemToMarketplaceProduct(item))
        .filter((product): product is MarketplaceProduct => Boolean(product)),
    [caughtMyEyeHangoutCartItemsResponse],
  );
  const prioritizedHangoutListingIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...caughtMyEyeHangoutGiftIds,
          ...selectedListingIds,
          ...(selectedMarketplaceListingId ? [selectedMarketplaceListingId] : []),
        ]),
      ),
    [
      caughtMyEyeHangoutGiftIds,
      selectedListingIds,
      selectedMarketplaceListingId,
      ],
  );
  const hasMissingCaughtMyEyeHangoutIds = useMemo(
    () =>
      caughtMyEyeHangoutGiftIds.some(
        (giftId) => !selectedListingIds.includes(giftId),
      ),
    [caughtMyEyeHangoutGiftIds, selectedListingIds],
  );
  const setupHangoutEventMutation = useSetupHangoutEventMutation();
  const updateHangoutEventSetupMutation = useUpdateHangoutEventSetupMutation();
  const completeHangoutEventMutation = useCompleteHangoutEventMutation();
  const deleteHangoutEventMutation = useDeleteHangoutEventMutation();
  const createEventTypeMutation = useCreateEventTypeMutation();
  const updateEventTypeMutation = useUpdateEventTypeMutation();
  const deleteEventTypeMutation = useDeleteEventTypeMutation();
  const ensureMyContactMutation = useEnsureMyContactMutation();
  const createContactMutation = useCreateContactMutation();
  const createBulkContactsMutation = useCreateBulkContactsMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();
  const sendEmailMutation = useSendEmailMutation();
  const shouldEnableContactsQuery =
    isHangoutFlowOpen && currentHangoutFlowStep === "record";
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
  const {
    data: eventParticipantIdsResponse,
    isLoading: isEventParticipantIdsLoading,
    isFetching: isEventParticipantIdsFetching,
    isError: isEventParticipantIdsError,
    refetch: refetchEventParticipantIds,
  } = useEventParticipantIdsQuery(eventId, {
    enabled:
      isHangoutFlowOpen &&
      mode === "edit" &&
      currentHangoutFlowStep === "record" &&
      Boolean(eventId) &&
      !hasStoredParticipantSelection,
  });

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
  const hangoutInviteShareUrl = useMemo(
    () =>
      eventId ? buildSignedInInviteUrl(`/dashboard/hangouts/${eventId}`) : "",
    [eventId],
  );
  const eventRows = useMemo<HangoutRow[]>(
    () =>
      (hangoutEventsResponse?.data.data ?? []).map((record) =>
        toHangoutEventRow(
          record,
          canManageHangoutEvent(record, {
            currentUserId: authUser?.id ?? null,
            currentContactId,
          }),
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
  const onedaBusinessOptions = useMemo<SearchableRecordItem[]>(
    () =>
      onedaBusinesses
        .map((business) => mapExternalBusinessToRecordItem(business))
        .filter((business): business is SearchableRecordItem =>
          Boolean(business),
        ),
    [onedaBusinesses],
  );
  const onedaBusinessOptionIds = useMemo(
    () => new Set(onedaBusinessOptions.map((business) => business.id)),
    [onedaBusinessOptions],
  );
  const onedaProfileOptions = useMemo<SearchableRecordItem[]>(
    () => onedaProfiles.map(mapOnedaProfileToRecordItem),
    [onedaProfiles],
  );
  const contactRecordOptions = useMemo(
    () =>
      mergeRecordItems(
        customContactRecordItems,
        selectedParticipantRecordItems,
        fetchedContactRecordItems,
      ).filter((item) => !locallyRemovedRecordContactIds.includes(item.id)),
    [
      customContactRecordItems,
      fetchedContactRecordItems,
      locallyRemovedRecordContactIds,
      selectedParticipantRecordItems,
    ],
  );
  const selectedParticipantReviewItems = useMemo(
    () =>
      selectedParticipantContactIds
        .map((contactId) =>
          contactRecordOptions.find((item) => item.id === contactId),
        )
        .filter((item): item is SearchableRecordItem => Boolean(item))
        .map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email || item.subtitle || "",
        })),
    [contactRecordOptions, selectedParticipantContactIds],
  );
  const hangoutInviteParticipants = useMemo<DrawNameInviteParticipant[]>(() => {
    if (selectedParticipantContactIds.length) {
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
            email: record.email || null,
            profileUrl: record.profileUrl || null,
            inviteUrl:
              hangoutInviteShareUrl ||
              (eventId ? `/dashboard/hangouts/${eventId}` : null),
          } satisfies DrawNameInviteParticipant;
        })
        .filter(Boolean) as DrawNameInviteParticipant[];
    }

    const eventParticipants =
      currentHangoutEventRecord?.event.participants?.filter(
        (participant) =>
          participant.role?.trim().toLowerCase() === "participant",
      ) ?? [];

    return eventParticipants
      .map((contactId) => {
        const contact = contactId.eventContact;
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
          contact.id || contactId.eventContactId || contactId.id,
        );

        return {
          id: contact.id || contactId.eventContactId || contactId.id,
          participantId: contactId.id,
          name,
          role: contact.email || "Pending invite",
          initials: initials || "CT",
          avatarBg: avatarBg || "#EFE6FD",
          avatarColor: avatarColor || "#3300C9",
          email: contact.email?.trim() || null,
          profileUrl: contact.profileUrl?.trim() || null,
          inviteUrl:
            hangoutInviteShareUrl ||
            (eventId ? `/dashboard/hangouts/${eventId}` : null),
        } satisfies DrawNameInviteParticipant;
      })
      .filter(Boolean) as DrawNameInviteParticipant[];
  }, [
    contactRecordOptions,
    currentHangoutEventRecord?.event.participants,
    eventId,
    selectedParticipantContactIds,
    hangoutInviteShareUrl,
  ]);
  const hangoutInviteLockedEmails = useMemo(
    () =>
      hangoutInviteParticipants
        .filter((participant) => participant.role.toLowerCase() !== "creator")
        .map((participant) => participant.email?.trim() || "")
        .filter(Boolean),
    [hangoutInviteParticipants],
  );
  const resolvedHangoutInviteTitle = useMemo(
    () =>
      hangoutEventName?.trim() ||
      selectedEventTypeOption?.label ||
      currentHangoutEventRecord?.event.title?.trim() ||
      "Hangout event",
    [
      currentHangoutEventRecord?.event.title,
      hangoutEventName,
      selectedEventTypeOption?.label,
    ],
  );
  const hangoutInviteShareMessage = useMemo(
    () =>
      buildInviteShareMessage(
        resolvedHangoutInviteTitle || "this hangout",
        hangoutInviteShareUrl ||
          (eventId ? `/dashboard/hangouts/${eventId}` : ""),
      ),
    [
      eventId,
      hangoutInviteShareUrl,
      resolvedHangoutInviteTitle,
    ],
  );
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
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedRecordSearchValue(recordSearchValue.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [recordSearchValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedEventTypeSearchValue(eventTypeSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [eventTypeSearchValue]);

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
      !currentHangoutEventRecord ||
      !shouldHydrateHangoutSetupFromBackend
    ) {
      return;
    }

    const nextFields: Partial<HangoutFlowSelectionState> = {};

    if (!selectedHangoutEventTypeId) {
      nextFields.selectedEventTypeId =
        currentHangoutEventRecord.event.eventTypeId;
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
    selectedHangoutGuestCount,
    selectedHangoutEventTypeId,
    setHangoutFlowDraftFields,
    shouldHydrateHangoutSetupFromBackend,
  ]);

  useEffect(() => {
    if (
      !shouldHydrateHangoutListingFromBackend ||
      !selectedMarketplaceListing ||
      !selectedMarketplaceListingId
    ) {
      return;
    }

    setStoredSelectedListingIds(flowSelectionKey, [selectedMarketplaceListingId]);
    setSelectedListingsById(flowSelectionKey, {
      [selectedMarketplaceListingId]: selectedMarketplaceListing,
    });
  }, [
    flowSelectionKey,
    selectedMarketplaceListing,
    selectedMarketplaceListingId,
    setSelectedListingsById,
    setStoredSelectedListingIds,
    shouldHydrateHangoutListingFromBackend,
  ]);

  useEffect(() => {
    if (!selectedOnedaBusinessIds.length || !onedaBusinessOptions.length) {
      return;
    }

    const hasInvalidBusinessSelection = selectedOnedaBusinessIds.some(
      (businessId) => !onedaBusinessOptionIds.has(businessId),
    );

    if (!hasInvalidBusinessSelection) {
      return;
    }

    setHangoutFlowDraftFields(flowSelectionKey, {
      selectedOnedaBusinessIds: [],
      selectedOnedaContactIds: [],
    });
  }, [
    flowSelectionKey,
    onedaBusinessOptionIds,
    onedaBusinessOptions.length,
    selectedOnedaBusinessIds,
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

    const persistedParticipantContactIds = (
      eventParticipantIdsResponse?.data ?? []
    )
      .map((participant) => participant.eventContactId?.trim() || "")
      .filter(Boolean);

    if (!persistedParticipantContactIds.length) {
      return;
    }

    setSelectedParticipantContactIds(
      flowSelectionKey,
      persistedParticipantContactIds,
    );
  }, [
    eventId,
    eventParticipantIdsResponse,
    flowSelectionKey,
    hasStoredParticipantSelection,
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
    if (
      !isHangoutFlowOpen ||
      currentHangoutFlowStep !== "hangout-selection" ||
      !caughtMyEyeHangoutGiftIds.length ||
      !hasMissingCaughtMyEyeHangoutIds
    ) {
      return;
    }

    const nextSelectedListingIds = Array.from(
      new Set([...caughtMyEyeHangoutGiftIds, ...selectedListingIds]),
    );

    if (nextSelectedListingIds.length === selectedListingIds.length) {
      return;
    }

    setStoredSelectedListingIds(flowSelectionKey, nextSelectedListingIds);
  }, [
    caughtMyEyeHangoutGiftIds,
    currentHangoutFlowStep,
    flowSelectionKey,
    hasMissingCaughtMyEyeHangoutIds,
    isHangoutFlowOpen,
    selectedListingIds,
    setStoredSelectedListingIds,
  ]);

  useEffect(() => {
    if (
      !isHangoutFlowOpen ||
      currentHangoutFlowStep !== "hangout-selection" ||
      !caughtMyEyeHangoutProducts.length
    ) {
      return;
    }

    const nextListingsById = { ...selectedListingsById };
    let hasChanges = false;

    caughtMyEyeHangoutProducts.forEach((product) => {
      if (!nextListingsById[product._id]) {
        nextListingsById[product._id] = product;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSelectedListingsById(flowSelectionKey, nextListingsById);
    }
  }, [
    caughtMyEyeHangoutProducts,
    currentHangoutFlowStep,
    flowSelectionKey,
    isHangoutFlowOpen,
    selectedListingsById,
    setSelectedListingsById,
  ]);

  useEffect(() => {
    if (!isHangoutFlowOpen) {
      return;
    }

    setHangoutFlowDraftFields(flowSelectionKey, {
      lastVisitedStep: effectiveHangoutFlowStep,
    });
  }, [
    effectiveHangoutFlowStep,
    flowSelectionKey,
    isHangoutFlowOpen,
    setHangoutFlowDraftFields,
  ]);

  useEffect(() => {
    if (!isHangoutFlowOpen || currentHangoutFlowStep !== "event-date") {
      return;
    }

    replaceHangoutFlowStep("event-name", mode, eventId);
  }, [
    currentHangoutFlowStep,
    eventId,
    isHangoutFlowOpen,
    mode,
    replaceHangoutFlowStep,
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
    if (!isHangoutFlowOpen || eventId) {
      return;
    }

    const localOnlySteps: HangoutModalStep[] = [
      "event",
      "event-date",
      "event-name",
      "check-in-date",
      "check-out-date",
      "source",
      "oneda-business",
      "oneda-contact",
      "record",
      "add-record",
      "review-records",
      "hangout-selection",
    ];

    if (localOnlySteps.includes(currentHangoutFlowStep)) {
      return;
    }

    closeHangoutFlowModal();
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

  const handleConfirmDiscardHangoutFlow = () => {
    setIsDiscardHangoutFlowConfirmationOpen(false);
    setIsCompleteHangoutEventConfirmationOpen(false);
    resetHangoutFlowSelection(flowSelectionKey);
    closeHangoutFlowModal();
  };

  const handleCloseActiveHangoutFlow = () => {
    if (currentHangoutFlowStep === "invite") {
      resetHangoutFlowSelection(flowSelectionKey);
      setIsDiscardHangoutFlowConfirmationOpen(false);
      }
    else {
      setIsDiscardHangoutFlowConfirmationOpen(true);
      setIsCompleteHangoutEventConfirmationOpen(false);
      return;
    }

    setIsCompleteHangoutEventConfirmationOpen(false);
    closeHangoutFlowModal();
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
      selectedOnedaBusinessIds: sourceSelection.selectedOnedaBusinessIds,
      selectedOnedaContactIds: sourceSelection.selectedOnedaContactIds,
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
    openHangoutFlowModal(
      nextStep,
      "edit",
      row.eventId,
      row.hangoutEventId?.trim() || null,
    );
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

  const handleHangoutFlowEventNext = () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    setHangoutFlowDraftFields(flowSelectionKey, {
      selectedEventTypeId: selectedEventTypeOption.value,
      eventName: selectedEventTypeOption.label || "Untitled hangout",
    });
    setHangoutFlowStep("event-name", mode, eventId, hangoutEventId);
  };

  const handleHangoutEventNameNext = () => {
    if (!selectedHangoutEventTypeId) {
      toast.error("Please complete all hangout details.");
      return;
    }

    const resolvedTitle =
      hangoutEventName.trim() ||
      selectedEventTypeOption?.label ||
      "Untitled hangout";

    setHangoutFlowDraftFields(flowSelectionKey, {
      eventName: resolvedTitle,
      selectedEventTypeId: selectedHangoutEventTypeId,
    });
    setHangoutFlowStep("check-in-date", mode, eventId, hangoutEventId);
  };

  const handleHangoutCheckInDateNext = () => {
    if (!selectedHangoutCheckInDate) {
      toast.error("Please select a check-in date.");
      return;
    }

    setHangoutFlowDraftFields(flowSelectionKey, {
      checkInDate: selectedHangoutCheckInDate,
    });
    setHangoutFlowStep("check-out-date", mode, eventId, hangoutEventId);
  };

  const handleHangoutCheckOutDateNext = () => {
    if (!selectedHangoutCheckOutDate) {
      toast.error("Please select a check-out date.");
      return;
    }

    if (
      selectedHangoutCheckInDate &&
      !isDateAfter(selectedHangoutCheckOutDate, selectedHangoutCheckInDate)
    ) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }

    setHangoutFlowDraftFields(flowSelectionKey, {
      checkOutDate: selectedHangoutCheckOutDate,
    });
    setHangoutFlowStep("source", mode, eventId, hangoutEventId);
  };

  const handleOpenOnedaBusinessStep = () => {
    if (!authToken || !onedaAccountId) {
      toast.error("Your Oneda business details are not available right now.");
      return;
    }

    setHangoutFlowStep("oneda-business", mode, eventId, hangoutEventId);
  };

  const handleSelectedOnedaBusinessIdsChange = (ids: string[]) => {
    const selectedId = ids.at(-1)?.trim() ?? "";
    const selectedBusiness = onedaBusinessOptions.find(
      (business) => business.id === selectedId,
    );

    setHangoutFlowDraftFields(flowSelectionKey, {
      selectedOnedaBusinessIds: selectedBusiness ? [selectedBusiness.id] : [],
      selectedOnedaContactIds: [],
    });
  };

  const handleOnedaBusinessNext = () => {
    if (!selectedOnedaBusinessId) return;
    setHangoutFlowDraftFields(flowSelectionKey, {
      selectedOnedaBusinessIds: [selectedOnedaBusinessId],
    });
    setHangoutFlowStep("oneda-contact", mode, eventId, hangoutEventId);
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
    setHangoutFlowStep("add-record", mode, eventId, hangoutEventId);
  };

  const handleOpenEditColleague = (item: SearchableRecordItem) => {
    if (item.userId) {
      toast.error("This contact is linked to a user account and cannot be edited here.");
      return;
    }

    setEditingRecordId(item.id);
    setNewColleagueForm({
      gender: item.gender || "",
      firstName: item.firstName || item.name.split(" ")[0] || "",
      lastName: item.lastName || item.name.split(" ").slice(1).join(" ") || "",
      phoneNumber: item.phoneNumber || "",
      email: item.email || "",
    });
    setHangoutFlowStep("add-record", mode, eventId, hangoutEventId);
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
      setLocallyRemovedRecordContactIds((current) =>
        current.filter((contactId) => contactId !== savedRecord.id),
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
      setHangoutFlowStep("record", mode, eventId, hangoutEventId);
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
    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant.");
      return;
    }

    setHangoutFlowStep("review-records", mode, eventId, hangoutEventId);
  };

  const handleOnedaContactSaveAndContinue = async () => {
    if (!selectedOnedaContactIds.length) {
      toast.error("Please select at least one contact to continue.");
      return;
    }

    const selectedProfiles = onedaProfiles.filter((profile) =>
      selectedOnedaContactIds.includes(profile._id),
    );

    if (!selectedProfiles.length) {
      toast.error("Please select at least one contact to continue.");
      return;
    }

    try {
      const response = await createBulkContactsMutation.mutateAsync({
        contacts: selectedProfiles.map((profile) => ({
          gender: "male",
          firstName: profile.accountId.firstName?.trim() || "Unknown",
          lastName: profile.accountId.lastName?.trim() || "Contact",
          phoneNumber: profile.accountId.phoneNumber?.trim() || "",
          email: profile.accountId.email?.trim() || "",
        })),
      });
      const createdContactIds = response.data
        .map((contact) => contact.id)
        .filter(Boolean);

      if (!createdContactIds.length) {
        toast.error("Unable to resolve the selected contacts right now.");
        return;
      }

      const createdRecordItems = response.data.map((contact) =>
        mapContactToRecordItem(contact, resolvedCurrentContactId),
      );

      setCustomContactRecordItems((current) =>
        mergeRecordItems(current, createdRecordItems),
      );
      setSelectedParticipantContactIds(flowSelectionKey, createdContactIds);
      setHangoutFlowStep("record", mode, eventId, hangoutEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to import Oneda contacts right now.",
      );
    }
  };

  const handleHangoutReviewNext = () => {
    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant.");
      return;
    }
    setHangoutFlowStep("hangout-selection", mode, eventId, hangoutEventId);
  };

  const handleDeleteReviewParticipant = (id: string) => {
    setSelectedParticipantContactIds(
      flowSelectionKey,
      selectedParticipantContactIds.filter((contactId) => contactId !== id),
    );
  };

  const handleHangoutSelectionNext = () => {
    if (!selectedListingIds.length) {
      toast.error("Please select a hangout option before continuing.");
      return;
    }
    setIsCompleteHangoutEventConfirmationOpen(true);
  };

  const handleViewHangoutProduct = (product: MarketplaceProduct) => {
    setViewingHangoutProduct(product);
  };

  const buildHangoutSetupPayload = (): HangoutEventSetupPayload | null => {
    const selectedProduct = selectedListingIds
      .map((selectedId) => selectedListingsById[selectedId])
      .find((product): product is MarketplaceProduct => Boolean(product));

    if (!selectedProduct) {
      toast.error(
        "The selected hangout option is not fully loaded yet. Please reselect it and try again.",
      );
      return null;
    }

    if (!selectedHangoutEventTypeId) {
      toast.error("Please select an event type before saving this hangout.");
      return null;
    }

    if (!selectedHangoutCheckInDate) {
      toast.error("Please select a check-in date before saving this hangout.");
      return null;
    }

    if (!selectedHangoutCheckOutDate) {
      toast.error("Please select a check-out date before saving this hangout.");
      return null;
    }

    if (!isDateAfter(selectedHangoutCheckOutDate, selectedHangoutCheckInDate)) {
      toast.error("Check-out date must be after check-in date.");
      return null;
    }

    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant.");
      return null;
    }

    const participantContactIds = Array.from(
      new Set(
        selectedParticipantContactIds
          .map((contactId) => contactId.trim())
          .filter(Boolean),
      ),
    );

    if (participantContactIds.length !== selectedParticipantContactIds.length) {
      toast.error("Please remove duplicate participants before continuing.");
      return null;
    }

    const checkInDate = toIsoDate(selectedHangoutCheckInDate);
    const checkOutDate = toIsoDate(selectedHangoutCheckOutDate);
    const eventTitle =
      hangoutEventName.trim() ||
      selectedEventTypeOption?.label ||
      selectedProduct.title ||
      "Untitled hangout";
    const selectedProductDescription = selectedProduct.description?.trim();
    const guestCount =
      Number.parseInt(selectedHangoutGuestCount, 10) ||
      participantContactIds.length;
    const locationParts = [
      selectedProduct.location?.city,
      selectedProduct.location?.state,
      selectedProduct.location?.lga,
    ]
      .map((value) => value?.trim())
      .filter(Boolean);
    const location = locationParts.join(", ") || undefined;

    return {
      event: {
        title: eventTitle,
        ...(selectedProductDescription
          ? { description: selectedProductDescription }
          : {}),
        eventTypeId: selectedHangoutEventTypeId,
        eventDate: checkInDate,
      },
      hangout: {
        ...(location ? { location } : {}),
        hangoutEventId: selectedProduct._id,
        eventCenterName: selectedProduct.title,
        checkInDate,
        checkOutDate,
        numberOfGuests: guestCount,
        amount: selectedProduct.amount,
        imageUrl: selectedProduct.images[0] || undefined,
        maxAttendees: Math.max(guestCount, participantContactIds.length),
        allowPlusOne: false,
      },
      participants: participantContactIds.map((contactId, index) => ({
        clientRef: `p${index + 1}`,
        contactId,
        isNotified: true,
      })),
    };
  };

  const saveHangoutSetup = async () => {
    const payload = buildHangoutSetupPayload();

    if (!payload) {
      return null;
    }

    if (mode === "edit") {
      const resolvedHangoutId =
        currentHangoutEventRecord?.id?.trim() || eventId?.trim() || "";

      if (!resolvedHangoutId) {
        toast.error("Unable to resolve this hangout right now.");
        return null;
      }

      return updateHangoutEventSetupMutation.mutateAsync({
        hangoutId: resolvedHangoutId,
        payload,
      });
    }

    return setupHangoutEventMutation.mutateAsync(payload);
  };

  const handleConfirmSaveHangoutSetupAsDraft = async () => {
    setIsSavingHangoutSetupAsDraft(true);

    try {
      const response = await saveHangoutSetup();

      if (!response) {
        return;
      }

      toast.success(response.message || "Hangout saved as draft.");
      setIsCompleteHangoutEventConfirmationOpen(false);
      resetHangoutFlowSelection(flowSelectionKey);
      closeHangoutFlowModal();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save this hangout right now.",
      );
    } finally {
      setIsSavingHangoutSetupAsDraft(false);
    }
  };

  const canManageRecordContact = (item: SearchableRecordItem) =>
    !item.userId;

  const handleDeleteColleague = async () => {
    if (!recordPendingDelete) {
      return;
    }

    if (recordPendingDelete.userId) {
      toast.error(
        "This contact is linked to a user account and cannot be removed here.",
      );
      return;
    }

    try {
      const response = await deleteContactMutation.mutateAsync(
        recordPendingDelete.id,
      );

      setCustomContactRecordItems((current) =>
        current.filter((record) => record.id !== recordPendingDelete.id),
      );
      setLocallyRemovedRecordContactIds((current) =>
        current.includes(recordPendingDelete.id)
          ? current
          : [...current, recordPendingDelete.id],
      );
      setSelectedParticipantContactIds(
        flowSelectionKey,
        selectedParticipantContactIds.filter(
          (contactId) => contactId !== recordPendingDelete.id,
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

  const handleConfirmCompleteHangoutEvent = async () => {
    setIsSavingHangoutSetupAndCompleting(true);

    try {
      const setupResponse = await saveHangoutSetup();

      if (!setupResponse) {
        return;
      }

      const nextEventId =
        setupResponse.data.eventId?.trim() || setupResponse.data.event.id;
      const nextHangoutId =
        setupResponse.data.id?.trim() ||
        setupResponse.data.hangoutEventId?.trim() ||
        null;

      const completeResponse =
        await completeHangoutEventMutation.mutateAsync(nextEventId);

      toast.success(completeResponse.message);
      setIsCompleteHangoutEventConfirmationOpen(false);
      setHangoutFlowStep("invite", mode, nextEventId, nextHangoutId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this hangout right now.",
      );
    } finally {
      setIsSavingHangoutSetupAndCompleting(false);
    }
  };

  const handleHangoutInviteSendEmail = () => {
    setIsHangoutInviteEmailComposeOpen(true);
  };

  const handleHangoutInviteCopyLink = async () => {
    const inviteUrl =
      hangoutInviteShareUrl || (eventId ? `/dashboard/hangouts/${eventId}` : "");

    if (!inviteUrl) {
      toast.error("No invitation link is available right now.");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invitation link copied.");
    } catch {
      toast.error("Unable to copy this invitation link right now.");
    }
  };

  const handleConfirmSendHangoutInviteEmails = async (payload: {
    title: string;
    body: string;
    emails: string[];
  }) => {
    const resolvedHangoutId =
      hangoutEventId?.trim() ||
      currentHangoutEventRecord?.id?.trim() ||
      null;
    const redirectUrl =
      hangoutInviteShareUrl || (eventId ? `/dashboard/hangouts/${eventId}` : "");

    if (!eventId || !resolvedHangoutId || !redirectUrl) {
      toast.error("Unable to resolve this hangout invite right now.");
      return;
    }

    try {
      const response = await sendEmailMutation.mutateAsync({
        eventId,
        title: payload.title,
        body: payload.body,
        redirectUrl,
        emails: payload.emails,
        hangoutId: resolvedHangoutId,
      });

      toast.success(response.message);
      setIsHangoutInviteEmailComposeOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send invitation emails right now.",
      );
    }
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
        id: "time_status",
        header: "preiod Status",
        headerClassName: "min-w-[100px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        id: "status",
        header: "Fulfillment",
        headerClassName: "min-w-[100px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row.fulfillmentStatus} />,
      },
      {
        id: "eventStatus",
        header: "Status",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row.eventStatus} />,

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

  const hangoutSelectionStep = (
      <WishlistGiftSelectionStep
        selectedIds={selectedListingIds}
        onSelectedIdsChange={handleHangoutListingIdsChange}
        onSelectedProductToggle={handleHangoutListingToggle}
        onViewProduct={handleViewHangoutProduct}
        onBack={() =>
          setHangoutFlowStep("review-records", mode, eventId, hangoutEventId)
        }
        onNext={handleHangoutSelectionNext}
        enableInfiniteScroll
        disableContentScroll
        nextDisabled={!selectedListingIds.length}
        nextLabel="Next"
        nextClassName="h-[44px] !w-fit min-w-[96px] px-6"
        selectionMode="single"
        title="Pick a place for your hangout."
        description="Choose one option to represent this hangout. We'll save the selected image and listing reference to your event."
        searchPlaceholder="Search for hangout"
        emptyStateText="No hangout options matched your current filters."
        caughtMyEyeProductIds={caughtMyEyeHangoutGiftIds}
        prioritizedProductIds={prioritizedHangoutListingIds}
        deferProductsUntilInitialSelectionResolved={
          isCaughtMyEyeHangoutGiftIdsLoading ||
          isCaughtMyEyeHangoutGiftIdsFetching ||
          isCaughtMyEyeHangoutCartItemsLoading ||
          isCaughtMyEyeHangoutCartItemsFetching
        }
    />
  );

  const isInlineHangoutSelectionStep =
    isHangoutFlowOpen && effectiveHangoutFlowStep === "hangout-selection";

  if (viewingHangoutProduct) {
    return (
      <div className="space-y-2">
        <EventGiftDetailView
          backHref="/dashboard/hangouts"
          backLabel="Back to hangouts"
          onBack={() => setViewingHangoutProduct(null)}
          eventTitle="Hangout Options"
          createdBy="Festa marketplace"
          createdAt="Available hangout options"
          showHeader={false}
          status="Ongoing"
          avatarInitials="HG"
          summaryItems={[]}
          showSummaryItems={false}
          product={viewingHangoutProduct}
          hideDeleteAction
          onDelete={() => undefined}
          onReportItem={() => toast("Thanks. We will review this option.")}
          onShareProduct={() => toast.success("Link copied.")}
        />
      </div>
    );
  }

  if (isInlineHangoutSelectionStep) {
    return (
      <div className="space-y-6">
        <div className="mx-auto w-full max-w-[1448px] rounded-[24px] border border-[#F1EDF9] bg-white px-4 py-4 shadow-[0_12px_40px_rgba(29,18,68,0.06)] sm:px-6 sm:py-6 lg:px-8">
          <div className="min-h-0">{hangoutSelectionStep}</div>
        </div>

        <ConfirmationModal
          open={isCompleteHangoutEventConfirmationOpen}
          onClose={() => setIsCompleteHangoutEventConfirmationOpen(false)}
          onConfirm={handleConfirmCompleteHangoutEvent}
          onSecondaryConfirm={handleConfirmSaveHangoutSetupAsDraft}
          action="save"
          title="Save Hangout Setup"
          description="You can save this hangout as a draft, or save and complete it so you can invite participants."
          confirmText="Save"
          secondaryConfirmText="Save as Draft"
          isLoading={isSavingHangoutSetupAndCompleting}
          isSecondaryLoading={isSavingHangoutSetupAsDraft}
          closeOnOverlayClick={false}
          closeOnEscape={false}
        />
      </div>
    );
  }

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
        description={
          recordPendingDelete
            ? `Are you sure you want to delete ${recordPendingDelete.name}?`
            : "Are you sure you want to delete this contact?"
        }
        confirmText="Delete"
        isLoading={deleteContactMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isCompleteHangoutEventConfirmationOpen}
        onClose={() => setIsCompleteHangoutEventConfirmationOpen(false)}
        onConfirm={handleConfirmCompleteHangoutEvent}
        onSecondaryConfirm={handleConfirmSaveHangoutSetupAsDraft}
        action="save"
        title="Save Hangout Setup"
        description="You can save this hangout as a draft, or save and complete it so you can invite participants."
        confirmText="Save"
        secondaryConfirmText="Save as Draft"
        isLoading={isSavingHangoutSetupAndCompleting}
        isSecondaryLoading={isSavingHangoutSetupAsDraft}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isDiscardHangoutFlowConfirmationOpen}
        onClose={() => setIsDiscardHangoutFlowConfirmationOpen(false)}
        onConfirm={handleConfirmDiscardHangoutFlow}
        action="delete"
        title="Discard Hangout Setup"
        description="If you close this flow now, the records and setup details you have entered locally will be lost."
        confirmText="Discard"
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ContentModal
        open={isHangoutFlowOpen && !isInlineHangoutSelectionStep}
        onClose={handleCloseActiveHangoutFlow}
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
        {effectiveHangoutFlowStep === "event-name" ? (
          <GroupNameStep
            value={hangoutEventName}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                eventName: value,
              })
            }
            onBack={() =>
              setHangoutFlowStep("event", mode, eventId, hangoutEventId)
            }
            onNext={handleHangoutEventNameNext}
            title="Below is a suggestion of a name for your event."
            description="Feel free to edit as you see fit."
            placeholder="Write event name"
          />
        ) : effectiveHangoutFlowStep === "check-in-date" ? (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Hangout"}
            value={selectedHangoutCheckInDate}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                checkInDate: value,
              })
            }
            onBack={() =>
              setHangoutFlowStep("event-name", mode, eventId, hangoutEventId)
            }
            onNext={handleHangoutCheckInDateNext}
            heading="When is check-in?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        ) : effectiveHangoutFlowStep === "check-out-date" ? (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Hangout"}
            value={selectedHangoutCheckOutDate}
            onChange={(value) =>
              setHangoutFlowDraftFields(flowSelectionKey, {
                checkOutDate: value,
              })
            }
            onBack={() =>
              setHangoutFlowStep("check-in-date", mode, eventId, hangoutEventId)
            }
            onNext={handleHangoutCheckOutDateNext}
            heading="When is check-out?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        ) : effectiveHangoutFlowStep === "source" ? (
          <div className="space-y-12 pt-2">
            <div className="text-center">
              <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
                Hey {greetingName},
              </p>
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                Who&apos;d you like to hangout with?
              </p>
            </div>

            <div className="mx-auto max-w-[494px] space-y-4">
              <ModalButton
                variant="secondary"
                onClick={() =>
                  setHangoutFlowStep("record", mode, eventId, hangoutEventId)
                }
                className="w-full"
              >
                From Record
              </ModalButton>
              <ModalButton
                onClick={handleOpenOnedaBusinessStep}
                className="w-full"
              >
                Import from Oneda
              </ModalButton>
            </div>

            <div className="flex justify-center">
              <BackButton
                onClick={() =>
                  setHangoutFlowStep(
                    "check-out-date",
                    mode,
                    eventId,
                    hangoutEventId,
                  )
                }
                className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
            </div>
          </div>
        ) : effectiveHangoutFlowStep === "oneda-business" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
                Hey {greetingName},
              </p>
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                Which business are you selecting from?
              </p>
            </div>

            <div className="mx-auto max-w-[494px]">
              <OverlayRecordPicker
                items={onedaBusinessOptions}
                selectedIds={selectedOnedaBusinessIds}
                onSelectedIdsChange={handleSelectedOnedaBusinessIdsChange}
                placeholder="Search for business"
                panelTitle="Search for business"
                searchPlaceholder=""
                isLoading={
                  isOnedaBusinessesLoading || isOnedaBusinessesFetching
                }
                emptyStateText={
                  isOnedaBusinessesError
                    ? "Unable to load businesses."
                    : "No business found."
                }
                triggerBottomAction={
                  <BackButton
                    onClick={() =>
                      setHangoutFlowStep("source", mode, eventId, hangoutEventId)
                    }
                    className={FLOW_BACK_TRIGGER_CLASS}
                    iconClassName="size-[24px]"
                  />
                }
                footer={
                  <FlowActionButtons
                    showBack={false}
                    onNext={handleOnedaBusinessNext}
                    nextDisabled={!selectedOnedaBusinessId}
                  />
                }
                triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
              />
            </div>

            {isOnedaBusinessesError ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void refetchOnedaBusinesses()}
                  className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  Retry loading businesses
                </button>
              </div>
            ) : null}
          </div>
        ) : effectiveHangoutFlowStep === "oneda-contact" ? (
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
                items={onedaProfileOptions}
                selectedIds={selectedOnedaContactIds}
                onSelectedIdsChange={(ids) =>
                  setHangoutFlowDraftFields(flowSelectionKey, {
                    selectedOnedaContactIds: ids,
                  })
                }
                placeholder="Search for colleague"
                panelTitle="Search for colleague"
                searchPlaceholder=""
                searchValue={recordSearchValue}
                onSearchValueChange={setRecordSearchValue}
                disableLocalFiltering
                isLoading={isOnedaProfilesLoading || isOnedaProfilesFetching}
                emptyStateText={
                  isOnedaProfilesError
                    ? "Unable to load contacts."
                    : "No colleague found."
                }
                triggerBottomAction={
                  <BackButton
                    onClick={() =>
                      setHangoutFlowStep(
                        "oneda-business",
                        mode,
                        eventId,
                        hangoutEventId,
                      )
                    }
                    className={FLOW_BACK_TRIGGER_CLASS}
                    iconClassName="size-[24px]"
                  />
                }
                footer={
                  <FlowActionButtons
                    showBack={false}
                    onNext={handleOnedaContactSaveAndContinue}
                    nextDisabled={
                      !selectedOnedaContactIds.length ||
                      createBulkContactsMutation.isPending
                    }
                    nextLabel={
                      createBulkContactsMutation.isPending
                        ? "Importing..."
                        : "Import"
                    }
                  />
                }
                triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
              />
            </div>

            {isOnedaProfilesError ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void refetchOnedaProfiles()}
                  className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  Retry loading contacts
                </button>
              </div>
            ) : null}
          </div>
        ) : effectiveHangoutFlowStep === "review-records" ? (
          <CustomColleagueReview
            greetingName={greetingName}
            prompt="Who'd you like to hangout with?"
            items={selectedParticipantReviewItems}
            onAddNew={handleOpenAddNewColleague}
            onBack={() =>
              setHangoutFlowStep("source", mode, eventId, hangoutEventId)
            }
            onNext={handleHangoutReviewNext}
            onDelete={handleDeleteReviewParticipant}
            nextLabel="Next"
            nextDisabled={selectedParticipantReviewItems.length === 0}
          />
        ) : effectiveHangoutFlowStep === "hangout-selection" ? (
          hangoutSelectionStep
        ) : effectiveHangoutFlowStep === "invite" ? (
          <DrawNameInviteStep
            title={
              <>
                Invite members to your
                <br />
                hangout.
              </>
            }
            onShareFacebook={() =>
              shareInvite({
                platform: "facebook",
                inviteUrl: hangoutInviteShareUrl,
                message: hangoutInviteShareMessage,
              })
            }
            onShareWhatsApp={() =>
              shareInvite({
                platform: "whatsapp",
                inviteUrl: hangoutInviteShareUrl,
                message: hangoutInviteShareMessage,
              })
            }
            onSendEmail={handleHangoutInviteSendEmail}
            onCopyLink={handleHangoutInviteCopyLink}
          />
        ) : effectiveHangoutFlowStep === "add-record" ? (
          <AddColleagueForm
            values={newColleagueForm}
            onChange={handleNewColleagueChange}
            onBack={() => {
              setEditingRecordId(null);
              setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
              setHangoutFlowStep("record", mode, eventId, hangoutEventId);
            }}
            onSave={handleSaveNewColleague}
            saveDisabled={isSaveNewColleagueDisabled}
            isSaving={activeContactMutationPending}
            saveLabel={editingRecordId ? "Edit" : "Save"}
            savingLabel={editingRecordId ? "Editing" : "Saving"}
          />
        ) : effectiveHangoutFlowStep === "record" ? (
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
                  isEventParticipantIdsLoading ||
                  isEventParticipantIdsFetching ||
                  isContactsLoading ||
                  isContactsFetching
                }
                emptyStateText={
                  ensureMyContactMutation.isError ||
                  isContactsError ||
                  isEventParticipantIdsError
                    ? "Unable to load contacts."
                    : "No colleague found."
                }
                triggerBottomAction={
                  <BackButton
                    onClick={() =>
                      setHangoutFlowStep("source", mode, eventId, hangoutEventId)
                    }
                    className={FLOW_BACK_TRIGGER_CLASS}
                    iconClassName="size-[24px]"
                  />
                }
                addActionLabel="Add New"
                onAddAction={handleOpenAddNewColleague}
                onEditItem={handleOpenEditColleague}
                onDeleteItem={setRecordPendingDelete}
                canEditItem={canManageRecordContact}
                canDeleteItem={canManageRecordContact}
                suspendDismiss={Boolean(recordPendingDelete)}
                footer={
                  <FlowActionButtons
                    showBack={false}
                    onNext={handleHangoutParticipantsNext}
                    nextDisabled={!selectedParticipantContactIds.length}
                  />
                }
                triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
              />
            </div>

            {ensureMyContactMutation.isError ||
            isContactsError ||
            isEventParticipantIdsError ? (
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

                    if (isEventParticipantIdsError) {
                      void refetchEventParticipantIds();
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
                searchValue={eventTypeSearchValue}
                onSearchValueChange={setEventTypeSearchValue}
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

            <FlowActionButtons
              showBack={false}
              onNext={handleHangoutFlowEventNext}
              stackSaveAndContinue={false}
              nextDisabled={!selectedHangoutEventTypeId}
              nextClassName="!w-fit min-w-[96px] px-6"
            />
          </div>
        )}
      </ContentModal>

      <EmailInviteComposeModal
        open={isHangoutInviteEmailComposeOpen}
        onClose={() => setIsHangoutInviteEmailComposeOpen(false)}
        initialTitle={resolvedHangoutInviteTitle}
        initialBody={buildInviteShareMessage(
          resolvedHangoutInviteTitle || "this hangout",
          hangoutInviteShareUrl,
        )}
        lockedEmails={hangoutInviteLockedEmails}
        onSubmit={handleConfirmSendHangoutInviteEmails}
        isSubmitting={sendEmailMutation.isPending}
        hasBody={false}
      />
    </div>
  );
}

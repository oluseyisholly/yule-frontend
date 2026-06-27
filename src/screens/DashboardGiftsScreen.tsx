"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
import EventDateStep from "@/components/EventDateStep";
import GroupNameStep from "@/components/GroupNameStep";
import ModalButton from "@/components/ModalButtons";
import OverlayRecordPicker from "@/components/OverlayRecordPicker";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import {
  ModalPanelSkeleton,
  TableLoadingState,
} from "@/components/ui/context-skeletons";
import DeleteIcon from "@/components/icons/DeleteIcon";
import EditPencilIcon from "@/components/icons/EditPencilIcon";
import InviteEmailIcon from "@/components/icons/InviteEmailIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { Input } from "@/components/ui/input";
import ContentModal from "@/components/ui/modal";
import ViewIcon from "@/components/icons/ViewIcon";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
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
import { useAssignBulkGiftsMutation } from "@/features/gifts/hooks/useAssignBulkGiftsMutation";
import { useGiftMetricsQuery } from "@/features/gifts/hooks/useGiftMetricsQuery";
import { useGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useGivenGroupedGiftsQuery";
import { useReceivedGiftsQuery } from "@/features/gifts/hooks/useReceivedGiftsQuery";
import { canManageGiftingEvent } from "@/features/gifting-events/access";
import { useCreateGiftingEventMutation } from "@/features/gifting-events/hooks/useCreateGiftingEventMutation";
import { useDeleteGiftingEventMutation } from "@/features/gifting-events/hooks/useDeleteGiftingEventMutation";
import { useCompleteGiftingEventMutation } from "@/features/gifting-events/hooks/useCompleteGiftingEventMutation";
import { useGiftingEventsQuery } from "@/features/gifting-events/hooks/useGiftingEventsQuery";
import { useUpdateGiftingEventMutation } from "@/features/gifting-events/hooks/useUpdateGiftingEventMutation";
import { useGiftingEventInvitationsQuery } from "@/features/invitations/hooks/useGiftingEventInvitationsQuery";
import { useSendGiftingEventInvitationsMutation } from "@/features/invitations/hooks/useSendGiftingEventInvitationsMutation";
import type {
  GiftMetricStat,
  GivenGroupedGift,
  GivenGroupedGiftEvent,
  GivenGroupedGiftPerson,
  ReceivedGift,
  ReceivedGiftParticipantContact,
} from "@/features/gifts/types";
import type {
  GiftingEventParticipant,
  GiftingEventParticipantActor,
  GiftingEventRecord,
} from "@/features/gifting-events/types";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useCreateParticipantsBulkMutation } from "@/features/participants/hooks/useCreateParticipantsBulkMutation";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import { cn } from "@/lib/utils";
import {
  isGiftModalStep,
  type GiftModalStep,
} from "@/screens/gifts/modal-steps";
import { useGiftModalRouteState } from "@/screens/gifts/useGiftModalRouteState";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildGiftFlowSelectionKey,
  EMPTY_GIFT_FLOW_SELECTION,
  type GiftFlowSelectionState,
  useGiftFlowStore,
} from "@/stores/gift-flow-store";

type GiftsTab = "events" | "sent" | "received";
type GiftStatus = "Delivered" | "Pending" | "Completed";
type GiftingEventStatusLabel = "Draft" | "Ongoing" | "Completed";

type GiftRowPerson = {
  name: string;
  email?: string;
};

type GiftRow = {
  id: string;
  item: string;
  image: StaticImageData | string;
  eventName: string;
  eventDate: string;
  amount: string;
  status: GiftStatus;
  sentTo?: GiftRowPerson[];
  receivedFrom?: GiftRowPerson[];
  recipientCount?: number;
};

type GiftingEventRow = {
  id: string;
  giftingEventId: string;
  eventId: string;
  eventTypeId: string;
  eventName: string;
  eventTypeKey?: string | null;
  eventDate: string;
  eventDateValue: string;
  titleValue: string;
  participants: GiftRowPerson[];
  participantContactIds: string[];
  participantIdsByContactId: Record<string, string>;
  participantRecordItems: SearchableRecordItem[];
  createdBy: string;
  status: GiftingEventStatusLabel;
  canManage: boolean;
};

type StatCardData = {
  icon: ReactNode;
  iconBg: string;
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
};

type GiftMetricSource = GiftMetricStat | number | string | null | undefined;

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

const giftingEventStatusStyles: Record<GiftingEventStatusLabel, string> = {
  Draft: "bg-[#FFF1DD] text-[#FF9D1C]",
  Ongoing: "bg-[#EFE6FD] text-[#3300C9]",
  Completed: "bg-[#E6F7EC] text-[#24A959]",
};
const VALID_GIFTS_TABS: GiftsTab[] = ["events", "sent", "received"];

const PAGE_SIZE = 5;
const fallbackGiftImages = [featureImg1, featureImg2, featureImg3, featureImg4];
const EMPTY_NEW_COLLEAGUE_FORM: AddColleagueFormValues = {
  gender: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
};
const RECORD_AVATAR_STYLES = [
  { avatarBg: "#FCEEC8", avatarColor: "#8A5B00" },
  { avatarBg: "#D9F4E2", avatarColor: "#1C8C4B" },
  { avatarBg: "#EFE6FD", avatarColor: "#3300C9" },
  { avatarBg: "#FDE0DE", avatarColor: "#C34040" },
  { avatarBg: "#DDF0FF", avatarColor: "#0067C9" },
  { avatarBg: "#E8E6F8", avatarColor: "#5A4CB8" },
] as const;
function getGiftMetricValue(metric: GiftMetricSource) {
  if (
    metric &&
    typeof metric === "object" &&
    "value" in metric &&
    (typeof metric.value === "number" || typeof metric.value === "string")
  ) {
    return metric.value;
  }

  if (typeof metric === "number" || typeof metric === "string") {
    return metric;
  }

  return 0;
}

function getGiftMetricOptionalNumber(
  metric: GiftMetricSource,
  key: "percentageChangeThisMonth" | "newThisWeek",
) {
  if (!metric || typeof metric !== "object" || !(key in metric)) {
    return null;
  }

  const value = (metric as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function formatGiftMetricAmount(value: number | string) {
  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return formatCurrency(0, "NGN");
    }

    if (/[A-Za-z$#€£¥₦]/.test(trimmedValue)) {
      return trimmedValue;
    }
  }

  return formatCurrency(value, "NGN");
}

function useDerivedGiftStats() {
  const { data: metrics = null } = useGiftMetricsQuery(true);

  const resolvedMetrics = metrics ?? {
    totalGifts: { value: 0, percentageChangeThisMonth: 0 },
    totalAmountSpent: { value: 0, newThisWeek: 0 },
    totalPeople: { value: 0 },
    totalSellers: { value: 0 },
  };

  const totalGiftsValue = getGiftMetricValue(resolvedMetrics.totalGifts);
  const totalAmountSpentValue = getGiftMetricValue(
    resolvedMetrics.totalAmountSpent,
  );
  const totalPeopleValue = getGiftMetricValue(resolvedMetrics.totalPeople);
  const totalSellersValue = getGiftMetricValue(resolvedMetrics.totalSellers);
  const totalGiftsPercentageChange = getGiftMetricOptionalNumber(
    resolvedMetrics.totalGifts,
    "percentageChangeThisMonth",
  );
  const totalAmountSpentNewThisWeek = getGiftMetricOptionalNumber(
    resolvedMetrics.totalAmountSpent,
    "newThisWeek",
  );

  const stats: StatCardData[] = [
    {
      icon: (
        <ShoppingBagIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />
      ),
      iconBg: "#EFE6FD",
      value: String(totalGiftsValue),
      label: "Total Gifts",
      hint:
        totalGiftsPercentageChange !== null && totalGiftsPercentageChange !== 0
          ? `${totalGiftsPercentageChange > 0 ? "+" : ""}${totalGiftsPercentageChange}% this month`
          : undefined,
      hintColor: "#3300C9",
    },
    {
      icon: (
        <CalendarDaysIcon
          className="size-5 text-[#1FAB54]"
          strokeWidth={1.8}
        />
      ),
      iconBg: "#D9F4E2",
      value: formatGiftMetricAmount(totalAmountSpentValue),
      label: "Total Amount Spent",
      hint:
        totalAmountSpentNewThisWeek !== null &&
        totalAmountSpentNewThisWeek !== 0
          ? `+${totalAmountSpentNewThisWeek} new this week`
          : undefined,
      hintColor: "#24A959",
    },
    {
      icon: <UsersIcon className="size-5 text-[#C28A00]" strokeWidth={1.8} />,
      iconBg: "#FCEEC8",
      value: String(totalPeopleValue),
      label: "Total People",
    },
    {
      icon: <StoreIcon className="size-5 text-[#C28A00]" strokeWidth={1.8} />,
      iconBg: "#FCEEC8",
      value: String(totalSellersValue),
      label: "Total Sellers",
    },
  ];

  return stats;
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

function getContactAvatarStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return RECORD_AVATAR_STYLES[hash % RECORD_AVATAR_STYLES.length];
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
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
  };
}

function mapGiftingEventParticipantToRecordItem(
  participant: GiftingEventParticipant,
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

function toDisplayName(
  person?:
    | GivenGroupedGiftPerson
    | ReceivedGiftParticipantContact
    | GiftingEventParticipantActor
    | null,
) {
  if (!person) {
    return "";
  }

  const fullName = `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim();

  return fullName || person.email?.trim() || "";
}

function toGivenGiftPeople(people?: GivenGroupedGiftPerson[] | null) {
  const normalizedPeople: GiftRowPerson[] = [];

  (people ?? []).forEach((person) => {
    const name = toDisplayName(person);

    if (!name) {
      return;
    }

    normalizedPeople.push({
      name,
      email: person.email?.trim() || undefined,
    });
  });

  return normalizedPeople;
}

function toSentGiftStatus(
  event: GivenGroupedGiftEvent | null | undefined,
): GiftStatus {
  const normalizedStatus = event?.status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  return "Pending";
}

function toSentGiftRow(gift: GivenGroupedGift, index: number): GiftRow {
  const people = toGivenGiftPeople(gift.people);
  const recipientCount =
    gift.recipientCount ?? (people.length > 0 ? people.length : 1);
  const event = gift.event;

  return {
    id: gift.id?.trim() || `given-gift-${index}`,
    item: gift.title?.trim() || "Gift item",
    image:
      gift.imageUrl?.trim() ||
      fallbackGiftImages[index % fallbackGiftImages.length],
    eventName: event?.title?.trim() || "-",
    eventDate: formatDate(event?.eventDate),
    amount: formatCurrency(gift.amount, gift.currency?.trim() || "NGN"),
    status: toSentGiftStatus(event),
    sentTo: people,
    recipientCount,
  };
}

function toReceivedStatus(gift: ReceivedGift): GiftStatus {
  const normalizedStatus = gift.event?.status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  return "Pending";
}

function toReceivedGiftRow(gift: ReceivedGift, index: number): GiftRow {
  const giverContact = gift.giverParticipant?.eventContact;
  const giverName = toDisplayName(giverContact);

  return {
    id: gift.id,
    item: gift.title?.trim() || "Gift item",
    image:
      gift.imageUrl?.trim() ||
      fallbackGiftImages[index % fallbackGiftImages.length],
    eventName: gift.event?.title?.trim() || "-",
    eventDate: formatDate(gift.event?.eventDate),
    amount: formatCurrency(gift.amount, gift.currency?.trim() || "NGN"),
    status: toReceivedStatus(gift),
    receivedFrom: giverName
      ? [
          {
            name: giverName,
            email: giverContact?.email?.trim() || undefined,
          },
        ]
      : [],
  };
}

function toGiftingEventStatus(status?: string | null): GiftingEventStatusLabel {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "ongoing") {
    return "Ongoing";
  }

  return "Draft";
}

function hasGiftFlowDraft(selection: GiftFlowSelectionState) {
  return (
    selection.lastVisitedStep !== EMPTY_GIFT_FLOW_SELECTION.lastVisitedStep ||
    selection.selectedEventTypeId !==
      EMPTY_GIFT_FLOW_SELECTION.selectedEventTypeId ||
    selection.eventDate !== EMPTY_GIFT_FLOW_SELECTION.eventDate ||
    selection.giftDeadline !== EMPTY_GIFT_FLOW_SELECTION.giftDeadline ||
    selection.eventName !== EMPTY_GIFT_FLOW_SELECTION.eventName ||
    selection.selectedParticipantContactIds.length > 0 ||
    selection.selectedGiftIds.length > 0 ||
    Object.keys(selection.selectedGiftProductsById).length > 0
  );
}

function isValidGiftsTab(value: string | null): value is GiftsTab {
  return VALID_GIFTS_TABS.includes(value as GiftsTab);
}

function normalizeGiftFlowSelection(
  selection?: Partial<GiftFlowSelectionState> | null,
): GiftFlowSelectionState {
  return {
    ...EMPTY_GIFT_FLOW_SELECTION,
    ...(selection ?? {}),
    selectedParticipantContactIds: Array.isArray(
      selection?.selectedParticipantContactIds,
    )
      ? selection.selectedParticipantContactIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedParticipantContactIds,
    selectedGiftIds: Array.isArray(selection?.selectedGiftIds)
      ? selection.selectedGiftIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedGiftIds,
    selectedGiftProductsById:
      selection?.selectedGiftProductsById &&
      typeof selection.selectedGiftProductsById === "object"
        ? selection.selectedGiftProductsById
        : EMPTY_GIFT_FLOW_SELECTION.selectedGiftProductsById,
  };
}

function getParticipantIdsByContactId(
  participants?: GiftingEventParticipant[] | null,
) {
  return Object.fromEntries(
    (participants ?? [])
      .filter(
        (participant) =>
          participant.role?.trim().toLowerCase() === "participant" &&
          Boolean(participant.id?.trim()) &&
          Boolean(participant.eventContactId?.trim()),
      )
      .map((participant) => [
        participant.eventContactId!.trim(),
        participant.id.trim(),
      ]),
  ) as Record<string, string>;
}

function toGiftingEventRow(
  record: GiftingEventRecord,
  eventTypeKey?: string | null,
  canManage: boolean = false,
): GiftingEventRow {
  const allParticipants = record.event.participants ?? [];
  const participants = allParticipants
    .map<GiftRowPerson | null>((participant) => {
      const name = toDisplayName(participant.eventContact);

      if (!name) {
        return null;
      }

      const mappedParticipant: GiftRowPerson = {
        name,
        email: participant.eventContact?.email?.trim() || undefined,
      };

      return mappedParticipant;
    })
    .filter((participant): participant is GiftRowPerson =>
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
  const participantIdsByContactId =
    getParticipantIdsByContactId(allParticipants);
  const participantRecordItems = mergeRecordItems(
    allParticipants
      .filter(
        (participant) =>
          participant.role?.trim().toLowerCase() === "participant",
      )
      .map(mapGiftingEventParticipantToRecordItem)
      .filter((participant): participant is SearchableRecordItem =>
        Boolean(participant),
      ),
  );

  return {
    id: record.id,
    giftingEventId: record.id,
    eventId: record.eventId,
    eventTypeId: record.event.eventTypeId,
    eventName: record.event.title?.trim() || "Untitled event",
    eventTypeKey: eventTypeKey ?? null,
    eventDate: formatDate(record.event.eventDate),
    eventDateValue: toDateInputValue(record.event.eventDate),
    titleValue: record.event.title?.trim() || "Untitled event",
    participants,
    participantContactIds,
    participantIdsByContactId,
    participantRecordItems,
    createdBy: toDisplayName(record.event.createdBy) || "-",
    status: toGiftingEventStatus(record.event.status),
    canManage,
  };
}

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
  if (people.length === 0) {
    return <span className="text-sm text-[#7D7D7D]">-</span>;
  }

  if (people.length <= 1) {
    const person = people[0];

    if (!person) {
      return <span className="text-sm text-[#7D7D7D]">-</span>;
    }

    return (
      <div className="flex items-center gap-2.5">
        <RecipientAvatar name={person.name} />
        <span className="text-sm font-medium text-[#1E1E1E]">
          {person.name}
        </span>
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

function ParticipantStack({ people }: { people: GiftRowPerson[] }) {
  if (people.length === 0) {
    return <span className="text-[#9A97A5]">—</span>;
  }

  const visiblePeople = people.slice(0, 3);
  const overflowCount = Math.max(people.length - visiblePeople.length, 0);

  return (
    <div className="flex items-center -space-x-2">
      {visiblePeople.map((person) => {
        const { bg, color } = getRecipientStyle(person.name);

        return (
          <span
            key={person.name}
            className="flex size-8 items-center justify-center rounded-full border border-white text-[9px] font-semibold"
            style={{ backgroundColor: bg, color }}
            title={person.name}
          >
            {toInitials(person.name)}
          </span>
        );
      })}
      {overflowCount > 0 ? (
        <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
          +{overflowCount}
        </span>
      ) : null}
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

function GiftingEventStatusPill({
  status,
}: {
  status: GiftingEventStatusLabel;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[84px] items-center justify-center rounded-full px-3 py-1 text-[11px] font-medium",
        giftingEventStatusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

function GiftingEventRowActions({
  row,
  onView,
  onEdit,
  onRequestDelete,
}: {
  row: GiftingEventRow;
  onView: (row: GiftingEventRow) => void;
  onEdit: (row: GiftingEventRow) => void;
  onRequestDelete: (row: GiftingEventRow) => void;
}) {
  const isCompletedEvent = row.status === "Completed";
  const canManageRow = row.canManage;
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
            disabled={!canManageRow}
            onSelect={() => {
              if (!canManageRow) {
                return;
              }

              onView(row);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm focus:bg-[#F6F2FF]",
              canManageRow
                ? "cursor-pointer text-[#434343] focus:text-[#3300C9]"
                : "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]",
            )}
          >
            <ViewIcon
              className={cn(
                "size-4",
                canManageRow ? "text-[#292D32]" : "text-[#B8B5C3]",
              )}
            />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!canManageRow}
            onSelect={() => {
              if (!canManageRow) {
                return;
              }

              onEdit(row);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm focus:bg-[#F6F2FF]",
              canManageRow
                ? "cursor-pointer text-[#434343] focus:text-[#3300C9]"
                : "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]",
            )}
          >
            {isCompletedEvent ? (
              <InviteEmailIcon
                className={cn(
                  "size-4",
                  canManageRow ? "text-[#292D32]" : "text-[#B8B5C3]",
                )}
              />
            ) : (
              <EditPencilIcon
                className={cn(
                  "size-4",
                  canManageRow ? "text-[#292D32]" : "text-[#B8B5C3]",
                )}
              />
            )}
            {isCompletedEvent ? "Send Invite" : "Edit Event"}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#F0ECFA]" />
          <DropdownMenuItem
            disabled={!canDeleteRow}
            onSelect={() => {
              if (!canDeleteRow) {
                return;
              }

              onRequestDelete(row);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm focus:bg-[#FDEEEE]",
              canDeleteRow
                ? "cursor-pointer text-[#E04F4F] focus:text-[#E04F4F]"
                : "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]",
            )}
          >
            <DeleteIcon
              className={cn(
                "size-4",
                canDeleteRow ? "text-[#DC2626]" : "text-[#B8B5C3]",
              )}
            />
            Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function GiftItemImage({
  image,
  alt,
}: {
  image: StaticImageData | string;
  alt: string;
}) {
  if (typeof image === "string") {
    return <img src={image} alt={alt} className="h-full w-full object-cover" />;
  }

  return <Image src={image} alt={alt} className="h-full w-full object-cover" />;
}

export default function DashboardGiftsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const setCurrentContactId = useAuthStore(
    (state) => state.setCurrentContactId,
  );
  const {
    isOpen: isGiftFlowOpen,
    currentStep: currentGiftFlowStep,
    mode,
    eventId,
    giftingEventId,
    legacyEventTypeId,
    openModal: openGiftFlowModal,
    setCurrentStep: setGiftFlowStep,
    replaceCurrentStep: replaceGiftFlowStep,
    closeModal: closeGiftFlowModal,
  } = useGiftModalRouteState();
  const flowSelectionsByKey = useGiftFlowStore(
    (state) => state.flowSelectionsByKey,
  );
  const flowSelectionKey = useMemo(
    () => buildGiftFlowSelectionKey(mode, giftingEventId, eventId),
    [eventId, giftingEventId, mode],
  );
  const storedFlowSelection = useGiftFlowStore(
    (state) => state.flowSelectionsByKey[flowSelectionKey],
  );
  const flowSelection = useMemo(
    () => normalizeGiftFlowSelection(storedFlowSelection),
    [storedFlowSelection],
  );
  const setGiftFlowDraftFields = useGiftFlowStore(
    (state) => state.setDraftFields,
  );
  const setSelectedParticipantContactIds = useGiftFlowStore(
    (state) => state.setSelectedParticipantContactIds,
  );
  const setStoredSelectedGiftIds = useGiftFlowStore(
    (state) => state.setSelectedGiftIds,
  );
  const setSelectedGiftProductsById = useGiftFlowStore(
    (state) => state.setSelectedGiftProductsById,
  );
  const resetGiftFlowSelection = useGiftFlowStore(
    (state) => state.resetFlowSelection,
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteEventRow, setPendingDeleteEventRow] =
    useState<GiftingEventRow | null>(null);
  const [recordPendingDelete, setRecordPendingDelete] =
    useState<SearchableRecordItem | null>(null);
  const [recordSearchValue, setRecordSearchValue] = useState("");
  const [debouncedRecordSearchValue, setDebouncedRecordSearchValue] =
    useState("");
  const [giftInviteSearchValue, setGiftInviteSearchValue] = useState("");
  const [isGiftInviteCopyListOpen, setIsGiftInviteCopyListOpen] =
    useState(false);
  const [giftsStatsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const [
    isCompleteGiftingEventConfirmationOpen,
    setIsCompleteGiftingEventConfirmationOpen,
  ] = useState(false);
  const [isSendGiftEmailConfirmationOpen, setIsSendGiftEmailConfirmationOpen] =
    useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [newColleagueForm, setNewColleagueForm] =
    useState<AddColleagueFormValues>(EMPTY_NEW_COLLEAGUE_FORM);
  const [customContactRecordItems, setCustomContactRecordItems] = useState<
    SearchableRecordItem[]
  >([]);
  const [ensuredCurrentContactId, setEnsuredCurrentContactId] = useState<
    string | null
  >(currentContactId);
  const [hasEnsuredCurrentContact, setHasEnsuredCurrentContact] = useState(
    Boolean(currentContactId),
  );
  const [ensureCurrentContactRequested, setEnsureCurrentContactRequested] =
    useState(Boolean(currentContactId));
  const greetingName = authUser?.firstName?.trim() || "Susan";
  const selectedParticipantContactIds =
    flowSelection.selectedParticipantContactIds;
  const selectedGiftIds = flowSelection.selectedGiftIds;
  const selectedGiftProductsById = flowSelection.selectedGiftProductsById;
  const selectedGiftEventTypeId = flowSelection.selectedEventTypeId;
  const selectedGiftEventDate = flowSelection.eventDate;
  const giftEventName = flowSelection.eventName;
  const isGiftInviteStep = currentGiftFlowStep === "invite";
  const activeTabParam = searchParams.get("tab")?.trim().toLowerCase() ?? null;
  const activeTab: GiftsTab = isValidGiftsTab(activeTabParam)
    ? activeTabParam
    : "events";
  const giftStats = useDerivedGiftStats();
  const resolvedCurrentContactId =
    currentContactId?.trim() || ensuredCurrentContactId?.trim() || null;
  const {
    data: availableEventTypesResponse,
    isError: isAvailableEventTypesError,
    isLoading: isAvailableEventTypesLoading,
    refetch: refetchAvailableEventTypes,
  } = useAvailableEventTypesQuery(
    {
      per_page: 25,
      page: 1,
    },
    {
      enabled: isGiftFlowOpen && currentGiftFlowStep === "event",
    },
  );
  const isSentTab = activeTab === "sent";
  const isReceivedTab = activeTab === "received";
  const isEventsTab = activeTab === "events";
  const {
    data: giftingEventsResponse,
    isLoading: isGiftingEventsLoading,
    isFetching: isGiftingEventsFetching,
    isError: isGiftingEventsError,
    refetch: refetchGiftingEvents,
  } = useGiftingEventsQuery(
    {
      page: currentPage,
      per_page: PAGE_SIZE,
      searchQuery: debouncedQuery,
    },
    {
      enabled: isEventsTab,
    },
  );
  const {
    data: givenGroupedGiftsResponse,
    isLoading: isGivenGroupedGiftsLoading,
    isFetching: isGivenGroupedGiftsFetching,
    isError: isGivenGroupedGiftsError,
    refetch: refetchGivenGroupedGifts,
  } = useGivenGroupedGiftsQuery(
    {
      page: currentPage,
      per_page: PAGE_SIZE,
      searchQuery: debouncedQuery,
    },
    {
      enabled: isSentTab,
    },
  );
  const {
    data: receivedGiftsResponse,
    isLoading: isReceivedGiftsLoading,
    isFetching: isReceivedGiftsFetching,
    isError: isReceivedGiftsError,
    refetch: refetchReceivedGifts,
  } = useReceivedGiftsQuery(
    {
      page: currentPage,
      per_page: PAGE_SIZE,
      searchQuery: debouncedQuery,
    },
    {
      enabled: isReceivedTab,
    },
  );
  const createGiftingEventMutation = useCreateGiftingEventMutation();
  const createEventTypeMutation = useCreateEventTypeMutation();
  const updateEventTypeMutation = useUpdateEventTypeMutation();
  const deleteEventTypeMutation = useDeleteEventTypeMutation();
  const deleteGiftingEventMutation = useDeleteGiftingEventMutation();
  const completeGiftingEventMutation = useCompleteGiftingEventMutation();
  const updateGiftingEventMutation = useUpdateGiftingEventMutation();
  const sendGiftingEventInvitationsMutation =
    useSendGiftingEventInvitationsMutation();
  const ensureMyContactMutation = useEnsureMyContactMutation();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const deleteContactMutation = useDeleteContactMutation();
  const createParticipantsBulkMutation = useCreateParticipantsBulkMutation();
  const assignBulkGiftsMutation = useAssignBulkGiftsMutation();
  const shouldEnableContactsQuery =
    isGiftFlowOpen &&
    (currentGiftFlowStep === "record" || currentGiftFlowStep === "add-record");
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
    data: myParticipantResponse,
    isLoading: isMyParticipantLoading,
    isFetching: isMyParticipantFetching,
    refetch: refetchMyParticipant,
  } = useMyParticipantQuery(eventId, {
    enabled:
      isGiftFlowOpen &&
      currentGiftFlowStep === "gift-selection" &&
      Boolean(eventId),
  });
  const currentParticipantId = myParticipantResponse?.data?.id ?? null;
  const {
    data: giftingEventInvitationsResponse,
    isLoading: isGiftingEventInvitationsLoading,
    isFetching: isGiftingEventInvitationsFetching,
    isError: isGiftingEventInvitationsError,
    refetch: refetchGiftingEventInvitations,
  } = useGiftingEventInvitationsQuery(
    giftingEventId,
    {
      per_page: 100,
      page: 1,
    },
    {
      enabled: isGiftFlowOpen && isGiftInviteStep,
    },
  );

  const sentRows = useMemo<GiftRow[]>(
    () =>
      (givenGroupedGiftsResponse?.data.data ?? []).map((gift, index) =>
        toSentGiftRow(gift, index),
      ),
    [givenGroupedGiftsResponse?.data.data],
  );
  const receivedRows = useMemo<GiftRow[]>(
    () =>
      (receivedGiftsResponse?.data.data ?? []).map((gift, index) =>
        toReceivedGiftRow(gift, index),
      ),
    [receivedGiftsResponse?.data.data],
  );

  const rows = isSentTab ? sentRows : receivedRows;
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
        (eventType) => eventType.value === selectedGiftEventTypeId,
      ) ?? null,
    [eventTypeOptions, selectedGiftEventTypeId],
  );
  const eventTypeKeyById = useMemo(
    () =>
      Object.fromEntries(
        (availableEventTypesResponse?.data?.data ?? []).map((eventType) => [
          eventType.id,
          eventType.key ?? null,
        ]),
      ) as Record<string, string | null>,
    [availableEventTypesResponse],
  );
  const eventRows = useMemo<GiftingEventRow[]>(
    () =>
      (giftingEventsResponse?.data.data ?? []).map((record) =>
        toGiftingEventRow(
          record,
          eventTypeKeyById[record.event.eventTypeId],
          canManageGiftingEvent(record, {
            currentUserId: authUser?.id ?? null,
            currentContactId,
          }),
        ),
      ),
    [
      authUser?.id,
      currentContactId,
      eventTypeKeyById,
      giftingEventsResponse?.data.data,
    ],
  );
  const currentEventRow = useMemo(
    () =>
      eventRows.find((row) => row.giftingEventId === giftingEventId) ?? null,
    [eventRows, giftingEventId],
  );
  const giftInviteUrlByContactId = useMemo(
    () =>
      Object.fromEntries(
        (giftingEventInvitationsResponse?.data.data ?? []).map((invitation) => [
          invitation.eventContactId,
          invitation.inviteUrl,
        ]),
      ) as Record<string, string>,
    [giftingEventInvitationsResponse],
  );
  const giftInviteParticipants = useMemo<DrawNameInviteParticipant[]>(
    () =>
      (giftingEventInvitationsResponse?.data.data ?? []).map((invitation) => {
        const actor = invitation.eventContact;
        const fullName =
          `${actor.firstName ?? ""} ${actor.lastName ?? ""}`.trim() ||
          actor.email ||
          "Participant";
        const firstInitial = actor.firstName?.trim().charAt(0) ?? "";
        const lastInitial = actor.lastName?.trim().charAt(0) ?? "";
        const initials =
          `${firstInitial}${lastInitial}`.trim().toUpperCase() ||
          fullName.slice(0, 2).toUpperCase();
        const { avatarBg, avatarColor } = getContactAvatarStyle(
          actor.id || invitation.eventContactId || fullName,
        );

        return {
          id: actor.id || invitation.eventContactId,
          participantId:
            invitation.participantId ||
            currentEventRow?.participantIdsByContactId[
              invitation.eventContactId
            ] ||
            invitation.eventContactId,
          name: fullName,
          role:
            invitation.status.toLowerCase() === "accepted"
              ? "Accepted invite"
              : actor.email || "Pending invite",
          initials,
          avatarBg,
          avatarColor,
          inviteUrl: invitation.inviteUrl ?? null,
        };
      }),
    [
      currentEventRow?.participantIdsByContactId,
      giftingEventInvitationsResponse,
    ],
  );
  const filteredGiftInviteParticipants = useMemo(() => {
    const normalizedSearch = giftInviteSearchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return giftInviteParticipants;
    }

    return giftInviteParticipants.filter((participant) =>
      participant.name.toLowerCase().includes(normalizedSearch),
    );
  }, [giftInviteParticipants, giftInviteSearchValue]);
  const contactRecordOptions = useMemo(
    () =>
      mergeRecordItems(
        currentEventRow?.participantRecordItems ?? [],
        customContactRecordItems,
        (contactsResponse?.data.data ?? [])
          .filter((contact) => contact.id !== resolvedCurrentContactId)
          .map((contact) =>
            mapContactToRecordItem(contact, resolvedCurrentContactId),
          ),
      ),
    [
      contactsResponse?.data.data,
      currentEventRow,
      customContactRecordItems,
      resolvedCurrentContactId,
    ],
  );
  const counterpartLabel = isSentTab ? "Sent to" : "Received from";
  const giftRows = isSentTab ? sentRows : receivedRows;

  const updateActiveTab = (nextTab: GiftsTab) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("tab", nextTab);
    const nextQueryString = nextSearchParams.toString();

    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
      { scroll: false },
    );
  };

  useEffect(() => {
    if (activeTabParam === activeTab) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("tab", activeTab);
    const nextQueryString = nextSearchParams.toString();

    router.replace(
      nextQueryString ? `${pathname}?${nextQueryString}` : pathname,
      { scroll: false },
    );
  }, [activeTab, activeTabParam, pathname, router, searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedQuery]);

  const totalPages = isEventsTab
    ? Math.max(1, giftingEventsResponse?.data.totalPages ?? 1)
    : isSentTab
      ? Math.max(1, givenGroupedGiftsResponse?.data.totalPages ?? 1)
      : Math.max(1, receivedGiftsResponse?.data.totalPages ?? 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const displayedGiftRows = giftRows;
  const displayedEventRows = eventRows;

  const handleOpenGiftFlow = () => {
    resetGiftFlowSelection(buildGiftFlowSelectionKey("create", null, null));
    openGiftFlowModal("event", "create", null, null);
  };

  const openGiftingEventFlow = (
    row: GiftingEventRow,
    nextStep: GiftModalStep,
  ) => {
    const editFlowKey = buildGiftFlowSelectionKey(
      "edit",
      row.giftingEventId,
      row.eventId,
    );
    const createFlowKey = buildGiftFlowSelectionKey(
      "create",
      row.giftingEventId,
      row.eventId,
    );
    const existingEditSelection = normalizeGiftFlowSelection(
      flowSelectionsByKey[editFlowKey],
    );
    const existingCreateSelection = normalizeGiftFlowSelection(
      flowSelectionsByKey[createFlowKey],
    );
    const sourceSelection = hasGiftFlowDraft(existingEditSelection)
      ? existingEditSelection
      : existingCreateSelection;
    const nextSelectedParticipantContactIds =
      sourceSelection.selectedParticipantContactIds.length > 0
        ? sourceSelection.selectedParticipantContactIds
        : row.participantContactIds;

    setGiftFlowDraftFields(editFlowKey, {
      lastVisitedStep: nextStep,
      selectedEventTypeId:
        sourceSelection.selectedEventTypeId || row.eventTypeId,
      eventDate: sourceSelection.eventDate || row.eventDateValue,
      eventName: sourceSelection.eventName || row.titleValue,
    });
    setSelectedParticipantContactIds(
      editFlowKey,
      nextSelectedParticipantContactIds,
    );

    if (
      !existingEditSelection.selectedGiftIds.length &&
      existingCreateSelection.selectedGiftIds.length
    ) {
      setStoredSelectedGiftIds(
        editFlowKey,
        existingCreateSelection.selectedGiftIds,
      );
    }

    if (
      !Object.keys(existingEditSelection.selectedGiftProductsById).length &&
      Object.keys(existingCreateSelection.selectedGiftProductsById).length
    ) {
      setSelectedGiftProductsById(
        editFlowKey,
        existingCreateSelection.selectedGiftProductsById,
      );
    }

    openGiftFlowModal(nextStep, "edit", row.eventId, row.giftingEventId);
  };

  const handleViewGiftingEvent = (row: GiftingEventRow) => {
    router.push(`/dashboard/gifts/${encodeURIComponent(row.giftingEventId)}`);
  };

  const handleEditGiftingEvent = (row: GiftingEventRow) => {
    if (row.status === "Completed") {
      openGiftingEventFlow(row, "invite");
      return;
    }

    const editFlowKey = buildGiftFlowSelectionKey(
      "edit",
      row.giftingEventId,
      row.eventId,
    );
    const createFlowKey = buildGiftFlowSelectionKey(
      "create",
      row.giftingEventId,
      row.eventId,
    );
    const existingEditSelection = normalizeGiftFlowSelection(
      flowSelectionsByKey[editFlowKey],
    );
    const existingCreateSelection = normalizeGiftFlowSelection(
      flowSelectionsByKey[createFlowKey],
    );
    const sourceSelection = hasGiftFlowDraft(existingEditSelection)
      ? existingEditSelection
      : existingCreateSelection;
    const resumeStep =
      sourceSelection.lastVisitedStep &&
      isGiftModalStep(sourceSelection.lastVisitedStep)
        ? sourceSelection.lastVisitedStep
        : "event";

    openGiftingEventFlow(row, resumeStep);
  };

  const handleDeleteGiftingEvent = async () => {
    if (!pendingDeleteEventRow) {
      return;
    }

    try {
      const response = await deleteGiftingEventMutation.mutateAsync(
        pendingDeleteEventRow.giftingEventId,
      );
      toast.success(response.message);
      setPendingDeleteEventRow(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this gifting event right now.",
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

  const handleGiftFlowProductToggle = (
    product: MarketplaceProduct,
    checked: boolean,
  ) => {
    const nextProductsById = { ...selectedGiftProductsById };

    if (checked) {
      nextProductsById[product._id] = product;
    } else {
      delete nextProductsById[product._id];
    }

    setSelectedGiftProductsById(flowSelectionKey, nextProductsById);
  };

  const handleGiftFlowEventNext = async () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    if (mode === "edit") {
      if (!giftingEventId) {
        toast.error("Unable to resolve this gifting event right now.");
        return;
      }

      try {
        await updateGiftingEventMutation.mutateAsync({
          id: giftingEventId,
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
            : "Unable to update this gifting event right now.",
        );
        return;
      }

      setGiftFlowStep("event-date", mode, eventId, giftingEventId);
      return;
    }

    try {
      const response = await createGiftingEventMutation.mutateAsync({
        event: {
          title: selectedEventTypeOption.label,
          eventTypeId: selectedEventTypeOption.value,
        },
      });
      const nextGiftingEventId = response.data.id;
      const nextEventId = response.data.eventId;
      const nextFlowKey = buildGiftFlowSelectionKey(
        "create",
        nextGiftingEventId,
        nextEventId,
      );

      setGiftFlowDraftFields(nextFlowKey, {
        lastVisitedStep: "event-date",
        selectedEventTypeId: selectedEventTypeOption.value,
        eventDate: selectedGiftEventDate,
        eventName: response.data.event.title || selectedEventTypeOption.label,
      });

      if (selectedParticipantContactIds.length) {
        setSelectedParticipantContactIds(
          nextFlowKey,
          selectedParticipantContactIds,
        );
      }

      if (selectedGiftIds.length) {
        setStoredSelectedGiftIds(nextFlowKey, selectedGiftIds);
      }

      if (Object.keys(selectedGiftProductsById).length) {
        setSelectedGiftProductsById(nextFlowKey, selectedGiftProductsById);
      }

      if (flowSelectionKey !== nextFlowKey) {
        resetGiftFlowSelection(flowSelectionKey);
      }

      toast.success(response.message);
      setGiftFlowStep("event-date", "create", nextEventId, nextGiftingEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create this gifting event right now.",
      );
    }
  };

  const handleGiftEventDateNext = async () => {
    if (!selectedGiftEventDate) {
      return;
    }

    if (!giftingEventId) {
      toast.error("Unable to resolve this gifting event right now.");
      return;
    }

    try {
      await updateGiftingEventMutation.mutateAsync({
        id: giftingEventId,
        payload: {
          event: {
            eventDate: toIsoDate(selectedGiftEventDate),
          },
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this gifting event right now.",
      );
      return;
    }

    setGiftFlowStep("event-name", mode, eventId, giftingEventId);
  };

  const handleSaveGiftEventDetails = async () => {
    if (!giftingEventId) {
      toast.error("Unable to resolve this gifting event right now.");
      return;
    }

    if (!selectedGiftEventTypeId || !selectedGiftEventDate) {
      toast.error("Please complete all gifting event details.");
      return;
    }

    const resolvedTitle =
      giftEventName.trim() ||
      selectedEventTypeOption?.label ||
      "Untitled event";

    try {
      const response = await updateGiftingEventMutation.mutateAsync({
        id: giftingEventId,
        payload: {
          event: {
            title: resolvedTitle,
            eventTypeId: selectedGiftEventTypeId,
            eventDate: toIsoDate(selectedGiftEventDate),
          },
        },
      });

      toast.success(response.message);
      setGiftFlowDraftFields(flowSelectionKey, {
        eventName: resolvedTitle,
      });
      setGiftFlowStep("record", mode, eventId, giftingEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this gifting event right now.",
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
    setGiftFlowStep("add-record", mode, eventId, giftingEventId);
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
    setGiftFlowStep("add-record", mode, eventId, giftingEventId);
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
      setGiftFlowStep("record", mode, eventId, giftingEventId);
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

  const handleGiftParticipantsNext = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this gifting event right now.");
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

      await refetchGiftingEvents();
      toast.success(response.message || "Participants saved successfully.");
      setGiftFlowStep("gift-selection", mode, eventId, giftingEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to add participants right now.",
      );
    }
  };

  const resolveGiftSelectionContext = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this gifting event right now.");
      return null;
    }

    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant first.");
      return null;
    }

    let resolvedParticipantId = currentParticipantId;

    if (!resolvedParticipantId) {
      const refreshedParticipantResponse = await refetchMyParticipant();
      resolvedParticipantId =
        refreshedParticipantResponse.data?.data?.id ?? null;
    }

    if (!resolvedParticipantId) {
      toast.error("Unable to resolve your participant record right now.");
      return null;
    }

    const selectedProducts = selectedGiftIds
      .map((selectedId) => selectedGiftProductsById[selectedId])
      .filter((product): product is MarketplaceProduct => Boolean(product));

    if (!selectedProducts.length) {
      toast.error("Please select at least one gift before continuing.");
      return null;
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
      return null;
    }

    let participantIdsByContactId =
      currentEventRow?.participantIdsByContactId ?? {};
    let resolvedRecipientParticipantIds = Array.from(
      new Set(
        selectedParticipantContactIds
          .map((contactId) => participantIdsByContactId[contactId])
          .filter((participantId): participantId is string =>
            Boolean(participantId?.trim()),
          ),
      ),
    );

    if (
      resolvedRecipientParticipantIds.length !==
      selectedParticipantContactIds.length
    ) {
      const refreshedGiftingEventsResponse = await refetchGiftingEvents();
      const refreshedRecord = (
        refreshedGiftingEventsResponse.data?.data.data ?? []
      ).find(
        (record) => record.id === giftingEventId || record.eventId === eventId,
      );

      if (refreshedRecord) {
        participantIdsByContactId = getParticipantIdsByContactId(
          refreshedRecord.event.participants,
        );
        resolvedRecipientParticipantIds = Array.from(
          new Set(
            selectedParticipantContactIds
              .map((contactId) => participantIdsByContactId[contactId])
              .filter((participantId): participantId is string =>
                Boolean(participantId?.trim()),
              ),
          ),
        );
      }
    }

    if (
      !resolvedRecipientParticipantIds.length ||
      resolvedRecipientParticipantIds.length !==
        selectedParticipantContactIds.length
    ) {
      toast.error("Unable to resolve the selected participants right now.");
      return null;
    }

    return {
      resolvedEventId: eventId,
      resolvedGiverParticipantId: resolvedParticipantId,
      resolvedRecipientParticipantIds,
      selectedProducts,
    };
  };

  const handleGiftFlowSelectionNext = async () => {
    if (!selectedGiftIds.length) {
      toast.error("Please select at least one gift before continuing.");
      return;
    }

    setIsCompleteGiftingEventConfirmationOpen(true);
  };

  const handleConfirmCompleteGiftingEvent = async () => {
    if (!giftingEventId) {
      toast.error("Unable to resolve this gifting event right now.");
      return;
    }

    const selectionContext = await resolveGiftSelectionContext();

    if (!selectionContext) {
      return;
    }

    try {
      await assignBulkGiftsMutation.mutateAsync({
        eventId: selectionContext.resolvedEventId,
        giverParticipantId: selectionContext.resolvedGiverParticipantId,
        recipientParticipantIds:
          selectionContext.resolvedRecipientParticipantIds,
        gifts: selectionContext.selectedProducts.map((product) => ({
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

      const completeResponse =
        await completeGiftingEventMutation.mutateAsync(giftingEventId);
      toast.success(completeResponse.message);
      setIsCompleteGiftingEventConfirmationOpen(false);
      setIsGiftInviteCopyListOpen(false);
      setGiftFlowStep(
        "invite",
        mode,
        selectionContext.resolvedEventId,
        giftingEventId,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this gifting event right now.",
      );
    }
  };

  const handleGiftInviteBack = () => {
    setGiftFlowStep("gift-selection", mode, eventId, giftingEventId);
  };

  const handleGiftInviteSendEmail = () => {
    setIsSendGiftEmailConfirmationOpen(true);
  };

  const handleConfirmSendGiftInviteEmails = async () => {
    if (!giftingEventId) {
      toast.error("Unable to resolve this gifting event right now.");
      return;
    }

    const contactIds = currentEventRow?.participantContactIds?.length
      ? currentEventRow.participantContactIds
      : selectedParticipantContactIds;

    if (!contactIds.length) {
      toast.error("No participants are available for invitation yet.");
      return;
    }

    try {
      const response = await sendGiftingEventInvitationsMutation.mutateAsync({
        giftingEventId,
        payload: {
          channel: "email",
          contactIds,
        },
      });
      toast.success(response.message);
      setIsSendGiftEmailConfirmationOpen(false);
      setIsGiftInviteCopyListOpen(true);
      await refetchGiftingEventInvitations();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send invitation emails right now.",
      );
    }
  };

  const handleGiftInviteToggleCopyList = () => {
    setIsGiftInviteCopyListOpen((current) => {
      const next = !current;

      if (next && giftingEventId) {
        void refetchGiftingEventInvitations();
      }

      return next;
    });
  };

  const handleGiftInviteCopyLink = async (participantId: string) => {
    const participant = giftInviteParticipants.find(
      (item) => item.participantId === participantId,
    );
    const inviteUrl = participant
      ? giftInviteUrlByContactId[participant.id] || participant.inviteUrl
      : null;

    if (!inviteUrl) {
      toast.error(
        "No invitation link is available for this participant yet. Send email invite first.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invitation link copied.");
    } catch {
      toast.error("Unable to copy this invitation link right now.");
    }
  };

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
      !isGiftFlowOpen ||
      mode !== "edit" ||
      !giftingEventId ||
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
    flowSelectionKey,
    giftingEventId,
    isGiftFlowOpen,
    mode,
    selectedParticipantContactIds.length,
    setSelectedParticipantContactIds,
  ]);

  useEffect(() => {
    if (!isGiftFlowOpen) {
      return;
    }

    setGiftFlowDraftFields(flowSelectionKey, {
      lastVisitedStep: currentGiftFlowStep,
    });
  }, [
    currentGiftFlowStep,
    flowSelectionKey,
    isGiftFlowOpen,
    setGiftFlowDraftFields,
  ]);

  useEffect(() => {
    if (
      !isGiftFlowOpen ||
      currentGiftFlowStep !== "event" ||
      !legacyEventTypeId
    ) {
      return;
    }

    if (!selectedGiftEventTypeId) {
      setGiftFlowDraftFields(flowSelectionKey, {
        selectedEventTypeId: legacyEventTypeId,
      });
    }

    replaceGiftFlowStep("event", mode, eventId, giftingEventId);
  }, [
    currentGiftFlowStep,
    eventId,
    flowSelectionKey,
    giftingEventId,
    isGiftFlowOpen,
    legacyEventTypeId,
    mode,
    replaceGiftFlowStep,
    selectedGiftEventTypeId,
    setGiftFlowDraftFields,
  ]);

  useEffect(() => {
    if (isGiftFlowOpen && currentGiftFlowStep !== "event" && !giftingEventId) {
      closeGiftFlowModal();
    }
  }, [closeGiftFlowModal, isGiftFlowOpen, currentGiftFlowStep, giftingEventId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gifts"
        description="Track gifting events, gifts sent and gifts received"
        actions={
          <>
            <Button
              type="button"
              onClick={handleOpenGiftFlow}
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

      <>
        {/* Carousel for mobile */}
        <div className="sm:hidden">
          <div className="overflow-hidden" ref={giftsStatsEmblaRef}>
            <div className="flex gap-3">
              {giftStats.map((stat) => (
                <div key={stat.label} className="min-w-0 flex-[0_0_100%]">
                  <GiftsStatCard {...stat} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid for tablet and above */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {giftStats.map((stat) => (
            <GiftsStatCard key={stat.label} {...stat} />
          ))}
        </div>
      </>

      <section className="rounded-[24px] border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 border-b border-[#F1EDF8] pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-6">
            <button
              type="button"
              onClick={() => updateActiveTab("events")}
              className={cn(
                "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                activeTab === "events"
                  ? "border-[#3300C9] text-[#3300C9]"
                  : "border-transparent text-[#9A97A5]",
              )}
            >
              Gifting Events
            </button>
            <button
              type="button"
              onClick={() => updateActiveTab("sent")}
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
              onClick={() => updateActiveTab("received")}
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
                placeholder={
                  isEventsTab
                    ? "Search gifting events......"
                    : "Search gifts......"
                }
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

        {(isEventsTab && (isGiftingEventsLoading || isGiftingEventsFetching)) ||
        (isSentTab &&
          (isGivenGroupedGiftsLoading || isGivenGroupedGiftsFetching)) ||
        (isReceivedTab &&
          (isReceivedGiftsLoading || isReceivedGiftsFetching)) ? (
          <div className="mt-4">
            <TableLoadingState rows={5} />
          </div>
        ) : (isEventsTab && isGiftingEventsError) ||
          (isSentTab && isGivenGroupedGiftsError) ||
          (isReceivedTab && isReceivedGiftsError) ? (
          <div className="mt-4 rounded-[16px] border border-[#F1EDF8] bg-[#FCFBFF] px-6 py-10 text-center">
            <p className="text-sm text-[#7D7D7D]">
              {isEventsTab
                ? "Unable to load gifting events right now."
                : isSentTab
                  ? "Unable to load the gifts you have given right now."
                  : "Unable to load the gifts you have received right now."}
            </p>
            <button
              type="button"
              onClick={() =>
                isEventsTab
                  ? void refetchGiftingEvents()
                  : isSentTab
                    ? void refetchGivenGroupedGifts()
                    : void refetchReceivedGifts()
              }
              className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[940px] border-separate border-spacing-y-3">
                <thead>
                  <tr>
                    <th className="w-12 px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                      <Checkbox
                        aria-label={
                          isEventsTab
                            ? "Select all gifting events"
                            : "Select all gifts"
                        }
                      />
                    </th>
                    {isEventsTab ? (
                      <>
                        <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                          Event Name
                        </th>
                        <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                          Event Date
                        </th>
                        <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                          Created By
                        </th>
                        <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                          Participants
                        </th>
                        <th className="px-3 py-2 text-left text-[13px] font-medium text-[#9A97A5]">
                          Status
                        </th>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                    <th className="w-12 px-3 py-2" />
                  </tr>
                </thead>

                <tbody>
                  {isEventsTab ? (
                    displayedEventRows.length > 0 ? (
                      displayedEventRows.map((row) => (
                        <tr
                          key={row.id}
                          className="[&>td]:border-y [&>td]:border-[#F1EDF8] [&>td]:bg-white [&>td]:py-3.5"
                        >
                          <td className="rounded-l-[16px] border-l border-[#F1EDF8] px-3">
                            <Checkbox aria-label={`Select ${row.eventName}`} />
                          </td>
                          <td className="px-3 text-sm font-medium text-[#1E1E1E]">
                            {row.eventName}
                          </td>
                          <td className="px-3 text-sm text-[#434343]">
                            {row.eventDate}
                          </td>
                          <td className="px-3 text-sm text-[#434343]">
                            {row.createdBy}
                          </td>
                          <td className="px-3">
                            <ParticipantStack people={row.participants} />
                          </td>
                          <td className="px-3">
                            <GiftingEventStatusPill status={row.status} />
                          </td>
                          <td className="rounded-r-[16px] border-r border-[#F1EDF8] px-3">
                            <GiftingEventRowActions
                              row={row}
                              onView={handleViewGiftingEvent}
                              onEdit={handleEditGiftingEvent}
                              onRequestDelete={setPendingDeleteEventRow}
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="rounded-[16px] border border-[#F1EDF8] bg-[#FCFBFF] px-6 py-10 text-center text-sm text-[#7D7D7D]"
                        >
                          No gifting events match your search right now.
                        </td>
                      </tr>
                    )
                  ) : displayedGiftRows.length > 0 ? (
                    displayedGiftRows.map((row) => {
                      const people = isSentTab
                        ? (row.sentTo ?? [])
                        : (row.receivedFrom ?? []);

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
                                <GiftItemImage
                                  image={row.image}
                                  alt={row.item}
                                />
                              </div>
                              <span className="text-sm font-medium text-[#1E1E1E]">
                                {row.item}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 text-sm text-[#434343]">
                            {row.eventName}
                          </td>
                          <td className="px-3 text-sm text-[#434343]">
                            {row.eventDate}
                          </td>
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

            <Pagination
              key={`${activeTab}-${query}-${totalPages}`}
              total={totalPages}
              initialPage={currentPage}
              onPageChange={setCurrentPage}
              className="mt-4"
            />
          </>
        )}
      </section>

      <ConfirmationModal
        open={Boolean(pendingDeleteEventRow)}
        onClose={() => setPendingDeleteEventRow(null)}
        onConfirm={handleDeleteGiftingEvent}
        action="delete"
        title="Delete Gifting Event"
        description={
          pendingDeleteEventRow
            ? `Are you sure you want to delete ${pendingDeleteEventRow.eventName}?`
            : "Are you sure you want to delete this gifting event?"
        }
        confirmText="Delete"
        isLoading={deleteGiftingEventMutation.isPending}
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
      />

      <ConfirmationModal
        open={isCompleteGiftingEventConfirmationOpen}
        onClose={() => setIsCompleteGiftingEventConfirmationOpen(false)}
        onConfirm={handleConfirmCompleteGiftingEvent}
        action="save"
        title="Complete Gifting Event"
        description="Are you sure you are ready to complete this gifting event and continue to the invite step?"
        confirmText="Yes, Continue"
        isLoading={
          assignBulkGiftsMutation.isPending ||
          completeGiftingEventMutation.isPending
        }
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isSendGiftEmailConfirmationOpen}
        onClose={() => setIsSendGiftEmailConfirmationOpen(false)}
        onConfirm={handleConfirmSendGiftInviteEmails}
        action="save"
        title="Send Invitation Emails"
        description="Are you sure you want to send invitation emails to all pending participants?"
        confirmText="Send Emails"
        isLoading={sendGiftingEventInvitationsMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ContentModal
        open={isGiftFlowOpen}
        onClose={closeGiftFlowModal}
        title="Get a Gift"
        showHeader={false}
        closeOnOverlayClick={false}
        bodyScrollable={
          currentGiftFlowStep !== "gift-selection" && !isGiftInviteStep
        }
        dialogClassName={cn(
          "rounded-[18px] bg-white sm:rounded-[20px]",
          currentGiftFlowStep === "gift-selection"
            ? "max-h-[calc(100vh-1.5rem)] max-w-[1240px]"
            : "max-w-[536px]",
        )}
        bodyClassName={cn(
          currentGiftFlowStep === "gift-selection"
            ? "!max-h-[calc(100vh-1.5rem)] flex h-[calc(100vh-1.5rem)] min-h-0 px-4 py-4 sm:px-8 sm:py-8 lg:px-10"
            : "px-4 py-6 sm:px-8 sm:py-10 lg:px-10",
        )}
      >
        {currentGiftFlowStep === "gift-selection" ? (
          <WishlistGiftSelectionStep
            selectedIds={selectedGiftIds}
            onSelectedIdsChange={(ids) =>
              setStoredSelectedGiftIds(flowSelectionKey, ids)
            }
            onSelectedProductToggle={handleGiftFlowProductToggle}
            onBack={() =>
              setGiftFlowStep("record", mode, eventId, giftingEventId)
            }
            onNext={handleGiftFlowSelectionNext}
            nextDisabled={
              !selectedGiftIds.length ||
              assignBulkGiftsMutation.isPending ||
              isMyParticipantLoading ||
              isMyParticipantFetching
            }
            nextLabel={assignBulkGiftsMutation.isPending ? "Saving..." : "Next"}
          />
        ) : currentGiftFlowStep === "invite" ? (
          <DrawNameInviteStep
            title={
              <>
                Invite members to your
                <br />
                gifting event.
              </>
            }
            onBack={handleGiftInviteBack}
            participants={filteredGiftInviteParticipants}
            isCopyListOpen={isGiftInviteCopyListOpen}
            onToggleCopyList={handleGiftInviteToggleCopyList}
            onSendEmail={handleGiftInviteSendEmail}
            onCopyLink={handleGiftInviteCopyLink}
            isSendingEmail={sendGiftingEventInvitationsMutation.isPending}
            isLoadingLinks={
              isGiftingEventInvitationsLoading ||
              isGiftingEventInvitationsFetching
            }
            isLinksError={isGiftingEventInvitationsError}
            onRetryLinks={() => {
              void refetchGiftingEventInvitations();
            }}
            searchValue={giftInviteSearchValue}
            onSearchValueChange={setGiftInviteSearchValue}
          />
        ) : currentGiftFlowStep === "event-date" ? (
          <EventDateStep
            eventName={selectedEventTypeOption?.label ?? "Event"}
            value={selectedGiftEventDate}
            onChange={(value) =>
              setGiftFlowDraftFields(flowSelectionKey, {
                eventDate: value,
              })
            }
            onBack={() =>
              setGiftFlowStep("event", mode, eventId, giftingEventId)
            }
            onNext={handleGiftEventDateNext}
            heading="What's the date?"
            headingAlign="left"
            showGoToEventNameLink={false}
          />
        ) : currentGiftFlowStep === "event-name" ? (
          <GroupNameStep
            value={giftEventName}
            onChange={(value) =>
              setGiftFlowDraftFields(flowSelectionKey, {
                eventName: value,
              })
            }
            onBack={() =>
              setGiftFlowStep("event-date", mode, eventId, giftingEventId)
            }
            onNext={handleSaveGiftEventDetails}
            title="Below is a suggestion of a name for your event."
            description="Feel free to edit as you see fit."
            placeholder="Write event name"
            nextLabel={
              updateGiftingEventMutation.isPending ? "Saving..." : "Next"
            }
            nextDisabled={updateGiftingEventMutation.isPending}
          />
        ) : currentGiftFlowStep === "add-record" ? (
          <AddColleagueForm
            values={newColleagueForm}
            onChange={handleNewColleagueChange}
            onBack={() => {
              setEditingRecordId(null);
              setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
              setGiftFlowStep("record", mode, eventId, giftingEventId);
            }}
            onSave={handleSaveNewColleague}
            saveDisabled={isSaveNewColleagueDisabled}
            isSaving={activeContactMutationPending}
            saveLabel={editingRecordId ? "Edit" : "Save"}
            savingLabel={editingRecordId ? "Editing" : "Saving"}
          />
        ) : currentGiftFlowStep === "record" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
                Hey {greetingName},
              </p>
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                Who&apos;d you like to gift with?
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
                      setGiftFlowStep(
                        "event-name",
                        mode,
                        eventId,
                        giftingEventId,
                      )
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
                    onClick={handleGiftParticipantsNext}
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
                  selectedGiftEventTypeId ||
                  EMPTY_GIFT_FLOW_SELECTION.selectedEventTypeId
                }
                onValueChange={(value) =>
                  setGiftFlowDraftFields(flowSelectionKey, {
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
              onClick={handleGiftFlowEventNext}
              disabled={
                !selectedGiftEventTypeId ||
                createGiftingEventMutation.isPending ||
                updateGiftingEventMutation.isPending
              }
            >
              {createGiftingEventMutation.isPending ||
              updateGiftingEventMutation.isPending
                ? "Saving..."
                : "Next"}
            </ModalButton>
          </div>
        )}
      </ContentModal>
    </div>
  );
}

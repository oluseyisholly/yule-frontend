"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  MailIcon,
  MoreHorizontal,
  SendIcon,
  Settings2Icon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import AddColleagueForm, {
  type AddColleagueFormValues,
} from "@/components/AddColleagueForm";
import FlowActionButtons from "@/components/FlowActionButtons";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import CustomColleagueReview from "@/components/CustomColleagueReview";
import RichTextComposer from "@/components/RichTextComposer";
import PageHeader from "@/components/dashboard/PageHeader";
import EventDateStep from "@/components/EventDateStep";
import DeleteIcon from "@/components/icons/DeleteIcon";
import EditPencilIcon from "@/components/icons/EditPencilIcon";
import FilterIcon from "@/components/icons/FilterIcon";
import ViewIcon from "@/components/icons/ViewIcon";
import ModalButton from "@/components/ModalButtons";
import OverlayRecordPicker from "@/components/OverlayRecordPicker";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import Pagination from "@/components/Pagination";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import ContentModal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import StatusPill from "@/components/ui/status-pill";
import Table, { type TableData } from "@/components/ui/Table";
import { SearchInput } from "@/components/ui/search-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import { useExternalBusinessesQuery } from "@/features/auth/hooks/useExternalBusinessesQuery";
import {
  useOnedaProfilesQuery,
  type OnedaProfile,
} from "@/features/auth/hooks/useOnedaProfilesQuery";
import type { ExternalBusinessRecord } from "@/features/auth/types";
import { useCreateContactMutation } from "@/features/contacts/hooks/useCreateContactMutation";
import { useCreateBulkContactsMutation } from "@/features/contacts/hooks/useCreateBulkContactsMutation";
import { useContactsQuery } from "@/features/contacts/hooks/useContactsQuery";
import type { Contact } from "@/features/contacts/types";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import type { ParticipatedEventParticipant } from "@/features/events/types";
import { useContactGiftCartParticipantGiftIdsQuery } from "@/features/gifts/hooks/useContactGiftCartParticipantGiftIdsQuery";
import type { CreateBulkGiftItemPayload } from "@/features/gifts/types";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { buildSignedInInviteUrl } from "@/lib/invite-links";
import { useCompleteScheduledEventMessageSetupMutation } from "@/features/scheduled-event-messages/hooks/useCompleteScheduledEventMessageSetupMutation";
import { useDeleteScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useDeleteScheduledEventMessageMutation";
import { useScheduledEventMessageQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessageQuery";
import { useScheduledEventMessageMetricsQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessageMetricsQuery";
import { useScheduledEventMessagesQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessagesQuery";
import { useSetupScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useSetupScheduledEventMessageMutation";
import { useUpdateScheduledEventMessageSetupMutation } from "@/features/scheduled-event-messages/hooks/useUpdateScheduledEventMessageSetupMutation";
import type {
  ScheduledEventMessageRecord,
  ScheduledEventMessageSetupPayload,
} from "@/features/scheduled-event-messages/types";
import { cn } from "@/lib/utils";
import {
  isScheduleMessageFlowStep,
  type ScheduleMessageFlowStep,
} from "@/screens/schedule/modal-steps";
import UserAvatar from "@/components/UserAvatar";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildScheduleMessageFlowSelectionKey,
  normalizeScheduleMessageFlowSelection,
  useScheduleMessageFlowStore,
  type ScheduleMessageFlowForm,
  type ScheduleMessageFlowMode,
} from "@/stores/schedule-message-flow-store";

type ScheduleStatus = "Upcoming" | "Past";
type ScheduleEventTiming = "upcoming" | "previous";

type ScheduleMetric = {
  value: string;
  label: string;
  hint?: string;
  hintColor?: string;
  icon: ReactNode;
  iconBg: string;
};

const PAGE_SIZE = 20;
const DEFAULT_SCHEDULE_TIME = "09:00";
const SCHEDULE_TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${`${hours}`.padStart(2, "0")}:${`${minutes}`.padStart(2, "0")}`;
});

const EMPTY_ADD_SCHEDULE_CONTACT_FORM: AddColleagueFormValues = {
  gender: "",
  ageRange: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatScheduleMetricValue(value: number) {
  return new Intl.NumberFormat("en-NG").format(value);
}

function formatScheduleMetricCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function toDateTimeLocalValue(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offsetDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000,
  );
  return offsetDate.toISOString().slice(0, 16);
}

function toDateOnlyValue(value?: string | null) {
  return toDateTimeLocalValue(value).slice(0, 10);
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDateFromDateTimeLocalValue(value?: string | null) {
  if (!value) return undefined;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getTimeFromDateTimeLocalValue(value?: string | null) {
  if (!value) return "";

  return value.split("T")[1]?.slice(0, 5) ?? "";
}

function formatScheduleTimeLabel(timeValue?: string | null) {
  const [rawHours = "09", rawMinutes = "00"] = (
    timeValue || DEFAULT_SCHEDULE_TIME
  ).split(":");
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const safeHours = Number.isFinite(hours) ? hours : 9;
  const safeMinutes = Number.isFinite(minutes) ? minutes : 0;
  const period = safeHours >= 12 ? "PM" : "AM";
  const twelveHour = safeHours % 12 || 12;

  return `${twelveHour}:${`${safeMinutes}`.padStart(2, "0")} ${period}`;
}

function formatScheduledDatePickerValue(value?: string | null) {
  const date = getDateFromDateTimeLocalValue(value);

  if (!date) return "Choose date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getPlainTextFromHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

function mergeDateAndTimeToDateTimeLocalValue(date: Date, timeValue?: string) {
  const [rawHours = "09", rawMinutes = "00"] = (
    timeValue || DEFAULT_SCHEDULE_TIME
  ).split(":");
  const nextDate = new Date(date);
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  nextDate.setHours(
    Number.isNaN(hours) ? 9 : hours,
    Number.isNaN(minutes) ? 0 : minutes,
    0,
    0,
  );

  const year = nextDate.getFullYear();
  const month = `${nextDate.getMonth() + 1}`.padStart(2, "0");
  const day = `${nextDate.getDate()}`.padStart(2, "0");
  const resolvedHours = `${nextDate.getHours()}`.padStart(2, "0");
  const resolvedMinutes = `${nextDate.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${resolvedHours}:${resolvedMinutes}`;
}

function getInitials(firstName?: string | null, lastName?: string | null) {
  const initials = `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`
    .trim()
    .toUpperCase();

  return initials || "YU";
}

function getParticipantName(participant?: ParticipatedEventParticipant | null) {
  const contact = participant?.eventContact;
  const fullName =
    `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim();

  return fullName || contact?.email || "Unnamed participant";
}

function getScheduledMessageParticipant(
  row?: ScheduledEventMessageRecord | null,
) {
  return row?.participant ?? row?.participants?.[0] ?? null;
}

function getScheduledMessageRecipientName(row: ScheduledEventMessageRecord) {
  const participant = getScheduledMessageParticipant(row);

  return row.recipientName?.trim() || getParticipantName(participant);
}

function getScheduledMessageRecipients(row: ScheduledEventMessageRecord) {
  const participants = row.participants ?? [];

  return participants
    .map((participant) => {
      const contact = participant.eventContact;
      const firstName = contact?.firstName?.trim() || "";
      const lastName = contact?.lastName?.trim() || "";
      const name =
        `${firstName} ${lastName}`.trim() || contact?.email?.trim() || "Recipient";

      return {
        id: participant.id,
        name,
        firstName,
        lastName,
        profileUrl: contact?.profileUrl?.trim() || null,
      };
    })
    .filter((recipient) => recipient.name.trim());
}

function mapScheduledMessageParticipantsToRecordItems(
  row: ScheduledEventMessageRecord,
): SearchableRecordItem[] {
  const participants = row.participants ?? [];

  const mappedParticipants: SearchableRecordItem[] = [];

  participants.forEach((participant) => {
    const contact = participant.eventContact;
    const firstName = contact?.firstName?.trim() || "";
    const lastName = contact?.lastName?.trim() || "";
    const email = contact?.email?.trim() || "";
    const contactId = contact?.id?.trim() || participant.eventContactId || "";
    const participantId = participant.id?.trim() || "";
    const recordId = contactId || participantId;

    if (!recordId) {
      return;
    }

    mappedParticipants.push({
      id: recordId,
      name: `${firstName} ${lastName}`.trim() || email || "Selected contact",
      email,
      subtitle: email || "Contact",
      firstName,
      lastName,
      profileUrl: contact?.profileUrl?.trim() || null,
      initials: getInitials(firstName, lastName),
    });
  });

  if (mappedParticipants.length) {
    return mappedParticipants;
  }

  const fallbackParticipant = getScheduledMessageParticipant(row);
  const fallbackContact = fallbackParticipant?.eventContact;
  const fallbackContactId =
    fallbackContact?.id?.trim() || fallbackParticipant?.eventContactId || "";
  const fallbackParticipantId =
    fallbackParticipant?.id?.trim() || row.participantId || "";
  const fallbackRecordId = fallbackContactId || fallbackParticipantId;

  if (!fallbackRecordId) {
    return [];
  }

  const firstName = fallbackContact?.firstName?.trim() || "";
  const lastName = fallbackContact?.lastName?.trim() || "";
  const email = fallbackContact?.email?.trim() || row.recipientEmail?.trim() || "";

  return [
    {
      id: fallbackRecordId,
      name:
        `${firstName} ${lastName}`.trim() ||
        email ||
        row.recipientName ||
        "Selected contact",
      email,
      subtitle: email || "Contact",
      firstName,
      lastName,
      profileUrl: fallbackContact?.profileUrl?.trim() || null,
      initials: getInitials(firstName || row.recipientName, lastName),
    },
  ];
}

function getRecordStatus(row: ScheduledEventMessageRecord): ScheduleStatus {
  if (row.status === "sent" || row.sentAt) {
    return "Past";
  }

  if (row.scheduledAt && new Date(row.scheduledAt).getTime() < Date.now()) {
    return "Past";
  }

  return "Upcoming";
}

function getScheduleEventTiming(tab: ScheduleStatus): ScheduleEventTiming {
  return tab === "Upcoming" ? "upcoming" : "previous";
}

function isScheduledEventCompleted(row: ScheduledEventMessageRecord) {
  return row.event?.status?.trim().toLowerCase() === "completed";
}

function mapContactToRecordItem(contact: Contact): SearchableRecordItem {
  const firstName = contact.firstName?.trim() || "";
  const lastName = contact.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = contact.email?.trim() || "";
  const phoneNumber =
    contact.phoneNumber?.trim() || contact.phone?.trim() || "";

  return {
    id: contact.id,
    name: fullName || email || "Unnamed contact",
    subtitle: email || phoneNumber || "Contact",
    email,
    firstName,
    lastName,
    phoneNumber,
    gender:
      contact.gender === "male" || contact.gender === "female"
        ? contact.gender
        : "",
    profileUrl: contact.profileUrl ?? null,
    initials: getInitials(firstName, lastName),
    createdById: contact.createdById ?? null,
    isManageable: Boolean(contact.createdById),
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
  };
}

function mapOnedaProfileToRecordItem(
  profile: OnedaProfile,
): SearchableRecordItem {
  const firstName = profile.accountId.firstName?.trim() || "";
  const lastName = profile.accountId.lastName?.trim() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: profile._id,
    name: fullName || profile.accountId.email || "Unnamed colleague",
    email: profile.accountId.email,
    subtitle: profile.accountId.email,
    firstName,
    lastName,
    phoneNumber: profile.accountId.phoneNumber ?? "",
    profileUrl: profile.profilePhotoUrl?.trim() || null,
    initials: getInitials(firstName, lastName),
  };
}

function mergeRecordItems(
  currentItems: SearchableRecordItem[],
  nextItems: SearchableRecordItem[],
) {
  const merged = new Map<string, SearchableRecordItem>();

  currentItems.forEach((item) => merged.set(item.id, item));
  nextItems.forEach((item) => merged.set(item.id, item));

  return Array.from(merged.values());
}

function mapMarketplaceProductToGiftPayload(
  product: MarketplaceProduct,
): CreateBulkGiftItemPayload {
  return {
    participantGiftId: product._id,
    quantity: 1,
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
  };
}

function buildScheduledMessageGiftInvitePath(eventId: string) {
  const trimmedEventId = eventId.trim();

  if (!trimmedEventId) {
    return "";
  }

  return `/dashboard/gifts?tab=received&eventId=${encodeURIComponent(
    trimmedEventId,
  )}`;
}

function buildScheduleParticipantClientRefs(
  records: SearchableRecordItem[],
  selectedIds: string[],
) {
  const uniqueOrderedIds = Array.from(
    new Set(
      selectedIds.filter(Boolean).concat(
        records.map((record) => record.id).filter(Boolean),
      ),
    ),
  );

  return uniqueOrderedIds.map((contactId, index) => ({
    clientRef: `p${index + 1}`,
    contactId,
  }));
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

function AvatarBubble({ name, initials }: { name: string; initials: string }) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EFE6FD] text-[10px] font-semibold text-[#3300C9]"
      title={name}
    >
      {initials}
    </span>
  );
}

function RecipientCell({ row }: { row: ScheduledEventMessageRecord }) {
  const participant = getScheduledMessageParticipant(row);
  const participantContact = participant?.eventContact;
  const name = getScheduledMessageRecipientName(row);
  const initials = getInitials(
    participantContact?.firstName ?? name,
    participantContact?.lastName ?? "",
  );
  const recipients = getScheduledMessageRecipients(row);

  if (recipients.length > 0) {
    const visibleRecipients = recipients.slice(0, 3);
    const overflowCount = Math.max(recipients.length - visibleRecipients.length, 0);

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-2">
          {visibleRecipients.map((recipient) => (
            <UserAvatar
              key={recipient.id}
              name={recipient.name}
              initials={getInitials(recipient.firstName, recipient.lastName)}
              imageUrl={recipient.profileUrl}
              className="size-8 border border-white text-[9px] font-semibold"
              title={recipient.name}
            />
          ))}
          {overflowCount > 0 ? (
            <span className="flex size-8 items-center justify-center rounded-full border border-white bg-[#F5F5F7] text-[9px] font-semibold text-[#6F6C75]">
              +{overflowCount}
            </span>
          ) : null}
        </div>
        <span className="font-medium text-[#434343]">
          {recipients.length === 1 ? recipients[0]?.name : `${recipients.length} recipients`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <AvatarBubble name={name} initials={initials} />
      <span className="font-medium text-[#434343]">{name}</span>
    </div>
  );
}


function ScheduleRowActions({
  row,
  onView,
  onEdit,
  onDelete,
}: {
  row: ScheduledEventMessageRecord;
  onView: (row: ScheduledEventMessageRecord) => void;
  onEdit: (row: ScheduledEventMessageRecord) => void;
  onDelete: (row: ScheduledEventMessageRecord) => void;
}) {
  const isCompleted = isScheduledEventCompleted(row);

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More options for ${getScheduledMessageRecipientName(
              row,
            )}`}
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
            View
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isCompleted}
            onSelect={() => {
              if (!isCompleted) {
                onEdit(row);
              }
            }}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]",
              isCompleted && "cursor-not-allowed opacity-45",
            )}
          >
            <EditPencilIcon className="size-4 text-[#292D32]" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isCompleted}
            onSelect={() => {
              if (!isCompleted) {
                onDelete(row);
              }
            }}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-2 text-sm text-[#D14B4B] focus:bg-[#FFF1F1] focus:text-[#D14B4B]",
              isCompleted && "cursor-not-allowed opacity-45",
            )}
          >
            <DeleteIcon className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const authToken = useAuthStore((state) => state.token);
  const routeStep =
    pathname.match(/\/dashboard\/schedule\/flow\/([^/?]+)/)?.[1] ?? null;
  const currentStep =
    routeStep && isScheduleMessageFlowStep(routeStep) ? routeStep : null;
  const mode: ScheduleMessageFlowMode =
    searchParams.get("mode") === "message" ? "message" : "schedule";
  const editingMessageId = searchParams.get("scheduleEventMessageId");
  const routeEventId = searchParams.get("eventId") ?? "";
  const flowSelectionKey = useMemo(
    () => buildScheduleMessageFlowSelectionKey(mode, editingMessageId, routeEventId),
    [editingMessageId, mode, routeEventId],
  );
  const flowSelectionsByKey = useScheduleMessageFlowStore(
    (state) => state.flowSelectionsByKey,
  );
  const setScheduleDraftFields = useScheduleMessageFlowStore(
    (state) => state.setDraftFields,
  );
  const setStoredSelectedParticipantIds = useScheduleMessageFlowStore(
    (state) => state.setSelectedParticipantIds,
  );
  const setStoredSelectedParticipantRecords = useScheduleMessageFlowStore(
    (state) => state.setSelectedParticipantRecords,
  );
  const setStoredSelectedGiftIds = useScheduleMessageFlowStore(
    (state) => state.setSelectedGiftIds,
  );
  const setStoredSelectedGiftProductsById = useScheduleMessageFlowStore(
    (state) => state.setSelectedGiftProductsById,
  );
  const setStoredCustomContactRecordItems = useScheduleMessageFlowStore(
    (state) => state.setCustomContactRecordItems,
  );
  const resetFlowSelection = useScheduleMessageFlowStore(
    (state) => state.resetFlowSelection,
  );
  const flowSelection = useMemo(
    () =>
      normalizeScheduleMessageFlowSelection(
        flowSelectionsByKey[flowSelectionKey],
      ),
    [flowSelectionKey, flowSelectionsByKey],
  );
  const [activeTab, setActiveTab] = useState<ScheduleStatus>("Upcoming");
  const [query, setQuery] = useState("");
  const [recordSearchValue, setRecordSearchValue] = useState("");
  const [eventTypeSearchValue, setEventTypeSearchValue] = useState("");
  const [debouncedEventTypeSearchValue, setDebouncedEventTypeSearchValue] =
    useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addContactReturnStep, setAddContactReturnStep] =
    useState<"record" | "review-records">("record");
  const [addContactForm, setAddContactForm] = useState<AddColleagueFormValues>(
    EMPTY_ADD_SCHEDULE_CONTACT_FORM,
  );
  const selectedEventTypeId = flowSelection.selectedEventTypeId;
  const selectedEventId = flowSelection.selectedEventId;
  const selectedRecipientParticipantId =
    flowSelection.selectedRecipientParticipantId;
  const selectedRecipientParticipantIds =
    flowSelection.selectedRecipientParticipantIds;
  const selectedParticipantIds = flowSelection.selectedParticipantIds;
  const selectedParticipantRecords = flowSelection.selectedParticipantRecords;
  const selectedOnedaBusinessIds = flowSelection.selectedOnedaBusinessIds;
  const selectedOnedaContactIds = flowSelection.selectedOnedaContactIds;
  const selectedGiftIds = flowSelection.selectedGiftIds;
  const selectedGiftProductsById = flowSelection.selectedGiftProductsById;
  const customContactRecordItems = flowSelection.customContactRecordItems;
  const form = flowSelection.form;
  const setSelectedEventTypeId = (value: string) =>
    setScheduleDraftFields(flowSelectionKey, { selectedEventTypeId: value });
  const setSelectedEventId = (value: string) =>
    setScheduleDraftFields(flowSelectionKey, { selectedEventId: value });
  const setSelectedRecipientParticipantId = (value: string) =>
    setScheduleDraftFields(flowSelectionKey, {
      selectedRecipientParticipantId: value,
    });
  const setSelectedRecipientParticipantIds = (values: string[]) =>
    setScheduleDraftFields(flowSelectionKey, {
      selectedRecipientParticipantIds: values,
    });
  const setSelectedParticipantIds = (
    next: string[] | ((current: string[]) => string[]),
  ) =>
    setStoredSelectedParticipantIds(
      flowSelectionKey,
      typeof next === "function" ? next(selectedParticipantIds) : next,
    );
  const setSelectedParticipantRecords = (
    next:
      | SearchableRecordItem[]
      | ((current: SearchableRecordItem[]) => SearchableRecordItem[]),
  ) =>
    setStoredSelectedParticipantRecords(
      flowSelectionKey,
      typeof next === "function" ? next(selectedParticipantRecords) : next,
    );
  const setSelectedOnedaBusinessIds = (ids: string[]) =>
    setScheduleDraftFields(flowSelectionKey, { selectedOnedaBusinessIds: ids });
  const setSelectedOnedaContactIds = (ids: string[]) =>
    setScheduleDraftFields(flowSelectionKey, { selectedOnedaContactIds: ids });
  const setSelectedGiftIds = (next: string[] | ((current: string[]) => string[])) =>
    setStoredSelectedGiftIds(
      flowSelectionKey,
      typeof next === "function" ? next(selectedGiftIds) : next,
    );
  const setSelectedGiftProductsById = (
    next:
      | Record<string, MarketplaceProduct>
      | ((
          current: Record<string, MarketplaceProduct>,
        ) => Record<string, MarketplaceProduct>),
  ) => {
    setStoredSelectedGiftProductsById(
      flowSelectionKey,
      typeof next === "function" ? next(selectedGiftProductsById) : next,
    );
  };
  const setCustomContactRecordItems = (
    next:
      | SearchableRecordItem[]
      | ((current: SearchableRecordItem[]) => SearchableRecordItem[]),
  ) => {
    setStoredCustomContactRecordItems(
      flowSelectionKey,
      typeof next === "function" ? next(customContactRecordItems) : next,
    );
  };
  const setForm = (
    next:
      | ScheduleMessageFlowForm
      | ((current: ScheduleMessageFlowForm) => ScheduleMessageFlowForm),
  ) => {
    setScheduleDraftFields(flowSelectionKey, {
      form: typeof next === "function" ? next(form) : next,
    });
  };
  const [pendingDeleteRow, setPendingDeleteRow] =
    useState<ScheduledEventMessageRecord | null>(null);
  const [isSubmitConfirmationOpen, setIsSubmitConfirmationOpen] =
    useState(false);
  const [scheduleSetupSaveMode, setScheduleSetupSaveMode] = useState<
    "save" | "draft" | null
  >(null);
  const [isDiscardConfirmationOpen, setIsDiscardConfirmationOpen] =
    useState(false);
  const [isScheduleTimePopoverOpen, setIsScheduleTimePopoverOpen] =
    useState(false);
  const hydratedMessageIdRef = useRef<string | null>(null);
  const [scheduleMetricsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const isFlowOpen = Boolean(currentStep);
  const isEditing = Boolean(editingMessageId);
  const isViewing = searchParams.get("view") === "true";
  const hasStoredFlowSelection = Boolean(flowSelectionsByKey[flowSelectionKey]);
  const isInlineGiftSelectionStep =
    isFlowOpen && currentStep === "gift-selection";
  const greetingName = authUser?.firstName?.trim() || "there";
  const onedaAccountId =
    authUser?.profile?.accountId?._id?.trim() ||
    authUser?.hostAccountId?.trim() ||
    null;

  const {
    data: messagesResponse,
    isLoading: isMessagesLoading,
    isFetching: isMessagesFetching,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useScheduledEventMessagesQuery(
    {
      page: currentPage,
      per_page: PAGE_SIZE,
      searchQuery: query,
      eventTiming: getScheduleEventTiming(activeTab),
    },
    {
      enabled: !isFlowOpen,
    },
  );
  const { data: scheduleMetricsData } =
    useScheduledEventMessageMetricsQuery(!isFlowOpen);
  const { data: editingMessageResponse } = useScheduledEventMessageQuery(
    editingMessageId,
    {
      enabled:
        isFlowOpen &&
        Boolean(editingMessageId) &&
        (!hasStoredFlowSelection || isViewing),
    },
  );
  const scheduleMetrics = useMemo<ScheduleMetric[]>(
    () => [
      {
        value: formatScheduleMetricValue(
          scheduleMetricsData?.totalEvents.value ?? 0,
        ),
        label: "Total Events",
        hint: `${(scheduleMetricsData?.totalEvents.percentageChangeThisMonth ?? 0) >= 0 ? "+" : ""}${scheduleMetricsData?.totalEvents.percentageChangeThisMonth ?? 0}% this month`,
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
        value: formatScheduleMetricValue(
          scheduleMetricsData?.totalRecipients.value ?? 0,
        ),
        label: "Total Recipients",
        icon: <UsersIcon className="size-5 text-[#E9A300]" strokeWidth={1.8} />,
        iconBg: "#FFF1DD",
      },
      {
        value: formatScheduleMetricValue(
          scheduleMetricsData?.totalEventsThisMonth.value ?? 0,
        ),
        label: "Total Events this month",
        hint: `+${scheduleMetricsData?.totalEventsThisMonth.newThisWeek ?? 0} new this week`,
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
        value: formatScheduleMetricCurrency(
          scheduleMetricsData?.amountSpent.value ?? 0,
        ),
        label: "Amount Spent",
        hint: `${(scheduleMetricsData?.amountSpent.percentageChangeThisMonth ?? 0) >= 0 ? "+" : ""}${scheduleMetricsData?.amountSpent.percentageChangeThisMonth ?? 0}% this month`,
        hintColor: "#FF6E6E",
        icon: (
          <TrendingUpIcon className="size-5 text-[#FF6E6E]" strokeWidth={1.8} />
        ),
        iconBg: "#FDE0DE",
      },
    ],
    [scheduleMetricsData],
  );
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
      enabled: isFlowOpen && currentStep === "event",
    },
  );
  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
    isFetching: isContactsFetching,
    isError: isContactsError,
    refetch: refetchContacts,
  } = useContactsQuery(
    {
      page: 1,
      per_page: 25,
      searchQuery: recordSearchValue,
    },
    {
      enabled: isFlowOpen && currentStep === "record",
    },
  );
  const {
    data: onedaBusinesses = [],
    isLoading: isOnedaBusinessesLoading,
    isFetching: isOnedaBusinessesFetching,
    isError: isOnedaBusinessesError,
    refetch: refetchOnedaBusinesses,
  } = useExternalBusinessesQuery(onedaAccountId, authToken, {
    enabled:
      isFlowOpen &&
      currentStep === "oneda-business" &&
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
    recordSearchValue,
    {
      enabled:
        isFlowOpen &&
        currentStep === "oneda-contact" &&
        Boolean(selectedOnedaBusinessId),
    },
  );
  const createEventTypeMutation = useCreateEventTypeMutation();
  const updateEventTypeMutation = useUpdateEventTypeMutation();
  const deleteEventTypeMutation = useDeleteEventTypeMutation();
  const createContactMutation = useCreateContactMutation();
  const createBulkContactsMutation = useCreateBulkContactsMutation();
  const setupScheduledEventMessageMutation =
    useSetupScheduledEventMessageMutation();
  const updateScheduledEventMessageSetupMutation =
    useUpdateScheduledEventMessageSetupMutation();
  const deleteMessageMutation = useDeleteScheduledEventMessageMutation();
  const completeSetupMutation = useCompleteScheduledEventMessageSetupMutation();
  const {
    data: caughtMyEyeGiftIdsResponse,
  } = useContactGiftCartParticipantGiftIdsQuery({
    enabled: isFlowOpen && currentStep === "gift-selection",
  });

  const messageRows = messagesResponse?.data.data ?? [];
  const totalPages = Math.max(1, messagesResponse?.data.totalPages ?? 1);
  const today = useMemo(() => getStartOfToday(), []);
  const scheduledDate = useMemo(
    () => getDateFromDateTimeLocalValue(form.scheduledAt),
    [form.scheduledAt],
  );
  const scheduledTime = useMemo(
    () => getTimeFromDateTimeLocalValue(form.scheduledAt),
    [form.scheduledAt],
  );
  const eventTypeOptions = useMemo<OverlaySelectOption[]>(
    () =>
      (availableEventTypesResponse?.data.data ?? []).map((eventType) => ({
        value: eventType.id,
        label: eventType.name,
        icon: getEventTypeIcon(eventType.key ?? null),
        isManageable: Boolean(eventType.user_id ?? eventType.createdById),
      })),
    [availableEventTypesResponse?.data.data],
  );
  const selectedEventTypeOption = useMemo(
    () =>
      eventTypeOptions.find((option) => option.value === selectedEventTypeId) ??
      null,
    [eventTypeOptions, selectedEventTypeId],
  );
  const contactRecordOptions = useMemo<SearchableRecordItem[]>(
    () => (contactsResponse?.data.data ?? []).map(mapContactToRecordItem),
    [contactsResponse?.data.data],
  );
  const allContactRecordOptions = useMemo(
    () => mergeRecordItems(contactRecordOptions, customContactRecordItems),
    [contactRecordOptions, customContactRecordItems],
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
  const onedaProfileOptions = useMemo<SearchableRecordItem[]>(
    () => onedaProfiles.map((profile) => mapOnedaProfileToRecordItem(profile)),
    [onedaProfiles],
  );
  const caughtMyEyeGiftIds = useMemo(
    () =>
      caughtMyEyeGiftIdsResponse?.data.participantGiftIds?.filter(Boolean) ?? [],
    [caughtMyEyeGiftIdsResponse?.data.participantGiftIds],
  );
  const prioritizedGiftIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...selectedGiftIds,
          ...caughtMyEyeGiftIds,
        ].filter(Boolean)),
      ),
    [caughtMyEyeGiftIds, selectedGiftIds],
  );
  const selectedParticipantReviewItems = useMemo(
    () =>
      selectedParticipantRecords.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email || item.subtitle || "",
      })),
    [selectedParticipantRecords],
  );
  const composeRecipientEmails = useMemo(
    () =>
      selectedParticipantReviewItems
        .map((item) => item.email?.trim())
        .filter((email): email is string => Boolean(email)),
    [selectedParticipantReviewItems],
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedEventTypeSearchValue(eventTypeSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [eventTypeSearchValue]);

  useEffect(() => {
    setSelectedIds((current) => {
      const next = current.filter((id) =>
        messageRows.some((row) => row.id === id),
      );

      if (
        next.length === current.length &&
        next.every((id, index) => id === current[index])
      ) {
        return current;
      }

      return next;
    });
  }, [messageRows]);

  useEffect(() => {
    if (!currentStep) {
      return;
    }

    setScheduleDraftFields(flowSelectionKey, {
      lastVisitedStep: currentStep,
    });
  }, [currentStep, flowSelectionKey, setScheduleDraftFields]);

  useEffect(() => {
    const record = editingMessageResponse?.data;

    if (!record || !isEditing) return;

    const hydrationKey = `${flowSelectionKey}:${record.id}`;

    if (hydratedMessageIdRef.current === hydrationKey) {
      return;
    }

    hydratedMessageIdRef.current = hydrationKey;

    const recordParticipant = getScheduledMessageParticipant(record);
    const hydratedParticipantRecords =
      mapScheduledMessageParticipantsToRecordItems(record);
    const hydratedParticipantIds = hydratedParticipantRecords
      .map((item) => item.id)
      .filter(Boolean);
    const hydratedRecipientParticipantIds =
      record.participants
        ?.map((participant) => participant.id?.trim())
        .filter((participantId): participantId is string =>
          Boolean(participantId),
        ) ?? [];
    const primaryParticipantId = hydratedRecipientParticipantIds[0] ?? "";

    setSelectedEventId(record.eventId);
    setSelectedEventTypeId(record.event.eventTypeId);
    setSelectedRecipientParticipantId(
      primaryParticipantId || recordParticipant?.id || record.participantId || "",
    );

    if (hydratedParticipantRecords.length) {
      setSelectedParticipantIds(hydratedParticipantIds);
      setSelectedParticipantRecords(hydratedParticipantRecords);
      setSelectedRecipientParticipantIds(
        hydratedRecipientParticipantIds.length
          ? hydratedRecipientParticipantIds
          : primaryParticipantId
            ? [primaryParticipantId]
            : [],
      );
      setCustomContactRecordItems((current) =>
        mergeRecordItems(current, hydratedParticipantRecords),
      );
    }

    const eventDateValue = toDateOnlyValue(record.event.eventDate);
    const existingScheduledTime = getTimeFromDateTimeLocalValue(
      toDateTimeLocalValue(record.scheduledAt),
    );
    const scheduledAtValue = eventDateValue
      ? mergeDateAndTimeToDateTimeLocalValue(
          new Date(`${eventDateValue}T00:00:00`),
          existingScheduledTime || DEFAULT_SCHEDULE_TIME,
        )
      : toDateTimeLocalValue(record.scheduledAt);

    // Do not clear a locally selected recipient just because the draft
    // has not been linked to a participant yet. The selection is persisted
    // before entering the review step.
    setForm({
      subject: record.subject || record.event.title || "",
      message: record.message ?? "",
      giftUrl: record.giftUrl ?? "",
      giftUrlExpiresAt: toDateTimeLocalValue(record.giftUrlExpiresAt),
      scheduledAt: scheduledAtValue,
      eventName: record.event.title ?? "",
      eventDate: eventDateValue,
    });
  }, [editingMessageResponse?.data, flowSelectionKey, isEditing]);

  useEffect(() => {
    if (routeEventId && routeEventId !== selectedEventId) {
      setSelectedEventId(routeEventId);
    }
  }, [routeEventId, selectedEventId]);

  const updateRoute = (
    step: ScheduleMessageFlowStep,
    nextParams?: Record<string, string | null | undefined>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", mode);
    params.delete("selectedContactId");
    params.delete("selectedContactName");
    params.delete("selectedContactEmail");

    const defaultParams: Record<string, string | undefined> = {
      eventId: selectedEventId || routeEventId || undefined,
      scheduleEventMessageId: editingMessageId ?? undefined,
    };

    Object.entries(defaultParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    Object.entries(nextParams ?? {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/dashboard/schedule/flow/${step}?${params.toString()}`);
  };

  const resetAndCloseFlow = () => {
    resetFlowSelection(flowSelectionKey);
    router.push("/dashboard/schedule");
  };

  const closeFlow = () => {
    if (!isFlowOpen || currentStep === "success") {
      resetAndCloseFlow();
      return;
    }

    setIsDiscardConfirmationOpen(true);
  };

  const startFlow = (nextMode: "message" | "schedule") => {
    resetFlowSelection(
      buildScheduleMessageFlowSelectionKey(nextMode, null, null),
    );
    router.push(`/dashboard/schedule/flow/event?mode=${nextMode}`);
  };

  const handleCreateEventOption = async (name: string) => {
    const response = await createEventTypeMutation.mutateAsync({ name });
    toast.success(response.message);

    return {
      value: response.data?.id ?? "",
      label: response.data?.name ?? name,
      icon: getEventTypeIcon(response.data?.key ?? null),
      isManageable: Boolean(
        response.data?.user_id ?? response.data?.createdById,
      ),
    } satisfies OverlaySelectOption;
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

  const handleOpenOnedaBusinessStep = () => {
    if (!authToken || !onedaAccountId) {
      toast.error("Your Oneda business details are not available right now.");
      return;
    }

    updateRoute("oneda-business");
  };

  const handleSelectedOnedaBusinessIdsChange = (ids: string[]) => {
    const selectedId = ids.at(-1)?.trim() ?? "";
    const selectedBusiness = onedaBusinessOptions.find(
      (business) => business.id === selectedId,
    );

    setSelectedOnedaBusinessIds(selectedBusiness ? [selectedBusiness.id] : []);
    setSelectedOnedaContactIds([]);
    setSelectedParticipantIds([]);
    setSelectedParticipantRecords([]);
    setSelectedRecipientParticipantId("");
    setSelectedRecipientParticipantIds([]);
  };

  const handleOnedaBusinessNext = () => {
    if (!selectedOnedaBusinessId) {
      toast.error("Please select a business.");
      return;
    }

    updateRoute("oneda-contact");
  };

  const handleOpenAddContact = (returnStep: "record" | "review-records") => {
    setAddContactReturnStep(returnStep);
    setAddContactForm(EMPTY_ADD_SCHEDULE_CONTACT_FORM);
    updateRoute("add-record");
  };

  const handleCreateScheduleContact = async () => {
    const gender = addContactForm.gender;
    const firstName = addContactForm.firstName.trim();
    const lastName = addContactForm.lastName.trim();
    const phoneNumber = addContactForm.phoneNumber.trim();
    const email = addContactForm.email.trim();
    const ageRange = addContactForm.ageRange?.trim() || undefined;

    if (!gender || !firstName || !lastName || !email) {
      toast.error("Please complete the contact details.");
      return;
    }

    try {
      const response = await createContactMutation.mutateAsync({
        gender,
        ageRange,
        firstName,
        lastName,
        phoneNumber,
        email,
      });

      const createdRecord = mapContactToRecordItem(response.data);

      setCustomContactRecordItems((current) =>
        mergeRecordItems(
          current.filter((item) => item.id !== createdRecord.id),
          [createdRecord],
        ),
      );
      setSelectedParticipantIds((current) =>
        current.includes(createdRecord.id)
          ? current
          : [...current, createdRecord.id],
      );
      setSelectedParticipantRecords((current) =>
        current.some((item) => item.id === createdRecord.id)
          ? current
          : [...current, createdRecord],
      );
      setSelectedRecipientParticipantId("");
      setAddContactForm(EMPTY_ADD_SCHEDULE_CONTACT_FORM);
      updateRoute(addContactReturnStep);
      toast.success(response.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create contact right now.",
      );
    }
  };

  const handleRecordNext = async () => {
    if (!selectedParticipantIds.length || !selectedParticipantRecords.length) {
      toast.error("Please select at least one recipient.");
      return;
    }

    updateRoute("review-records");
  };

  const handleOnedaContactNext = async () => {
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
      const importedRecords = response.data.map(mapContactToRecordItem);

      if (!importedRecords.length) {
        toast.error("The selected contact could not be imported.");
        return;
      }

      const mergedRecords = mergeRecordItems(
        selectedParticipantRecords,
        importedRecords,
      );
      const mergedIds = Array.from(
        new Set([
          ...selectedParticipantIds,
          ...importedRecords.map((record) => record.id),
        ]),
      );

      setCustomContactRecordItems((current) =>
        mergeRecordItems(current, importedRecords),
      );
      setSelectedParticipantIds(mergedIds);
      setSelectedParticipantRecords(mergedRecords);
      setSelectedRecipientParticipantId("");
      setSelectedRecipientParticipantIds([]);
      setRecordSearchValue("");
      setSelectedOnedaContactIds([]);

      toast.success(response.message);
      updateRoute("record");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to import business contacts right now.",
      );
    }
  };

  const handleReviewRecordsNext = async () => {
    if (!selectedParticipantIds.length || !selectedParticipantRecords.length) {
      toast.error("Please select at least one recipient.");
      return;
    }

    updateRoute("compose");
  };

  const handleEventTypeNext = () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event type.");
      return;
    }

    const eventTitle = form.eventName || selectedEventTypeOption.label;

    setForm((current) => ({
      ...current,
      eventName: current.eventName || eventTitle,
      subject: current.subject || eventTitle,
    }));
    updateRoute("event-date");
  };

  const handleEditRow = (row: ScheduledEventMessageRecord) => {
    setPendingDeleteRow(null);

    if (isScheduledEventCompleted(row)) {
      handleViewRow(row);
      return;
    }

    const nextMode = row.scheduledAt ? "schedule" : "message";
    const params = new URLSearchParams({
      mode: nextMode,
      scheduleEventMessageId: row.id,
      eventId: row.eventId,
    });

    router.push(`/dashboard/schedule/flow/event?${params.toString()}`);
  };

  const handleViewRow = (row: ScheduledEventMessageRecord) => {
    setPendingDeleteRow(null);
    router.push(`/dashboard/schedule/${row.id}`);
  };

  const allChecked =
    messageRows.length > 0 &&
    messageRows.every((row) => selectedIds.includes(row.id));

  const toggleAll = () => {
    setSelectedIds(allChecked ? [] : messageRows.map((row) => row.id));
  };

  const toggleRow = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const handleSubmit = async (completeSetup = true) => {
    try {
      const payload = buildScheduledEventSetupPayload();

      if (!payload) {
        return;
      }
      const initialResponse = editingMessageId
        ? await updateScheduledEventMessageSetupMutation.mutateAsync({
            id: editingMessageId,
            payload,
          })
        : await setupScheduledEventMessageMutation.mutateAsync(payload);

      const finalizedPayload =
        !editingMessageId && !payload.giftUrl
          ? buildScheduledEventSetupPayload(initialResponse.data.eventId)
          : null;

      const response = finalizedPayload
        ? await updateScheduledEventMessageSetupMutation.mutateAsync({
            id: initialResponse.data.id,
            payload: finalizedPayload,
          })
        : initialResponse;

      setSelectedEventId(response.data.eventId);

      const nextFlowKey = buildScheduleMessageFlowSelectionKey(
        mode,
        response.data.id,
        response.data.eventId,
      );

      if (flowSelectionKey !== nextFlowKey) {
        resetFlowSelection(flowSelectionKey);
      }

      if (completeSetup) {
        await completeSetupMutation.mutateAsync(response.data.eventId);
      }

      if (completeSetup) {
        toast.success(
          mode === "message"
            ? "Message sent successfully."
            : "Message scheduled successfully.",
        );
        setScheduleSetupSaveMode(null);
        setIsSubmitConfirmationOpen(false);
        updateRoute("success", {
          eventId: response.data.eventId,
          scheduleEventMessageId: response.data.id,
        });
        return;
      }

      toast.success("Message event saved as draft.");
      setScheduleSetupSaveMode(null);
      setIsSubmitConfirmationOpen(false);
      resetAndCloseFlow();
    } catch (error) {
      setScheduleSetupSaveMode(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this message event right now.",
      );
    }
  };

  const handleDeleteRow = async () => {
    if (!pendingDeleteRow) return;

    if (isScheduledEventCompleted(pendingDeleteRow)) {
      toast.error("Completed message events cannot be deleted.");
      setPendingDeleteRow(null);
      return;
    }

    try {
      const response = await deleteMessageMutation.mutateAsync(
        pendingDeleteRow.id,
      );
      toast.success(response.message || "Message deleted successfully.");
      setPendingDeleteRow(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this message right now.",
      );
    }
  };

  const tableData: TableData<ScheduledEventMessageRecord> = {
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
            aria-label={`Select ${getScheduledMessageRecipientName(row)}`}
          />
        ),
      },
      {
        id: "recipient",
        header: "Recipients",
        headerClassName: "min-w-[170px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <RecipientCell row={row} />,
      },
      {
        id: "scheduledDate",
        header: "Scheduled Date",
        accessor: (row) =>
          formatDate(row.scheduledAt ?? row.sentAt ?? row.createdAt),
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "subject",
        header: "Subject",
        accessor: "subject",
        headerClassName: "min-w-[170px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
      },
      {
        id: "message_status",
        header: "Message Status",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row.status} />,
      },
      {
        id: "Status",
        header: "Status",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <StatusPill status={row?.event?.status as string} />,
      },
      {
        id: "actions",
        header: null,
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => (
          <ScheduleRowActions
            row={row}
            onView={handleViewRow}
            onEdit={handleEditRow}
            onDelete={setPendingDeleteRow}
          />
        ),
      },
    ],
    rows: messageRows,
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

  const eventStep = (
    <div className="space-y-7">
      <div>
        <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
          Ok... Let&apos;s get started!
        </p>
        <p className="mt-2 text-[20px] font-normal text-[#434343]">
          What&apos;s the name of your event?
        </p>
      </div>

      {isAvailableEventTypesLoading ? (
        <p className="py-8 text-center text-sm text-[#7D7D7D]">
          Loading events...
        </p>
      ) : (
        <OverlaySelect
          value={selectedEventTypeId}
          onValueChange={setSelectedEventTypeId}
          options={eventTypeOptions}
          placeholder="Select Event"
          panelTitle="Select an Event"
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
        onBack={closeFlow}
        onNext={handleEventTypeNext}
        nextDisabled={!selectedEventTypeId}
        showBack={false}
        inlineActions
        stackSaveAndContinue={false}
      />
    </div>
  );

  const handleEventDateNext = () => {
    if (!form.eventDate) {
      toast.error("Please choose the event date.");
      return;
    }

    setForm((current) => ({
      ...current,
      scheduledAt: mergeDateAndTimeToDateTimeLocalValue(
        new Date(`${current.eventDate}T00:00:00`),
        getTimeFromDateTimeLocalValue(current.scheduledAt) ||
          DEFAULT_SCHEDULE_TIME,
      ),
    }));
    updateRoute("source");
  };

  const eventDateStep = (
    <EventDateStep
      eventName={form.eventName || selectedEventTypeOption?.label || "Event"}
      value={form.eventDate}
      onChange={(value) => {
        setForm((current) => ({
          ...current,
          eventDate: value,
          scheduledAt: value
            ? mergeDateAndTimeToDateTimeLocalValue(
                new Date(`${value}T00:00:00`),
                getTimeFromDateTimeLocalValue(current.scheduledAt) ||
                  DEFAULT_SCHEDULE_TIME,
              )
            : current.scheduledAt,
        }));

        if (selectedEventId || editingMessageId) {
          updateRoute("source");
        }
      }}
      onBack={() => updateRoute("event")}
      onNext={handleEventDateNext}
      heading="What's the date?"
      headingAlign="left"
      showGoToEventNameLink={false}
    />
  );

  const sourceStep = (
    <div className="space-y-12 pt-2">
      <div className="text-center">
        <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
          Who would you like to message?
        </p>
        <p className="mt-2 text-[20px] font-normal text-[#434343]">
          Choose where your recipients should come from.
        </p>
      </div>

        <div className="mx-auto max-w-[494px] space-y-4">
          <ModalButton
            variant="secondary"
            onClick={() => updateRoute("record")}
            className="w-full"
          >
            From Record
          </ModalButton>
          <ModalButton onClick={handleOpenOnedaBusinessStep} className="w-full">
            Import from Oneda
          </ModalButton>
        </div>

      <div className="flex justify-center">
        <BackButton
          onClick={() => updateRoute("event-date")}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />
      </div>
    </div>
  );

  const recordStep = (
    <div className="space-y-8 pt-2">
      <div className="text-center">
        <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
          Who would you like to message?
        </p>
      </div>

        <div className="mx-auto max-w-[494px]">
          <OverlayRecordPicker
            items={allContactRecordOptions}
            selectedIds={selectedParticipantIds}
            onSelectedIdsChange={(ids) => {
              if (!ids.length) {
                setSelectedParticipantIds([]);
                setSelectedParticipantRecords([]);
                setSelectedRecipientParticipantId("");
                return;
              }

              const selectedRecords = ids
                .map((id) => allContactRecordOptions.find((item) => item.id === id))
                .filter((item): item is SearchableRecordItem => Boolean(item));

              if (!selectedRecords.length) {
                setSelectedParticipantIds([]);
                setSelectedParticipantRecords([]);
                setSelectedRecipientParticipantId("");
                toast.error("Unable to resolve the selected contacts.");
                return;
              }

              setSelectedParticipantIds(ids);
              setSelectedParticipantRecords(selectedRecords);
              setSelectedRecipientParticipantId("");
            }}
            placeholder="Search for colleague"
            panelTitle="Search for colleague"
            searchPlaceholder=""
            searchValue={recordSearchValue}
            onSearchValueChange={setRecordSearchValue}
          disableLocalFiltering
          isLoading={isContactsLoading || isContactsFetching}
            emptyStateText={
              isContactsError ? "Unable to load contacts." : "No colleague found."
            }
            triggerBottomAction={
              <BackButton
              onClick={() => updateRoute("source")}
                className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
            }
            footer={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={() => updateRoute("source")}
                className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
              <ModalButton
                onClick={handleRecordNext}
                disabled={
                  !selectedParticipantIds.length ||
                  !selectedParticipantRecords.length
                }
              >
                Next
              </ModalButton>
            </div>
            }
            addActionLabel="Add New"
            onAddAction={() => handleOpenAddContact("record")}
            triggerClassName="h-[48px] border-[#3300C9] text-[18px] font-medium text-[#666666]"
          />
        </div>

      {isContactsError ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => void refetchContacts()}
            className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry loading contacts
          </button>
        </div>
      ) : null}
    </div>
  );

  const addRecordStep = (
    <AddColleagueForm
      values={addContactForm}
      onChange={(field, value) =>
        setAddContactForm((current) => ({
          ...current,
          [field]: value,
        }))
      }
      onBack={() => updateRoute(addContactReturnStep)}
      onSave={() => void handleCreateScheduleContact()}
      saveDisabled={
        createContactMutation.isPending ||
        !addContactForm.gender ||
        !addContactForm.firstName.trim() ||
        !addContactForm.lastName.trim() ||
        !addContactForm.email.trim()
      }
      isSaving={createContactMutation.isPending}
      saveLabel="Save"
      savingLabel="Saving"
    />
  );

  const reviewRecordsStep = (
    <CustomColleagueReview
      greetingName="there"
      prompt="Review the people you want to message."
      items={selectedParticipantReviewItems}
      onAddNew={() => updateRoute("record")}
      onBack={() => updateRoute("record")}
      onNext={handleReviewRecordsNext}
      onDelete={(id) => {
        setSelectedParticipantIds((current) =>
          current.filter((participantId) => participantId !== id),
        );
        setSelectedParticipantRecords((current) =>
          current.filter((participant) => participant.id !== id),
        );
        setSelectedRecipientParticipantIds(
          selectedRecipientParticipantIds.filter(
            (participantId) => participantId !== id,
          ),
        );
        setSelectedRecipientParticipantId(
          selectedRecipientParticipantId === id
            ? ""
            : selectedRecipientParticipantId,
        );
      }}
      nextLabel="Next"
      nextDisabled={
        !selectedParticipantReviewItems.length
      }
    />
  );

  const onedaBusinessStep = (
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
          isLoading={isOnedaBusinessesLoading || isOnedaBusinessesFetching}
          emptyStateText={
            isOnedaBusinessesError
              ? "Unable to load businesses."
              : "No business found."
          }
          triggerBottomAction={
            <BackButton
              onClick={() => updateRoute("source")}
              className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
              iconClassName="size-[24px]"
            />
          }
          footer={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={() => updateRoute("source")}
                className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
              <ModalButton
                onClick={handleOnedaBusinessNext}
                disabled={!selectedOnedaBusinessId}
              >
                Next
              </ModalButton>
            </div>
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
  );

  const onedaContactStep = (
    <div className="space-y-8 pt-2">
      <div className="text-center">
        <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
          Hey {greetingName},
        </p>
        <p className="mt-2 text-[20px] font-normal text-[#434343]">
          Who would you like to message?
        </p>
      </div>

      <div className="mx-auto max-w-[494px]">
        <OverlayRecordPicker
          items={onedaProfileOptions}
          selectedIds={selectedOnedaContactIds}
          onSelectedIdsChange={(ids) => {
            setSelectedOnedaContactIds(ids);
            setSelectedParticipantIds([]);
            setSelectedParticipantRecords([]);
            setSelectedRecipientParticipantId("");
          }}
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
              onClick={() => updateRoute("oneda-business")}
              className="flex h-[45px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
              iconClassName="size-[24px]"
            />
          }
          footer={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={() => updateRoute("oneda-business")}
                className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
                <ModalButton
                  onClick={handleOnedaContactNext}
                  disabled={
                    !selectedOnedaContactIds.length ||
                    createBulkContactsMutation.isPending
                  }
                >
                  {createBulkContactsMutation.isPending ? "Importing..." : "Import"}
                </ModalButton>
              </div>
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
  );

  const handleScheduledTimeChange = (timeValue: string) => {
    const baseDate = form.eventDate
      ? new Date(`${form.eventDate}T00:00:00`)
      : scheduledDate ?? today;

    setForm((current) => ({
      ...current,
      scheduledAt: mergeDateAndTimeToDateTimeLocalValue(baseDate, timeValue),
    }));
  };

  const handleGiftProductToggle = (
    product: MarketplaceProduct,
    checked: boolean,
  ) => {
    setSelectedGiftProductsById((current) => {
      const next = { ...current };

      if (checked) {
        next[product._id] = product;
      } else {
        delete next[product._id];
      }

      return next;
    });
  };

  const getValidatedSelectedGiftProducts = () => {
    if (!selectedGiftIds.length) {
      return [];
    }

    const selectedProducts = selectedGiftIds
      .map((giftId) => selectedGiftProductsById[giftId])
      .filter((product): product is MarketplaceProduct => Boolean(product));

    if (selectedProducts.length !== selectedGiftIds.length) {
      toast.error(
        "Some selected gifts are not fully loaded yet. Please reselect them before continuing.",
      );
      return null;
    }

    const hasIncompleteGiftDetails = selectedProducts.some(
      (product) =>
        !product.title?.trim() ||
        !Number.isFinite(product.amount) ||
        product.amount <= 0,
    );

    if (hasIncompleteGiftDetails) {
      toast.error(
        "Some selected gifts are not fully loaded yet. Please reselect them before continuing.",
      );
      return null;
    }

    return selectedProducts;
  };

  const buildScheduledEventSetupPayload = (
    resolvedEventId?: string | null,
  ): ScheduledEventMessageSetupPayload | null => {
      const resolvedEventTypeId =
        selectedEventTypeOption?.value || selectedEventTypeId;
      const eventTitle = form.eventName || selectedEventTypeOption?.label || "Event";
      const plainTextMessage = getPlainTextFromHtml(form.message);
      const resolvedParticipantRefs = buildScheduleParticipantClientRefs(
        selectedParticipantRecords,
        selectedParticipantIds,
      );
      const selectedProducts = getValidatedSelectedGiftProducts();
      const finalEventId =
        resolvedEventId?.trim() ||
        selectedEventId?.trim() ||
        routeEventId?.trim() ||
        "";
      const giftRedirectPath = finalEventId
        ? buildScheduledMessageGiftInvitePath(finalEventId)
        : "";
      const giftUrl = giftRedirectPath
        ? buildSignedInInviteUrl(giftRedirectPath)
        : "";

      if (!resolvedEventTypeId) {
        toast.error("Please select an event type.");
        return null;
      }

      if (!form.eventDate) {
        toast.error("Please choose the event date.");
        return null;
      }

      if (!form.subject.trim() || !plainTextMessage) {
        toast.error("Please add a subject and message.");
        return null;
      }

      if (mode === "schedule" && !form.scheduledAt) {
        toast.error("Please choose when this message should be sent.");
        return null;
      }

      if (!resolvedParticipantRefs.length) {
        toast.error("Please select at least one recipient.");
        return null;
      }

      if (selectedProducts === null) {
        return null;
      }

      const recipientRefs = resolvedParticipantRefs.map(
        (participant) => participant.clientRef,
      );

      return {
        event: {
          title: eventTitle,
          description: "",
          eventTypeId: resolvedEventTypeId,
          eventDate: toIsoDateTime(form.eventDate),
        },
        message: {
          subject: form.subject.trim(),
          message: form.message,
          scheduledAt: toIsoDateTime(
            form.scheduledAt ||
              mergeDateAndTimeToDateTimeLocalValue(
                new Date(`${form.eventDate}T00:00:00`),
                DEFAULT_SCHEDULE_TIME,
              ),
          ),
          sendNow: mode === "message",
          ...(giftUrl ? { redirectUrl: giftUrl } : {}),
          metadata: {
            source: "dashboard",
          },
        },
        participants: resolvedParticipantRefs.map((participant) => ({
          ...participant,
          isNotified: true,
        })),
        giftAssignments: selectedProducts.length
          ? [
              {
                recipientRefs,
                gifts: selectedProducts.map(mapMarketplaceProductToGiftPayload),
              },
            ]
          : [],
        ...(giftUrl ? { giftUrl } : {}),
        ...(form.giftUrlExpiresAt
          ? { giftUrlExpiresAt: toIsoDateTime(form.giftUrlExpiresAt) }
          : {}),
      };
    };

  const handleGiftSelectionNext = () => {
    const selectedProducts = getValidatedSelectedGiftProducts();

    if (!selectedProducts) {
      return;
    }

    setIsSubmitConfirmationOpen(true);
  };

  const lockedScheduledDateTimeField = (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-[#434343]">
        Scheduled date
      </span>
      <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
        <div className="flex h-[54px] w-full items-center justify-between rounded-[18px] border border-[#ECE8F7] bg-[#F8F7FC] px-4 text-left text-[15px] font-normal text-[#434343]">
          <span
            className={form.scheduledAt ? "text-[#434343]" : "text-[#666666]"}
          >
            {formatScheduledDatePickerValue(form.scheduledAt)}
          </span>
          <CalendarDaysIcon className="size-5 text-[#8A8794]" />
        </div>

        <Popover
          open={isScheduleTimePopoverOpen}
          onOpenChange={(open) => {
            if (!isViewing) {
              setIsScheduleTimePopoverOpen(open);
            }
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isViewing}
              aria-label="Scheduled time"
              className={cn(
                "flex h-[54px] w-full items-center justify-between rounded-[18px] border border-[#ECE8F7] bg-white px-4 text-left text-[15px] text-[#434343] outline-none transition-colors hover:border-[#3300C9] focus:border-[#3300C9]",
                isViewing &&
                  "cursor-not-allowed bg-[#F8F7FC] text-[#7D7D7D] hover:border-[#ECE8F7] focus:border-[#ECE8F7]",
              )}
            >
              <span>
                {formatScheduleTimeLabel(scheduledTime || DEFAULT_SCHEDULE_TIME)}
              </span>
              <ChevronDownIcon
                className={cn(
                  "size-4 text-[#8A8794] transition-transform",
                  isScheduleTimePopoverOpen && "rotate-180",
                )}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="z-[130] max-h-[280px] w-[var(--radix-popover-trigger-width)] overflow-y-auto rounded-[18px] border border-[#ECE8F7] bg-white p-2 shadow-[0_16px_40px_rgba(29,18,68,0.14)]"
          >
            <div className="grid grid-cols-2 gap-0.5">
              {SCHEDULE_TIME_OPTIONS.map((timeValue) => {
                const isSelected =
                  (scheduledTime || DEFAULT_SCHEDULE_TIME) === timeValue;

                return (
                  <button
                    key={timeValue}
                    type="button"
                    onClick={() => {
                      handleScheduledTimeChange(timeValue);
                      setIsScheduleTimePopoverOpen(false);
                    }}
                    className={cn(
                      "whitespace-nowrap rounded-[10px] border px-2 py-2 text-center text-[12px] font-medium transition-colors sm:text-[13px]",
                      isSelected
                        ? "border-[#3300C9] bg-[#F4F0FF] text-[#3300C9] shadow-[0_4px_12px_rgba(51,0,201,0.08)]"
                        : "border-transparent text-[#434343] hover:border-[#E4DBFF] hover:bg-[#F8F5FF] hover:text-[#3300C9]",
                    )}
                  >
                    {formatScheduleTimeLabel(timeValue)}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  const composeStep = (
    <div className="mx-auto flex max-h-[calc(100dvh-160px)] min-h-0  flex-col overflow-hidden rounded-[28px]  bg-white shadow-[0_20px_60px_rgba(26,19,61,0.08)]">
      <div className="shrink-0 border-b border-[#F0EDF8] px-5 py-5 sm:px-8 sm:py-6">
        <div className="text-center">
          <h2 className="text-[24px] font-semibold text-[#2F2F35]">
            {isViewing ? "View message" : "Write your message"}
          </h2>
          <p className="mt-2 text-sm text-[#7D7D7D]">
            {isViewing
              ? "Review the message details for this scheduled event."
              : "Add the message your recipient will receive."}
          </p>
        </div>
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[13px] font-medium text-[#4B4B55]">
              Recipients
            </span>

            <div className="rounded-[18px] border border-[#ECE8F7] bg-[#FCFBFF] p-3">
              <div className="no-scrollbar flex max-h-[132px] flex-wrap gap-2 overflow-y-auto pr-1">
                {composeRecipientEmails.length ? (
                  composeRecipientEmails.map((email) => (
                    <span
                      key={email}
                      className="inline-flex max-w-full items-center rounded-full bg-[#F0F0F3] px-3 py-1.5 text-[12px] font-medium text-[#8A8892]"
                    >
                      <span className="truncate">{email}</span>
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-[#F0F0F3] px-3 py-1.5 text-[12px] font-medium text-[#8A8892]">
                    No recipients selected yet.
                  </span>
                )}
              </div>
            </div>
          </div>

          <input
            value={form.subject}
            readOnly={isViewing}
            onChange={(event) =>
              setForm((current) => ({ ...current, subject: event.target.value }))
            }
            placeholder="Message title"
            className={cn(
              "h-[54px] w-full rounded-[18px] border border-[#ECE8F7] px-4 text-[15px] outline-none transition-colors focus:border-[#3300C9]",
              isViewing && "cursor-default bg-[#F8F7FC] text-[#434343]",
            )}
          />
          <RichTextComposer
            value={form.message}
            readOnly={isViewing}
            onChange={(message) =>
              setForm((current) => ({ ...current, message }))
            }
            placeholder="Message body"
          />
          {mode === "schedule" ? lockedScheduledDateTimeField : null}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#F0EDF8] px-5 py-4 sm:px-8 sm:py-5">
        <div className="flex items-center justify-center gap-3">
          <BackButton
            onClick={() =>
              isViewing ? closeFlow() : updateRoute("review-records")
            }
            className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          />
          {isViewing ? (
            <ModalButton onClick={closeFlow}>Close</ModalButton>
          ) : (
            <ModalButton
              onClick={() => {
                if (
                  !form.subject.trim() ||
                  !getPlainTextFromHtml(form.message)
                ) {
                  toast.error("Please add a subject and message.");
                  return;
                }

                if (mode === "schedule" && !form.scheduledAt) {
                  toast.error("Please choose when this message should be sent.");
                  return;
                }

                updateRoute("gift-selection");
              }}
              disabled={
                !form.subject.trim() ||
                !getPlainTextFromHtml(form.message) ||
                (mode === "schedule" && !form.scheduledAt)
              }
            >
              Next
            </ModalButton>
          )}
        </div>
      </div>
    </div>
  );

  const giftSelectionStep = (
    <WishlistGiftSelectionStep
      selectedIds={selectedGiftIds}
      onSelectedIdsChange={setSelectedGiftIds}
      onSelectedProductToggle={handleGiftProductToggle}
      onViewProduct={(product) => {
        router.push(
          `/dashboard/gifts/product/${encodeURIComponent(
            product._id,
          )}?backHref=${encodeURIComponent(pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""))}`,
        );
      }}
      caughtMyEyeProductIds={caughtMyEyeGiftIds}
      prioritizedProductIds={prioritizedGiftIds}
      onBack={() => updateRoute("compose")}
      onNext={handleGiftSelectionNext}
      nextLabel={selectedGiftIds.length ? "Next" : "Skip"}
      enableInfiniteScroll
    />
  );

  const successStep = (
    <div className="mx-auto max-w-[520px] space-y-8 py-8 text-center">
      <div>
        <h2 className="text-[26px] font-semibold text-[#2F2F35]">
          {mode === "message" ? "Message sent!" : "Message scheduled!"}
        </h2>
        <p className="mt-3 text-sm text-[#7D7D7D]">
          Your message setup has been completed successfully.
        </p>
      </div>
      <ModalButton onClick={closeFlow} className="mx-auto max-w-[220px]">
        Back to Schedule
      </ModalButton>
    </div>
  );

  return (
    <div className="space-y-6">
      {isInlineGiftSelectionStep ? (
        <div className="mx-auto min-h-[760px] w-full max-w-[1448px] rounded-[24px] border border-[#F1EDF9] bg-white px-4 py-4 shadow-[0_12px_40px_rgba(29,18,68,0.06)] sm:px-6 sm:py-6 lg:h-[calc(100dvh-12rem)] lg:min-h-0 lg:px-8">
          <div className="h-full min-h-0">{giftSelectionStep}</div>
        </div>
      ) : (
        <>
      <PageHeader
        title="Schedule Event & Message"
        description="Schedule events & Message ahead and keep in touch with your loved ones"
        actions={
          <>
            <Button
              type="button"
              onClick={() => startFlow("schedule")}
              className="h-[44px] rounded-full px-4 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-full border border-white/35 bg-white/10">
                  <CalendarDaysIcon className="size-4" />
                </span>
                <span>Schedule Message Event</span>
              </span>
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={() => startFlow("message")}
              className="h-[44px] rounded-full border-[#3300C9] px-4 text-sm font-medium text-[#3300C9] hover:bg-[#F6F2FF]"
            >
              <span className="inline-flex items-center gap-2.5">
                <SendIcon className="size-4" />
                <span>Message</span>
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
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
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
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search names......"
                containerClassName="w-full sm:w-[280px]"
                className="h-10 rounded-[16px] border-[#ECE8F7] bg-white text-sm text-[#434343] shadow-none placeholder:text-[#9A97A5] focus-visible:border-[#D7CEF2] focus-visible:ring-0"
              />

              <button
                type="button"
                aria-label="Filter schedule"
                onClick={() =>
                  toast("Schedule filters will be connected next.")
                }
                className="flex size-10 items-center justify-center rounded-[12px] border border-[#ECE8F7] bg-white text-[#7D7D7D] transition-colors hover:bg-[#F6F2FF] hover:text-[#3300C9]"
              >
                <FilterIcon className="size-4 text-[#434343]" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {isMessagesLoading || isMessagesFetching ? (
          <p className="py-10 text-center text-sm text-[#7D7D7D]">
            Loading scheduled messages...
          </p>
        ) : isMessagesError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-[#7D7D7D]">
              Unable to load scheduled messages.
            </p>
            <button
              type="button"
              onClick={() => void refetchMessages()}
              className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <Table
              data={tableData}
              tableClassName="w-full min-w-[980px] border-separate border-spacing-y-3"
            />
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
        </>
      )}

      <ContentModal
        open={isFlowOpen && !isInlineGiftSelectionStep}
        onClose={closeFlow}
        title={mode === "message" ? "Message" : "Schedule Message Event"}
        showHeader={false}
        closeOnOverlayClick={false}
        bodyScrollable={currentStep === 'compose'}
        dialogClassName="max-w-[536px] rounded-[18px] bg-white sm:rounded-[20px]"
        bodyClassName={`${currentStep === 'compose' && ' px-0 py-0 sm:px-0 md:px-0'}`}
      >
        {currentStep === "event"
          ? eventStep
          : currentStep === "event-date"
            ? eventDateStep
            : currentStep === "source"
              ? sourceStep
              : currentStep === "oneda-business"
                ? onedaBusinessStep
          : currentStep === "oneda-contact"
              ? onedaContactStep
              : currentStep === "record"
                ? recordStep
                : currentStep === "add-record"
                  ? addRecordStep
                  : currentStep === "review-records"
                    ? reviewRecordsStep
                    : currentStep === "compose"
                        ? composeStep
                        : currentStep === "success"
                          ? successStep
                          : null}
      </ContentModal>

      <ConfirmationModal
        open={isSubmitConfirmationOpen}
        onClose={() => {
          setIsSubmitConfirmationOpen(false);
          setScheduleSetupSaveMode(null);
        }}
        onConfirm={() => {
          setScheduleSetupSaveMode("save");
          void handleSubmit(true);
        }}
        onSecondaryConfirm={() => {
          setScheduleSetupSaveMode("draft");
          void handleSubmit(false);
        }}
        action="save"
        title="Save Message Setup"
        description="Save this setup as a draft, or save and complete it."
        confirmText="Save"
        secondaryConfirmText="Save as Draft"
        isLoading={
          scheduleSetupSaveMode === "save" &&
          setupScheduledEventMessageMutation.isPending ||
          scheduleSetupSaveMode === "save" &&
            updateScheduledEventMessageSetupMutation.isPending ||
          scheduleSetupSaveMode === "save" &&
            completeSetupMutation.isPending
        }
        isSecondaryLoading={
          scheduleSetupSaveMode === "draft" &&
          setupScheduledEventMessageMutation.isPending ||
          scheduleSetupSaveMode === "draft" &&
            updateScheduledEventMessageSetupMutation.isPending
        }
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={Boolean(pendingDeleteRow)}
        onClose={() => setPendingDeleteRow(null)}
        onConfirm={handleDeleteRow}
        action="delete"
        title="Delete Message"
        description="Are you sure you want to delete this scheduled message?"
        confirmText="Delete"
        isLoading={deleteMessageMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isDiscardConfirmationOpen}
        onClose={() => setIsDiscardConfirmationOpen(false)}
        onConfirm={() => {
          setIsDiscardConfirmationOpen(false);
          resetAndCloseFlow();
        }}
        action="discard"
        title="Discard setup?"
        description="If you close this flow now, your current schedule setup changes will be lost."
        confirmText="Discard"
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

    </div>
  );
}

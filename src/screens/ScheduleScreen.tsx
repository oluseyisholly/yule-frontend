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
  MailIcon,
  MoreHorizontal,
  SendIcon,
  Settings2Icon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Checkbox from "@/components/Checkbox";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import CustomColleagueReview from "@/components/CustomColleagueReview";
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
import { useCreateBulkContactsMutation } from "@/features/contacts/hooks/useCreateBulkContactsMutation";
import { useContactsQuery } from "@/features/contacts/hooks/useContactsQuery";
import type { Contact } from "@/features/contacts/types";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import type { ParticipatedEventParticipant } from "@/features/events/types";
import { useAssignBulkGiftsMutation } from "@/features/gifts/hooks/useAssignBulkGiftsMutation";
import type { CreateBulkGiftItemPayload } from "@/features/gifts/types";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useCompleteScheduledEventMessageSetupMutation } from "@/features/scheduled-event-messages/hooks/useCompleteScheduledEventMessageSetupMutation";
import { useCreateScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useCreateScheduledEventMessageMutation";
import { useDeleteScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useDeleteScheduledEventMessageMutation";
import { useScheduledEventMessageQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessageQuery";
import { useScheduledEventMessagesQuery } from "@/features/scheduled-event-messages/hooks/useScheduledEventMessagesQuery";
import { useUpdateScheduledEventMessageMutation } from "@/features/scheduled-event-messages/hooks/useUpdateScheduledEventMessageMutation";
import type {
  ScheduledEventMessagePayload,
  ScheduledEventMessageRecord,
} from "@/features/scheduled-event-messages/types";
import { useCreateParticipantsBulkMutation } from "@/features/participants/hooks/useCreateParticipantsBulkMutation";
import type { EventParticipant } from "@/features/participants/types";
import { cn } from "@/lib/utils";
import {
  isScheduleMessageFlowStep,
  type ScheduleMessageFlowStep,
} from "@/screens/schedule/modal-steps";
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

const scheduleMetrics: ScheduleMetric[] = [
  {
    value: "48",
    label: "Total Events",
    hint: "+12% this month",
    hintColor: "#3300C9",
    icon: (
      <CalendarDaysIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />
    ),
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
    icon: (
      <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />
    ),
    iconBg: "#D9F4E2",
  },
  {
    value: "$264",
    label: "Amount Spent",
    icon: (
      <TrendingUpIcon className="size-5 text-[#FF6E6E]" strokeWidth={1.8} />
    ),
    iconBg: "#FDE0DE",
  },
];

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

function formatScheduledDatePickerValue(value?: string | null) {
  const date = getDateFromDateTimeLocalValue(value);

  if (!date) return "Choose date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
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

function getFirstParticipantFromBulkResponse(
  data: EventParticipant[] | EventParticipant | null | undefined,
  selectedContactIds: string[],
) {
  const participants = Array.isArray(data) ? data : data ? [data] : [];

  return (
    participants.find(
      (participant) =>
        participant.eventContactId &&
        selectedContactIds.includes(participant.eventContactId),
    ) ??
    participants[0] ??
    null
  );
}

function mapMarketplaceProductToGiftPayload(
  product: MarketplaceProduct,
): CreateBulkGiftItemPayload {
  return {
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
  };
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
  const participantContact = row.participant?.eventContact;
  const name = row.recipientName || getParticipantName(row.participant);
  const initials = getInitials(
    participantContact?.firstName ?? name,
    participantContact?.lastName ?? "",
  );

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
            aria-label={`More options for ${row.recipientName}`}
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedEventTypeId = flowSelection.selectedEventTypeId;
  const selectedEventId = flowSelection.selectedEventId;
  const selectedRecipientParticipantId =
    flowSelection.selectedRecipientParticipantId;
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
  const setSelectedGiftIds = (ids: string[]) =>
    setStoredSelectedGiftIds(flowSelectionKey, ids);
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
  const hydratedMessageIdRef = useRef<string | null>(null);
  const [scheduleMetricsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const isFlowOpen = Boolean(currentStep);
  const isEditing = Boolean(editingMessageId);
  const isViewing = searchParams.get("view") === "true";
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
  } = useScheduledEventMessagesQuery({
    page: currentPage,
    per_page: PAGE_SIZE,
    searchQuery: query,
    eventTiming: getScheduleEventTiming(activeTab),
  });
  const { data: editingMessageResponse, refetch: refetchEditingMessage } =
    useScheduledEventMessageQuery(editingMessageId, {
      enabled: isFlowOpen && Boolean(editingMessageId),
    });
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
      enabled:
        isFlowOpen &&
        (currentStep === "record" || currentStep === "review-records"),
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
  const createBulkContactsMutation = useCreateBulkContactsMutation();
  const createParticipantsBulkMutation = useCreateParticipantsBulkMutation();
  const createMessageMutation = useCreateScheduledEventMessageMutation();
  const updateMessageMutation = useUpdateScheduledEventMessageMutation();
  const deleteMessageMutation = useDeleteScheduledEventMessageMutation();
  const completeSetupMutation = useCompleteScheduledEventMessageSetupMutation();
  const assignBulkGiftsMutation = useAssignBulkGiftsMutation();

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
  const selectedParticipantReviewItems = useMemo(
    () =>
      selectedParticipantRecords.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email || item.subtitle || "",
      })),
    [selectedParticipantRecords],
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) => messageRows.some((row) => row.id === id)),
    );
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

    const participantContact = record.participant?.eventContact;
    const participantContactId =
      participantContact?.id ?? record.participant?.eventContactId ?? "";
    const reviewRecordId = participantContactId || record.participantId || "";

    setSelectedEventId(record.eventId);
    setSelectedEventTypeId(record.event.eventTypeId);
    setSelectedRecipientParticipantId(record.participantId);

    if (reviewRecordId) {
      const selectedRecord: SearchableRecordItem = {
        id: reviewRecordId,
        name:
          `${participantContact?.firstName ?? ""} ${participantContact?.lastName ?? ""}`.trim() ||
          participantContact?.email ||
          record.recipientName ||
          "Selected contact",
        email: participantContact?.email ?? record.recipientEmail ?? "",
        subtitle: participantContact?.email ?? record.recipientEmail ?? "",
        initials: getInitials(
          participantContact?.firstName ?? record.recipientName,
          participantContact?.lastName ?? "",
        ),
        profileUrl: participantContact?.profileUrl ?? null,
      };

      // Prefer the contact ID when it is available. If the API only returns
      // participantId, it is still enough to render the confirmation because
      // the participant has already been persisted on the server.
      setSelectedParticipantIds([participantContactId || reviewRecordId]);
      setSelectedParticipantRecords([selectedRecord]);
      setCustomContactRecordItems((current) =>
        mergeRecordItems(current, [selectedRecord]),
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

  const closeFlow = () => {
    router.push("/dashboard/schedule");
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
  };

  const handleOnedaBusinessNext = () => {
    if (!selectedOnedaBusinessId) {
      toast.error("Please select a business.");
      return;
    }

    updateRoute("oneda-contact");
  };

  const requireScheduleEventMessageId = () => {
    if (!editingMessageId) {
      toast.error("Please start this message event first.");
      return null;
    }

    return editingMessageId;
  };

  const persistRecipientSelection = async (
    contactIds: string[],
    records: SearchableRecordItem[],
  ) => {
    const scheduleEventMessageId = requireScheduleEventMessageId();

    if (!scheduleEventMessageId) {
      return null;
    }

    if (!selectedEventId) {
      toast.error("Unable to resolve this event right now.");
      return null;
    }

    if (!contactIds.length || !records.length) {
      toast.error("Please select at least one recipient.");
      return null;
    }

    const participantsResponse =
      await createParticipantsBulkMutation.mutateAsync({
        eventId: selectedEventId,
        role: "participant",
        contactIds,
      });

    const recipientParticipant = getFirstParticipantFromBulkResponse(
      participantsResponse.data,
      contactIds,
    );

    if (!recipientParticipant) {
      toast.error("Unable to resolve the selected recipient right now.");
      return null;
    }

    await updateMessageMutation.mutateAsync({
      id: scheduleEventMessageId,
      payload: {
        eventId: selectedEventId,
        participantId: recipientParticipant.id,
      },
    });

    setSelectedParticipantIds(contactIds);
    setSelectedParticipantRecords(records);
    setSelectedRecipientParticipantId(recipientParticipant.id);

    // Refresh before navigation so the next route can rebuild its state
    // from the server even when this component is remounted.
    await refetchEditingMessage();

    return recipientParticipant;
  };

  const handleRecordNext = async () => {
    if (!selectedParticipantIds.length || !selectedParticipantRecords.length) {
      toast.error("Please select at least one recipient.");
      return;
    }

    setSelectedRecipientParticipantId("");
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
      const importedRecord = importedRecords.at(0);

      if (!importedRecord) {
        toast.error("The selected contact could not be imported.");
        return;
      }

      setCustomContactRecordItems((current) =>
        mergeRecordItems(current, importedRecords),
      );
      setSelectedParticipantIds([importedRecord.id]);
      setSelectedParticipantRecords([importedRecord]);
      setSelectedRecipientParticipantId("");
      setRecordSearchValue("");

      toast.success(response.message);
      void refetchContacts();
      updateRoute("review-records");
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

    const selectedContactId = selectedParticipantIds[0] ?? "";
    const existingRecord = editingMessageResponse?.data;
    const existingContactId =
      existingRecord?.participant?.eventContactId ||
      existingRecord?.participant?.eventContact?.id ||
      "";

    if (
      existingRecord?.participantId &&
      (selectedContactId === existingContactId ||
        selectedContactId === existingRecord.participantId)
    ) {
      setSelectedRecipientParticipantId(existingRecord.participantId);
      updateRoute("compose");
      return;
    }

    try {
      const recipientParticipant = await persistRecipientSelection(
        selectedParticipantIds,
        selectedParticipantRecords,
      );

      if (!recipientParticipant) {
        return;
      }

      toast.success("Recipient saved successfully.");
      updateRoute("compose");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save selected recipients right now.",
      );
    }
  };

  const handleEventTypeNext = async () => {
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

    const draftEventDate = form.eventDate
      ? toIsoDateTime(form.eventDate)
      : new Date().toISOString();

    try {
      if (editingMessageId) {
        const response = await updateMessageMutation.mutateAsync({
          id: editingMessageId,
          payload: {
            ...(selectedEventId ? { eventId: selectedEventId } : {}),
            event: {
              title: eventTitle,
              eventTypeId: selectedEventTypeOption.value,
              eventDate: draftEventDate,
            },
          },
        });

        setSelectedEventId(response.data.eventId);
        setScheduleDraftFields(flowSelectionKey, {
          selectedEventTypeId: selectedEventTypeOption.value,
          selectedEventId: response.data.eventId,
          form: {
            eventName: response.data.event.title || eventTitle,
            subject: form.subject || eventTitle,
            eventDate: toDateOnlyValue(response.data.event.eventDate),
            scheduledAt: form.scheduledAt,
          },
        });
        updateRoute("event-date", {
          eventId: response.data.eventId,
          scheduleEventMessageId: response.data.id,
        });
        return;
      }

      const response = await createMessageMutation.mutateAsync({
        event: {
          title: eventTitle,
          eventTypeId: selectedEventTypeOption.value,
          eventDate: draftEventDate,
        },
        sendNow: mode === "message",
        metadata: {
          source: "dashboard",
        },
      });

      setSelectedEventId(response.data.eventId);
      const nextFlowKey = buildScheduleMessageFlowSelectionKey(
        mode,
        response.data.id,
        response.data.eventId,
      );

      setScheduleDraftFields(nextFlowKey, {
        lastVisitedStep: "event-date",
        selectedEventTypeId: selectedEventTypeOption.value,
        selectedEventId: response.data.eventId,
        form: {
          eventName: response.data.event.title || eventTitle,
          subject: form.subject || eventTitle,
          eventDate: toDateOnlyValue(response.data.event.eventDate),
          scheduledAt: form.scheduledAt,
        },
      });

      if (selectedParticipantIds.length) {
        setStoredSelectedParticipantIds(nextFlowKey, selectedParticipantIds);
      }

      if (selectedParticipantRecords.length) {
        setStoredSelectedParticipantRecords(
          nextFlowKey,
          selectedParticipantRecords,
        );
      }

      if (selectedGiftIds.length) {
        setStoredSelectedGiftIds(nextFlowKey, selectedGiftIds);
      }

      if (Object.keys(selectedGiftProductsById).length) {
        setStoredSelectedGiftProductsById(
          nextFlowKey,
          selectedGiftProductsById,
        );
      }

      if (customContactRecordItems.length) {
        setStoredCustomContactRecordItems(
          nextFlowKey,
          customContactRecordItems,
        );
      }

      if (flowSelectionKey !== nextFlowKey) {
        resetFlowSelection(flowSelectionKey);
      }

      updateRoute("event-date", {
        eventId: response.data.eventId,
        scheduleEventMessageId: response.data.id,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start this message event right now.",
      );
    }
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

  const handleSubmit = async () => {
    const scheduleEventMessageId = requireScheduleEventMessageId();
    if (!scheduleEventMessageId) return;

    try {
      const selectedProducts = getValidatedSelectedGiftProducts();

      if (!selectedProducts) {
        return;
      }

      const recipientParticipantId =
        selectedRecipientParticipantId ||
        editingMessageResponse?.data?.participantId;
      const resolvedEventId = selectedEventId || routeEventId;

      if (selectedProducts.length) {
        if (!resolvedEventId) {
          toast.error("Unable to resolve this event right now.");
          return;
        }

        if (!recipientParticipantId) {
          toast.error("Unable to resolve the selected recipient right now.");
          return;
        }

        await assignBulkGiftsMutation.mutateAsync({
          eventId: resolvedEventId,
          recipientParticipantIds: [recipientParticipantId],
          gifts: selectedProducts.map(mapMarketplaceProductToGiftPayload),
        });
      }

      if (selectedEventId) {
        await completeSetupMutation.mutateAsync(selectedEventId);
      }

      toast.success(
        mode === "message"
          ? "Message sent successfully."
          : "Message scheduled successfully.",
      );
      setIsSubmitConfirmationOpen(false);
      updateRoute("success", {
        eventId: selectedEventId,
        scheduleEventMessageId,
      });
    } catch (error) {
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
            aria-label={`Select ${row.recipientName}`}
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
        id: "email",
        header: "Email Address",
        accessor: "recipientEmail",
        headerClassName: "min-w-[190px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
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

      <div className="flex items-center justify-center gap-3 pt-2">
        <BackButton
          onClick={closeFlow}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
        />
        <ModalButton
          onClick={handleEventTypeNext}
          disabled={!selectedEventTypeId}
        >
          Next
        </ModalButton>
      </div>
    </div>
  );

  const eventDateStep = (
    <EventDateStep
      eventName={form.eventName || selectedEventTypeOption?.label || "Event"}
      value={form.eventDate}
      onChange={(value) =>
        setForm((current) => ({
          ...current,
          eventDate: value,
        }))
      }
      onBack={() => updateRoute("event")}
      onNext={async () => {
        if (!form.eventDate) {
          toast.error("Please choose the event date.");
          return;
        }

        const scheduleEventMessageId = requireScheduleEventMessageId();
        if (!scheduleEventMessageId) return;

        try {
          const response = await updateMessageMutation.mutateAsync({
            id: scheduleEventMessageId,
            payload: {
              ...(selectedEventId ? { eventId: selectedEventId } : {}),
              event: {
                eventDate: toIsoDateTime(form.eventDate),
              },
            },
          });

          setSelectedEventId(response.data.eventId);
          setForm((current) => ({
            ...current,
            scheduledAt: mergeDateAndTimeToDateTimeLocalValue(
              new Date(`${current.eventDate}T00:00:00`),
              getTimeFromDateTimeLocalValue(current.scheduledAt) ||
                DEFAULT_SCHEDULE_TIME,
            ),
          }));
          updateRoute("source", {
            eventId: response.data.eventId,
            scheduleEventMessageId: response.data.id,
          });
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to save this event date right now.",
          );
        }
      }}
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
          From Oneda
        </ModalButton>
      </div>

      <div className="flex justify-center">
        <BackButton
          onClick={() => updateRoute("event-date")}
          className="flex size-[66px] items-center justify-center rounded-[14px] bg-[#F3EFFB] text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
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
            const selectedId = ids.at(-1);

            if (!selectedId) {
              setSelectedParticipantIds([]);
              setSelectedParticipantRecords([]);
              setSelectedRecipientParticipantId("");
              return;
            }

            const selectedRecord = allContactRecordOptions.find(
              (item) => item.id === selectedId,
            );

            if (!selectedRecord) {
              setSelectedParticipantIds([]);
              setSelectedParticipantRecords([]);
              setSelectedRecipientParticipantId("");
              toast.error("Unable to resolve the selected contact.");
              return;
            }

            setSelectedParticipantIds([selectedId]);
            setSelectedParticipantRecords([selectedRecord]);
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
                  !selectedParticipantRecords.length ||
                  createParticipantsBulkMutation.isPending ||
                  updateMessageMutation.isPending
                }
              >
                {createParticipantsBulkMutation.isPending ||
                updateMessageMutation.isPending
                  ? "Saving..."
                  : "Next"}
              </ModalButton>
            </div>
          }
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

  const reviewRecordsStep = (
    <CustomColleagueReview
      greetingName="there"
      prompt="Review the person you want to message."
      items={selectedParticipantReviewItems}
      onAddNew={() => updateRoute("record")}
      onBack={() => updateRoute("source")}
      onNext={handleReviewRecordsNext}
      onDelete={(id) => {
        setSelectedParticipantIds((current) =>
          current.filter((participantId) => participantId !== id),
        );
        setSelectedParticipantRecords((current) =>
          current.filter((participant) => participant.id !== id),
        );
      }}
      nextDisabled={
        !selectedParticipantReviewItems.length ||
        createParticipantsBulkMutation.isPending ||
        updateMessageMutation.isPending
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
            const selectedId = ids.at(-1);
            setSelectedOnedaContactIds(selectedId ? [selectedId] : []);
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
                {createBulkContactsMutation.isPending ? "Saving..." : "Next"}
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

        <label className="block">
          <span className="sr-only">Scheduled time</span>
          <input
            type="time"
            value={scheduledTime || DEFAULT_SCHEDULE_TIME}
            disabled={isViewing}
            onChange={(event) => handleScheduledTimeChange(event.target.value)}
            className={cn(
              "h-[54px] w-full rounded-[18px] border border-[#ECE8F7] bg-white px-4 text-[15px] text-[#434343] outline-none transition-colors focus:border-[#3300C9]",
              isViewing && "cursor-not-allowed bg-[#F8F7FC] text-[#7D7D7D]",
            )}
          />
        </label>
      </div>
    </div>
  );

  const composeStep = (
    <div className="mx-auto max-w-[620px] space-y-5 pt-3">
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

      <div className="space-y-4">
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
        <textarea
          value={form.message}
          readOnly={isViewing}
          onChange={(event) =>
            setForm((current) => ({ ...current, message: event.target.value }))
          }
          placeholder="Message body"
          rows={5}
          className={cn(
            "w-full resize-none rounded-[18px] border border-[#ECE8F7] px-4 py-3 text-[15px] outline-none transition-colors focus:border-[#3300C9]",
            isViewing && "cursor-default bg-[#F8F7FC] text-[#434343]",
          )}
        />
        {mode === "schedule" ? lockedScheduledDateTimeField : null}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
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
            onClick={async () => {
              const scheduleEventMessageId = requireScheduleEventMessageId();
              if (!scheduleEventMessageId) return;

              if (!form.subject.trim() || !form.message.trim()) {
                toast.error("Please add a subject and message.");
                return;
              }

              if (mode === "schedule" && !form.scheduledAt) {
                toast.error("Please choose when this message should be sent.");
                return;
              }

              try {
                await updateMessageMutation.mutateAsync({
                  id: scheduleEventMessageId,
                  payload: {
                    ...(selectedEventId ? { eventId: selectedEventId } : {}),
                    subject: form.subject.trim(),
                    message: form.message.trim(),
                    sendNow: mode === "message",
                    ...(mode === "schedule"
                      ? { scheduledAt: toIsoDateTime(form.scheduledAt) }
                      : {}),
                    ...(form.giftUrl.trim()
                      ? { giftUrl: form.giftUrl.trim() }
                      : {}),
                    ...(form.giftUrlExpiresAt
                      ? {
                          giftUrlExpiresAt: toIsoDateTime(
                            form.giftUrlExpiresAt,
                          ),
                        }
                      : {}),
                    metadata: {
                      source: "dashboard",
                    },
                  },
                });

                updateRoute("gift-selection");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to save this message right now.",
                );
              }
            }}
            disabled={
              !form.subject.trim() ||
              !form.message.trim() ||
              (mode === "schedule" && !form.scheduledAt)
            }
          >
            Next
          </ModalButton>
        )}
      </div>
    </div>
  );

  const giftSelectionStep = (
    <WishlistGiftSelectionStep
      selectedIds={selectedGiftIds}
      onSelectedIdsChange={setSelectedGiftIds}
      onSelectedProductToggle={handleGiftProductToggle}
      onBack={() => updateRoute("compose")}
      onNext={handleGiftSelectionNext}
      nextDisabled={assignBulkGiftsMutation.isPending}
      nextLabel={
        assignBulkGiftsMutation.isPending
          ? "Saving..."
          : selectedGiftIds.length
            ? "Next"
            : "Skip"
      }
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
            previousLabel="← Previous"
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
        dialogClassName="max-w-[536px] rounded-[18px] bg-white sm:rounded-[20px]"
        bodyClassName="px-4 py-6 sm:px-8 sm:py-10 lg:px-10"
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
        onClose={() => setIsSubmitConfirmationOpen(false)}
        onConfirm={handleSubmit}
        action="save"
        title={mode === "message" ? "Send Message" : "Schedule Message"}
        description={
          mode === "message"
            ? "Are you sure you want to send this message now?"
            : "Are you sure you want to schedule this message?"
        }
        confirmText={mode === "message" ? "Send" : "Schedule"}
        isLoading={
          createMessageMutation.isPending ||
          updateMessageMutation.isPending ||
          completeSetupMutation.isPending ||
          assignBulkGiftsMutation.isPending
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
    </div>
  );
}

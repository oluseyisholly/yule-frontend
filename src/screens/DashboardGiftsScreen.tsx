"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Image, { type StaticImageData } from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  CalendarDaysIcon,
  CheckCircle2,
  MinusIcon,
  MoreHorizontal,
  Clock3,
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
import CustomColleagueReview from "@/components/CustomColleagueReview";
import EmailInviteComposeModal from "@/components/EmailInviteComposeModal";
import DrawNameInviteStep from "@/components/DrawNameInviteStep";
import EventDateStep from "@/components/EventDateStep";
import GiftBudgetStep, {
  deriveGiftBudgetOption,
  resolveGiftBudgetRange,
  type GiftBudgetOptionKey,
} from "@/components/GiftBudgetStep";
import GiftRecipientChoiceStep, {
  type GiftRecipientChoiceValue,
} from "@/components/GiftRecipientChoiceStep";
import ModalButton from "@/components/ModalButtons";
import OverlayRecordPicker from "@/components/OverlayRecordPicker";
import OverlaySelect, {
  type OverlaySelectOption,
} from "@/components/OverlaySelect";
import SideDrawer from "@/components/SideDrawer";
import type { SearchableRecordItem } from "@/components/SearchableRecordPicker";
import UserAvatar from "@/components/UserAvatar";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import {
  ModalPanelSkeleton,
  TableLoadingState,
} from "@/components/ui/context-skeletons";
import StatusPill from "@/components/ui/status-pill";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ViewIcon from "@/components/icons/ViewIcon";
import EventGiftDetailView from "@/components/gifts/EventGiftDetailView";
import featureImg1 from "@/assets/icons/featureImg1.svg";
import featureImg2 from "@/assets/icons/featureImg2.svg";
import featureImg3 from "@/assets/icons/featureImg3.svg";
import featureImg4 from "@/assets/icons/featureImg4.svg";
import { useContactsQuery } from "@/features/contacts/hooks/useContactsQuery";
import { useCreateBulkContactsMutation } from "@/features/contacts/hooks/useCreateBulkContactsMutation";
import { useCreateContactMutation } from "@/features/contacts/hooks/useCreateContactMutation";
import { useDeleteContactMutation } from "@/features/contacts/hooks/useDeleteContactMutation";
import { useEnsureMyContactMutation } from "@/features/contacts/hooks/useEnsureMyContactMutation";
import { useContactEnumsQuery } from "@/features/contacts/hooks/useContactEnumsQuery";
import { useUpdateContactConnectionMutation } from "@/features/contacts/hooks/useUpdateContactConnectionMutation";
import { useUpdateContactMutation } from "@/features/contacts/hooks/useUpdateContactMutation";
import type { Contact } from "@/features/contacts/types";
import { useExternalBusinessesQuery } from "@/features/auth/hooks/useExternalBusinessesQuery";
import {
  useOnedaProfilesQuery,
  type OnedaProfile,
} from "@/features/auth/hooks/useOnedaProfilesQuery";
import type { ExternalBusinessRecord } from "@/features/auth/types";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import { useAssignBulkGiftsMutation } from "@/features/gifts/hooks/useAssignBulkGiftsMutation";
import { useContactGiftCartItemsQuery } from "@/features/gifts/hooks/useContactGiftCartItemsQuery";
import { useContactGiftCartParticipantGiftIdsQuery } from "@/features/gifts/hooks/useContactGiftCartParticipantGiftIdsQuery";
import { useGiftMetricsQuery } from "@/features/gifts/hooks/useGiftMetricsQuery";
import { useGivenGroupedGiftsQuery } from "@/features/gifts/hooks/useGivenGroupedGiftsQuery";
import { useReceivedGiftsQuery } from "@/features/gifts/hooks/useReceivedGiftsQuery";
import { useUpdateGiftFulfillmentMutation } from "@/features/gifts/hooks/useUpdateGiftFulfillmentMutation";
import { useSendEmailMutation } from "@/features/email/hooks/useSendEmailMutation";
import { canManageGiftingEvent } from "@/features/gifting-events/access";
import { useCreateGiftingEventMutation } from "@/features/gifting-events/hooks/useCreateGiftingEventMutation";
import { useCreateGiftingEventSetupMutation } from "@/features/gifting-events/hooks/useCreateGiftingEventSetupMutation";
import { useDeleteGiftingEventMutation } from "@/features/gifting-events/hooks/useDeleteGiftingEventMutation";
import { useCompleteGiftingEventMutation } from "@/features/gifting-events/hooks/useCompleteGiftingEventMutation";
import { useGiftingEventsQuery } from "@/features/gifting-events/hooks/useGiftingEventsQuery";
import { useUpdateGiftingEventSetupMutation } from "@/features/gifting-events/hooks/useUpdateGiftingEventSetupMutation";
import { useUpdateGiftingEventMutation } from "@/features/gifting-events/hooks/useUpdateGiftingEventMutation";
import { useSendGiftingEventInvitationsMutation } from "@/features/invitations/hooks/useSendGiftingEventInvitationsMutation";
import type {
  GiftMetricStat,
  GivenGroupedGift,
  GivenGroupedGiftEvent,
  GivenGroupedGiftPerson,
  ReceivedGift,
  ReceivedGiftParticipantContact,
  ContactGiftCartItem,
} from "@/features/gifts/types";
import type {
  GiftingEventGiftAssignmentPayload,
  GiftingEventParticipant,
  GiftingEventParticipantActor,
  GiftingEventRecord,
  GiftingEventSetupPayload,
} from "@/features/gifting-events/types";
import type { MarketplaceProduct } from "@/features/marketplace/types";
import { useCreateParticipantsBulkMutation } from "@/features/participants/hooks/useCreateParticipantsBulkMutation";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import { useAvailableRelationshipsQuery } from "@/features/relationships/hooks/useAvailableRelationshipsQuery";
import { useCreateRelationshipMutation } from "@/features/relationships/hooks/useCreateRelationshipMutation";
import { useDeleteRelationshipMutation } from "@/features/relationships/hooks/useDeleteRelationshipMutation";
import { useUpdateRelationshipMutation } from "@/features/relationships/hooks/useUpdateRelationshipMutation";
import { cn, shareInvite } from "@/lib/utils";
import {
  buildInviteShareMessage,
  buildSignedInInviteUrl,
} from "@/lib/invite-links";
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
type GiftStatus = "not_fulfilled" | "fulfilled";
type GiftingEventStatusLabel = "Draft" | "Ongoing" | "Completed";

type GiftRowPerson = {
  name: string;
  email?: string;
  profileUrl?: string | null;
};

type GiftRow = {
  id: string;
  eventId?: string | null;
  participantGiftId?: string | null;
  isFulfilled?: boolean;
  item: string;
  image: StaticImageData | string;
  product: MarketplaceProduct;
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
  minimumGiftBudget: number | null;
  maximumGiftBudget: number | null;
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

type MissingGiftContactField = "gender" | "ageRange" | "relationship";

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

const VALID_GIFTS_TABS: GiftsTab[] = ["events", "sent", "received"];

const PAGE_SIZE = 5;
const fallbackGiftImages = [featureImg1, featureImg2, featureImg3, featureImg4];
const EMPTY_NEW_COLLEAGUE_FORM: AddColleagueFormValues = {
  gender: "",
  ageRange: "",
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
        <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />
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

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
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
    ageRange: contact.ageRange?.trim() || "",
    relationshipId: contact.connection?.relationshipId?.trim() || null,
    relationshipName:
      contact.connection?.relationship?.name?.trim() || "",
    profileUrl: contact.profileUrl?.trim() || null,
    initials: `${firstInitial}${lastInitial}`.trim().toUpperCase() || "CT",
    avatarBg,
    avatarColor,
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
  const subtitle = subtitleParts.join(" • ") || "Business";
  const initials = businessName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
  const { avatarBg, avatarColor } = getContactAvatarStyle(businessId);

  return {
    id: businessId,
    name: businessName,
    subtitle,
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
  return {
    id: profile._id,
    name: `${profile.accountId.firstName} ${profile.accountId.lastName}`.trim(),
    email: profile.accountId.email,
    subtitle: profile.accountId.email,
    profileUrl: profile.profilePhotoUrl?.trim() || null,
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
      profileUrl: person.profileUrl?.trim() || null,
    });
  });

  return normalizedPeople;
}

function toSentGiftStatus(
  gift: GivenGroupedGift,
): GiftStatus {
  return gift.isFulfilled ? "fulfilled" : "not_fulfilled";
}

function toGiftRowProduct(
  gift: GivenGroupedGift | ReceivedGift,
  fallbackId: string,
): MarketplaceProduct {
  const imageUrl = gift.imageUrl?.trim();

  return {
    _id:
      gift.participantGiftId?.trim() ||
      ("id" in gift ? gift.id?.trim() : "") ||
      fallbackId,
    title: gift.title?.trim() || "Gift item",
    description: gift.description?.trim() || "",
    amount: Number(gift.amount ?? 0),
    images: imageUrl ? [imageUrl] : [],
    categorySlug: gift.categorySlug?.trim() || undefined,
    subCategorySlug: gift.subCategorySlug?.trim() || undefined,
    condition:
      (gift.condition?.trim() as MarketplaceProduct["condition"]) || undefined,
    location: {
      state: gift.locationState?.trim() || undefined,
      city: gift.locationCity?.trim() || undefined,
    },
    sellerId: gift.sellerId?.trim() || undefined,
    slug: gift.productSlug?.trim() || undefined,
  };
}

function toCartGiftProduct(item: ContactGiftCartItem): MarketplaceProduct {
  const imageUrl = item.imageUrl?.trim();

  return {
    _id: item.participantGiftId?.trim() || item.id,
    title: item.title?.trim() || "Gift item",
    description: item.description?.trim() || "",
    amount: Number(item.amount ?? 0),
    images: imageUrl ? [imageUrl] : [],
    categorySlug: item.categorySlug?.trim() || undefined,
    subCategorySlug: item.subCategorySlug?.trim() || undefined,
    condition:
      (item.condition?.trim() as MarketplaceProduct["condition"]) || undefined,
    location: {
      state: item.locationState?.trim() || undefined,
      city: item.locationCity?.trim() || undefined,
    },
    sellerId: item.sellerId?.trim() || undefined,
    slug: item.productSlug?.trim() || undefined,
  };
}

function toSentGiftRow(gift: GivenGroupedGift, index: number): GiftRow {
  const people = toGivenGiftPeople(gift.people);
  const recipientCount =
    gift.recipientCount ?? (people.length > 0 ? people.length : 1);
  const event = gift.event;
  const rowId =
    [
      gift.participantGiftId?.trim() || gift.id?.trim() || "given-gift",
      index,
    ]
      .filter(Boolean)
      .join("-");

  return {
    id: rowId,
    eventId: event?.id?.trim() || null,
    participantGiftId: gift.participantGiftId?.trim() || null,
    item: gift.title?.trim() || "Gift item",
    image:
      gift.imageUrl?.trim() ||
      fallbackGiftImages[index % fallbackGiftImages.length],
    product: toGiftRowProduct(gift, rowId),
    eventName: event?.title?.trim() || "-",
    eventDate: formatDate(event?.eventDate),
    amount: formatCurrency(gift.amount, gift.currency?.trim() || "NGN"),
    status: toSentGiftStatus(gift),
    isFulfilled: Boolean(gift.isFulfilled),
    sentTo: people,
    recipientCount,
  };
}

function toReceivedStatus(gift: ReceivedGift): GiftStatus {
  return gift.isFulfilled ? "fulfilled" : "not_fulfilled";
}

function toReceivedGiftRow(gift: ReceivedGift, index: number): GiftRow {
  const giverContact = gift.giverParticipant?.eventContact;
  const giverName = toDisplayName(giverContact);

  return {
    id: gift.id,
    eventId: gift.eventId?.trim() || null,
    participantGiftId: gift.participantGiftId?.trim() || null,
    item: gift.title?.trim() || "Gift item",
    image:
      gift.imageUrl?.trim() ||
      fallbackGiftImages[index % fallbackGiftImages.length],
    product: toGiftRowProduct(gift, gift.id),
    eventName: gift.event?.title?.trim() || "-",
    eventDate: formatDate(gift.event?.eventDate),
    amount: formatCurrency(gift.amount, gift.currency?.trim() || "NGN"),
    status: toReceivedStatus(gift),
    isFulfilled: Boolean(gift.isFulfilled),
    receivedFrom: giverName
      ? [
          {
            name: giverName,
            email: giverContact?.email?.trim() || undefined,
            profileUrl: giverContact?.profileUrl?.trim() || null,
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

function getGiftRowKey(row: GiftRow, index: number) {
  const eventId = row.eventId?.trim();
  const participantGiftId = row.participantGiftId?.trim();

  if (eventId && participantGiftId) {
    return `${eventId}-${participantGiftId}`;
  }

  if (participantGiftId) {
    return participantGiftId;
  }

  if (eventId) {
    return `${eventId}-${row.id || index}`;
  }

  return row.id || `gift-row-${index}`;
}

function hasGiftFlowDraft(selection: GiftFlowSelectionState) {
  return (
    selection.lastVisitedStep !== EMPTY_GIFT_FLOW_SELECTION.lastVisitedStep ||
    selection.celebrationTarget !==
      EMPTY_GIFT_FLOW_SELECTION.celebrationTarget ||
    selection.selectedEventTypeId !==
      EMPTY_GIFT_FLOW_SELECTION.selectedEventTypeId ||
    selection.eventDate !== EMPTY_GIFT_FLOW_SELECTION.eventDate ||
    selection.giftDeadline !== EMPTY_GIFT_FLOW_SELECTION.giftDeadline ||
    selection.eventName !== EMPTY_GIFT_FLOW_SELECTION.eventName ||
    selection.selectedOnedaBusinessIds.length > 0 ||
    selection.selectedOnedaContactIds.length > 0 ||
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
    selectedOnedaBusinessIds: Array.isArray(selection?.selectedOnedaBusinessIds)
      ? selection.selectedOnedaBusinessIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedOnedaBusinessIds,
    selectedOnedaContactIds: Array.isArray(selection?.selectedOnedaContactIds)
      ? selection.selectedOnedaContactIds
      : EMPTY_GIFT_FLOW_SELECTION.selectedOnedaContactIds,
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
        profileUrl: participant.eventContact?.profileUrl?.trim() || null,
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
    minimumGiftBudget:
      typeof record.minimumGiftBudget === "number"
        ? record.minimumGiftBudget
        : null,
    maximumGiftBudget:
      typeof record.maximumGiftBudget === "number"
        ? record.maximumGiftBudget
        : null,
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

function RecipientAvatarWithImage({
  name,
  profileUrl,
}: {
  name: string;
  profileUrl?: string | null;
}) {
  const { bg, color } = getRecipientStyle(name);

  return (
    <UserAvatar
      name={name}
      initials={toInitials(name)}
      imageUrl={profileUrl}
      bgColor={bg}
      textColor={color}
      className="size-8 border border-white text-[9px] font-semibold"
      title={name}
    />
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
        <RecipientAvatarWithImage
          name={person.name}
          profileUrl={person.profileUrl}
        />
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
          <RecipientAvatarWithImage
            key={person.name}
            name={person.name}
            profileUrl={person.profileUrl}
          />
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
          <UserAvatar
            key={person.name}
            name={person.name}
            initials={toInitials(person.name)}
            imageUrl={person.profileUrl}
            bgColor={bg}
            textColor={color}
            className="size-8 border border-white text-[9px] font-semibold"
            title={person.name}
          />
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

function GiftRowActions({
  row,
  onView,
  onToggleFulfillment,
}: {
  row: GiftRow;
  onView: (row: GiftRow) => void;
  onToggleFulfillment?: (row: GiftRow) => void;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More options for ${row.item}`}
            className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-40 rounded-xl border-[#ECE8F7] bg-white p-1.5 shadow-[0_16px_40px_rgba(51,0,201,0.08)]"
        >
          <DropdownMenuItem
            onSelect={() => onView(row)}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            <ViewIcon className="size-4 text-[#292D32]" />
            View
          </DropdownMenuItem>
          {onToggleFulfillment ? (
            <DropdownMenuItem
              onSelect={() => onToggleFulfillment(row)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9] flex items-center gap-2"
            >
              {row.isFulfilled ? (
                <>
                  <Clock3 className="size-4 text-[#292D32]" />
                  Mark as Not Fulfilled
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 text-[#292D32]" />
                  Mark as Fulfilled
                </>
              )}
            </DropdownMenuItem>
          ) : null}
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
  const authToken = useAuthStore((state) => state.token);
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
  const setSelectedParticipantRecordsById = useGiftFlowStore(
    (state) => state.setSelectedParticipantRecordsById,
  );
  const setStoredSelectedGiftIds = useGiftFlowStore(
    (state) => state.setSelectedGiftIds,
  );
  const setSelectedGiftProductsById = useGiftFlowStore(
    (state) => state.setSelectedGiftProductsById,
  );
  const setGiftRecipientQuantitiesById = useGiftFlowStore(
    (state) => state.setGiftRecipientQuantitiesById,
  );
  const resetGiftFlowSelection = useGiftFlowStore(
    (state) => state.resetFlowSelection,
  );
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteEventRow, setPendingDeleteEventRow] =
    useState<GiftingEventRow | null>(null);
  const [pendingFulfillmentGiftRow, setPendingFulfillmentGiftRow] =
    useState<GiftRow | null>(null);
  const [pendingFulfillmentTarget, setPendingFulfillmentTarget] = useState<
    boolean | null
  >(null);
  const [recordPendingDelete, setRecordPendingDelete] =
    useState<SearchableRecordItem | null>(null);
  const [recordSearchValue, setRecordSearchValue] = useState("");
  const [debouncedRecordSearchValue, setDebouncedRecordSearchValue] =
    useState("");
  const [eventTypeSearchValue, setEventTypeSearchValue] = useState("");
  const [debouncedEventTypeSearchValue, setDebouncedEventTypeSearchValue] =
    useState("");
  const [relationshipSearchValue, setRelationshipSearchValue] = useState("");
  const [debouncedRelationshipSearchValue, setDebouncedRelationshipSearchValue] =
    useState("");
  const [addRecordReturnStep, setAddRecordReturnStep] = useState<
    "record" | "review-records"
  >("record");
  const [isGiftRecordPickerOpen, setIsGiftRecordPickerOpen] = useState(false);
  const [giftsStatsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const [
    isCompleteGiftingEventConfirmationOpen,
    setIsCompleteGiftingEventConfirmationOpen,
  ] = useState(false);
  const [isSavingGiftSetupAsDraft, setIsSavingGiftSetupAsDraft] =
    useState(false);
  const [isSavingGiftSetupAndCompleting, setIsSavingGiftSetupAndCompleting] =
    useState(false);
  const [
    isDiscardGiftFlowConfirmationOpen,
    setIsDiscardGiftFlowConfirmationOpen,
  ] = useState(false);
  const [isGiftInviteEmailComposeOpen, setIsGiftInviteEmailComposeOpen] =
    useState(false);
  const [activeGiftAssignmentProductId, setActiveGiftAssignmentProductId] =
    useState<string | null>(null);
  const [
    pendingGiftContactDetailsPrompt,
    setPendingGiftContactDetailsPrompt,
  ] = useState<{
    item: SearchableRecordItem;
    missingFields: MissingGiftContactField[];
  } | null>(null);
  const [skippedGiftContactDetailsPromptIds, setSkippedGiftContactDetailsPromptIds] =
    useState<string[]>([]);
  const autoPreselectedCaughtMyEyeFlowKeysRef = useRef<Set<string>>(new Set());
  const [customGiftBudgetMinimum, setCustomGiftBudgetMinimum] = useState("");
  const [customGiftBudgetMaximum, setCustomGiftBudgetMaximum] = useState("");
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
  const onedaAccountId =
    authUser?.profile?.accountId?._id?.trim() ||
    authUser?.hostAccountId?.trim() ||
    null;
  const selectedParticipantContactIds =
    flowSelection.selectedParticipantContactIds;
  const selectedParticipantRecordsById =
    flowSelection.selectedParticipantRecordsById;
  const selectedOnedaBusinessIds = flowSelection.selectedOnedaBusinessIds;
  const selectedOnedaContactIds = flowSelection.selectedOnedaContactIds;
  const selectedGiftIds = flowSelection.selectedGiftIds;
  const selectedGiftProductsById = flowSelection.selectedGiftProductsById;
  const giftRecipientQuantitiesById = flowSelection.giftRecipientQuantitiesById;
  const selectedCelebrationTarget = flowSelection.celebrationTarget;
  const selectedBudgetOption = flowSelection.selectedBudgetOption;
  const selectedMinimumGiftBudget = flowSelection.minimumGiftBudget;
  const selectedMaximumGiftBudget = flowSelection.maximumGiftBudget;
  const selectedGiftEventTypeId = flowSelection.selectedEventTypeId;
  const selectedGiftEventDate = flowSelection.eventDate;
  const giftEventName = flowSelection.eventName;
  const selectedRecipientGender = flowSelection.recipientGender;
  const selectedRecipientAgeRange = flowSelection.recipientAgeRange;
  const selectedRecipientRelationshipId = flowSelection.recipientRelationshipId;
  const activeRecipientContactId = flowSelection.activeRecipientContactId;
  const recipientDetailsByContactId = flowSelection.recipientDetailsByContactId;
  const isGiftInviteStep = currentGiftFlowStep === "invite";
  const isGiftingMyself = selectedCelebrationTarget === "myself";
  const isGroupGifting = selectedCelebrationTarget === "group";
  const activeTabParam = searchParams.get("tab")?.trim().toLowerCase() ?? null;
  const receivedEventIdParam = searchParams.get("eventId")?.trim() || "";
  const isBrowseGiftsFlow = searchParams.get("browse") === "true";
  const shouldReturnToGiftFlow =
    isBrowseGiftsFlow && searchParams.get("returnToGiftFlow") === "true";
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
      searchQuery: debouncedEventTypeSearchValue,
    },
    {
      enabled: isGiftFlowOpen && currentGiftFlowStep === "event",
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
      isGiftFlowOpen &&
      currentGiftFlowStep === "oneda-business" &&
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
        isGiftFlowOpen &&
        currentGiftFlowStep === "oneda-contact" &&
        Boolean(selectedOnedaBusinessId),
    },
  );
  const isSentTab = activeTab === "sent";
  const isReceivedTab = activeTab === "received";
  const isEventsTab = activeTab === "events";
  const { data: cartItemsResponse } = useContactGiftCartItemsQuery(
    {
      page: 1,
      per_page: 100,
    },
    {
      enabled:
        isGiftFlowOpen &&
        currentGiftFlowStep === "gift-selection" &&
        !isBrowseGiftsFlow,
    },
  );
  const {
    data: cartParticipantGiftIdsResponse,
    isLoading: isCartParticipantGiftIdsLoading,
    isFetching: isCartParticipantGiftIdsFetching,
  } = useContactGiftCartParticipantGiftIdsQuery({
    enabled:
      isGiftFlowOpen &&
      currentGiftFlowStep === "gift-selection" &&
      !isBrowseGiftsFlow,
  });
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
      eventId: receivedEventIdParam || undefined,
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
  const createGiftingEventSetupMutation = useCreateGiftingEventSetupMutation();
  const completeGiftingEventMutation = useCompleteGiftingEventMutation();
  const updateGiftingEventSetupMutation = useUpdateGiftingEventSetupMutation();
  const updateGiftingEventMutation = useUpdateGiftingEventMutation();
  const updateGiftFulfillmentMutation = useUpdateGiftFulfillmentMutation();
  const sendEmailMutation = useSendEmailMutation();
  const ensureMyContactMutation = useEnsureMyContactMutation();
  const createBulkContactsMutation = useCreateBulkContactsMutation();
  const createContactMutation = useCreateContactMutation();
  const updateContactMutation = useUpdateContactMutation();
  const updateContactConnectionMutation = useUpdateContactConnectionMutation();
  const deleteContactMutation = useDeleteContactMutation();
  const createRelationshipMutation = useCreateRelationshipMutation();
  const updateRelationshipMutation = useUpdateRelationshipMutation();
  const deleteRelationshipMutation = useDeleteRelationshipMutation();
  const createParticipantsBulkMutation = useCreateParticipantsBulkMutation();
  const assignBulkGiftsMutation = useAssignBulkGiftsMutation();
  const shouldEnableContactsQuery =
    isGiftFlowOpen &&
    (currentGiftFlowStep === "record" ||
      currentGiftFlowStep === "review-records" ||
      currentGiftFlowStep === "add-record");
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
  const {
    data: availableRelationshipsResponse,
    isError: isAvailableRelationshipsError,
    isLoading: isAvailableRelationshipsLoading,
    refetch: refetchAvailableRelationships,
  } = useAvailableRelationshipsQuery(
    {
      per_page: 25,
      page: 1,
      searchQuery: debouncedRelationshipSearchValue,
    },
    {
      enabled: isGiftFlowOpen && currentGiftFlowStep === "relationship",
    },
  );
  const { data: contactEnumsResponse } = useContactEnumsQuery(
    isGiftFlowOpen &&
      (currentGiftFlowStep === "gender" ||
        currentGiftFlowStep === "age-range"),
  );
  const currentParticipantId = myParticipantResponse?.data?.id ?? null;
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
  const cartGiftProducts = useMemo(
    () =>
      (cartItemsResponse?.data.data ?? []).map((item) =>
        toCartGiftProduct(item),
      ),
    [cartItemsResponse?.data.data],
  );
  const cartGiftProductIds = useMemo(
    () => cartGiftProducts.map((product) => product._id).filter(Boolean),
    [cartGiftProducts],
  );
  const caughtMyEyeGiftProductIds = useMemo(
    () => cartParticipantGiftIdsResponse?.data.participantGiftIds ?? [],
    [cartParticipantGiftIdsResponse?.data.participantGiftIds],
  );
  const prioritizedGiftProductIds = useMemo(
    () => Array.from(new Set([...selectedGiftIds, ...caughtMyEyeGiftProductIds])),
    [caughtMyEyeGiftProductIds, selectedGiftIds],
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
  const relationshipOptions = useMemo<OverlaySelectOption[]>(
    () =>
      (availableRelationshipsResponse?.data?.data ?? [])
        .filter((relationship) => relationship.isActive)
        .map((relationship) => ({
          value: relationship.id,
          label: relationship.name,
          icon: <UsersIcon className="size-5 text-[#5B5B5B]" />,
          isManageable:
            Boolean(resolvedCurrentContactId) &&
            relationship.createdById === resolvedCurrentContactId,
        })),
    [availableRelationshipsResponse, resolvedCurrentContactId],
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
  const giftInviteShareUrl = useMemo(
    () =>
      giftingEventId
        ? buildSignedInInviteUrl(`/dashboard/gifts/${giftingEventId}`)
        : "",
    [giftingEventId],
  );
  const giftInviteShareMessage = useMemo(
    () =>
      buildInviteShareMessage(
        currentEventRow?.eventName || giftEventName || "this gifting event",
        giftInviteShareUrl || "",
      ),
    [currentEventRow?.eventName, giftEventName, giftInviteShareUrl],
  );
  const giftInviteLockedEmails = useMemo(
    () =>
      Array.from(
        new Set(
          (currentEventRow?.participants ?? [])
            .map((participant) => participant.email?.trim() || "")
            .filter(Boolean),
        ),
      ),
    [currentEventRow?.participants],
  );
  const contactRecordOptions = useMemo(
    () =>
      mergeRecordItems(
        currentEventRow?.participantRecordItems ?? [],
        customContactRecordItems,
        Object.values(selectedParticipantRecordsById),
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
      selectedParticipantRecordsById,
    ],
  );
  const selectedParticipantReviewItems = useMemo(
    () =>
      selectedParticipantContactIds
        .map((selectedId) =>
          contactRecordOptions.find((record) => record.id === selectedId),
        )
        .filter((item): item is SearchableRecordItem => Boolean(item))
        .map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email || item.subtitle || "",
          isAdmin: false,
          actionLabel:
            isGroupGifting &&
            Boolean(item.isManageable) &&
            getMissingGiftContactFields(item).length > 0
              ? "Update details"
              : undefined,
        })),
    [
      contactRecordOptions,
      isGroupGifting,
      recipientDetailsByContactId,
      selectedParticipantContactIds,
    ],
  );
  const giftAssignmentRecipients = useMemo(
    () =>
      isGiftingMyself
        ? [
            {
              key: "creator",
              name:
                [authUser?.firstName?.trim(), authUser?.lastName?.trim()]
                  .filter(Boolean)
                  .join(" ") || "You",
              email: authUser?.email?.trim() || "",
              profileUrl: authUser?.profile?.profilePhotoUrl?.trim() || null,
            },
          ]
        : selectedParticipantContactIds
            .map((selectedId) =>
              contactRecordOptions.find((record) => record.id === selectedId),
            )
            .filter((item): item is SearchableRecordItem => Boolean(item))
            .map((item) => ({
              key: item.id,
              name: item.name,
              email: item.email || item.subtitle || "",
              profileUrl: item.profileUrl || null,
            })),
    [
      authUser?.email,
      authUser?.firstName,
      authUser?.lastName,
      authUser?.profile?.profilePhotoUrl,
      contactRecordOptions,
      isGiftingMyself,
      selectedParticipantContactIds,
    ],
  );
  const selectedGiftPreviewProducts = useMemo(
    () =>
      selectedGiftIds
        .map((selectedId) => selectedGiftProductsById[selectedId])
        .filter((product): product is MarketplaceProduct => Boolean(product)),
    [selectedGiftIds, selectedGiftProductsById],
  );
  const activeGiftAssignmentProduct = useMemo(
    () =>
      activeGiftAssignmentProductId
        ? selectedGiftProductsById[activeGiftAssignmentProductId] ?? null
        : null,
    [activeGiftAssignmentProductId, selectedGiftProductsById],
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
    if (!selectedParticipantContactIds.length) {
      return;
    }

    const resolvedSelectedRecordsById = selectedParticipantContactIds.reduce<
      Record<string, SearchableRecordItem>
    >((accumulator, selectedId) => {
      const matchingRecord = contactRecordOptions.find(
        (record) => record.id === selectedId,
      );

      if (matchingRecord) {
        accumulator[selectedId] = matchingRecord;
      } else if (selectedParticipantRecordsById[selectedId]) {
        accumulator[selectedId] = selectedParticipantRecordsById[selectedId];
      }

      return accumulator;
    }, {});

    if (Object.keys(resolvedSelectedRecordsById).length === 0) {
      return;
    }

    setSelectedParticipantRecordsById(
      flowSelectionKey,
      resolvedSelectedRecordsById,
    );
  }, [
    contactRecordOptions,
    flowSelectionKey,
    selectedParticipantContactIds,
    selectedParticipantRecordsById,
    setSelectedParticipantRecordsById,
  ]);

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

  useEffect(() => {
    setCustomGiftBudgetMinimum(
      selectedMinimumGiftBudget ? String(selectedMinimumGiftBudget) : "",
    );
    setCustomGiftBudgetMaximum(
      selectedMaximumGiftBudget ? String(selectedMaximumGiftBudget) : "",
    );
  }, [selectedMaximumGiftBudget, selectedMinimumGiftBudget]);

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
  const giftSelectionReturnHref =
    eventId && giftingEventId
      ? `/dashboard/gifts/flow/gift-selection?mode=${mode}&eventId=${eventId}&giftingEventId=${giftingEventId}&tab=events`
      : "/dashboard/gifts?tab=events";

  const handleViewGiftRow = (row: GiftRow) => {
    const params = new URLSearchParams({
      tab: activeTab,
    });
    const routeGiftId =
      activeTab === "sent"
        ? row.participantGiftId?.trim() || row.id
        : row.id;

    if (activeTab === "sent") {
      if (row.eventId) {
        params.set("eventId", row.eventId);
      }

      if (row.participantGiftId) {
        params.set("participantGiftId", row.participantGiftId);
      }
    }

    router.push(
      `/dashboard/gifts/item/${encodeURIComponent(routeGiftId)}?${params.toString()}`,
    );
  };

  const handleToggleReceivedGiftFulfillment = (row: GiftRow) => {
    setPendingFulfillmentGiftRow(row);
    setPendingFulfillmentTarget(!row.isFulfilled);
  };

  const handleConfirmToggleGiftFulfillment = async () => {
    if (!pendingFulfillmentGiftRow || pendingFulfillmentTarget === null) {
      return;
    }

    try {
      await updateGiftFulfillmentMutation.mutateAsync({
        giftId: pendingFulfillmentGiftRow.id,
        payload: {
          isFulfilled: pendingFulfillmentTarget,
        },
      });

      toast.success(
        pendingFulfillmentTarget
          ? "Gift marked as fulfilled."
          : "Gift marked as not fulfilled.",
      );
      setPendingFulfillmentGiftRow(null);
      setPendingFulfillmentTarget(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this gift right now.",
      );
    }
  };

  const handleOpenGiftFlow = () => {
    resetGiftFlowSelection(buildGiftFlowSelectionKey("create", null, null));
    openGiftFlowModal("recipient-choice", "create", null, null);
  };

  const handleRequestCloseGiftFlow = () => {
    if (currentGiftFlowStep === "invite") {
      closeGiftFlowModal();
      return;
    }

    setIsDiscardGiftFlowConfirmationOpen(true);
  };

  const handleConfirmDiscardGiftFlow = () => {
    resetGiftFlowSelection(flowSelectionKey);
    setIsDiscardGiftFlowConfirmationOpen(false);
    closeGiftFlowModal();
  };

  const handleGiftRecipientChoiceSelect = (
    value: GiftRecipientChoiceValue,
  ) => {
    setGiftFlowDraftFields(flowSelectionKey, {
      celebrationTarget: value,
    });
    setGiftFlowStep(
      value === "myself" ? "event" : "source",
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleGiftSourceNext = () => {
    setGiftFlowStep(
      eventId ? "record" : "event",
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleBrowseGifts = () => {
    resetGiftFlowSelection(buildGiftFlowSelectionKey("create", null, null));
    router.push(
      "/dashboard/gifts/flow/gift-selection?mode=create&tab=events&browse=true",
      { scroll: false },
    );
  };

  const handleViewBrowseGiftProduct = (product: MarketplaceProduct) => {
    router.push(
      `/dashboard/gifts/product/${encodeURIComponent(product._id)}?backHref=${encodeURIComponent("/dashboard/gifts/flow/gift-selection?mode=create&tab=events&browse=true")}`,
      { scroll: false },
    );
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
      celebrationTarget: sourceSelection.celebrationTarget,
      selectedBudgetOption:
        sourceSelection.selectedBudgetOption ||
        deriveGiftBudgetOption(row.minimumGiftBudget, row.maximumGiftBudget),
      minimumGiftBudget:
        sourceSelection.minimumGiftBudget ?? row.minimumGiftBudget,
      maximumGiftBudget:
        sourceSelection.maximumGiftBudget ?? row.maximumGiftBudget,
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
        : "recipient-choice";

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

  const promoteGiftFlowSelection = (
    nextEventId: string,
    nextGiftingEventId: string,
    lastVisitedStep: GiftModalStep,
  ) => {
    const nextFlowKey = buildGiftFlowSelectionKey(
      "create",
      nextGiftingEventId,
      nextEventId,
    );

    setGiftFlowDraftFields(nextFlowKey, {
      lastVisitedStep,
      selectedEventTypeId: selectedGiftEventTypeId,
      eventDate: selectedGiftEventDate,
      eventName:
        giftEventName.trim() ||
        selectedEventTypeOption?.label ||
        "Untitled event",
    });

    if (selectedParticipantContactIds.length) {
      setSelectedParticipantContactIds(nextFlowKey, selectedParticipantContactIds);
    }

    if (selectedGiftIds.length) {
      setStoredSelectedGiftIds(nextFlowKey, selectedGiftIds);
    }

    if (Object.keys(selectedGiftProductsById).length) {
      setSelectedGiftProductsById(nextFlowKey, selectedGiftProductsById);
    }

    if (Object.keys(giftRecipientQuantitiesById).length) {
      setGiftRecipientQuantitiesById(nextFlowKey, giftRecipientQuantitiesById);
    }

    if (flowSelectionKey !== nextFlowKey) {
      resetGiftFlowSelection(flowSelectionKey);
    }
  };

  const handleGiftFlowEventNext = () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    const resolvedEventDate = selectedGiftEventDate || getTodayDateInputValue();

    setGiftFlowDraftFields(flowSelectionKey, {
      selectedEventTypeId: selectedEventTypeOption.value,
      eventDate: resolvedEventDate,
      eventName:
        giftEventName.trim() ||
        selectedEventTypeOption.label ||
        "Untitled event",
    });
    setGiftFlowStep("budget", mode, eventId, giftingEventId);
  };

  const handleGiftFlowEventSaveAndContinue = async () => {
    if (!selectedEventTypeOption) {
      toast.error("Please select an event first.");
      return;
    }

    if (isGiftingMyself) {
      const resolvedEventDate = selectedGiftEventDate || getTodayDateInputValue();

      setGiftFlowDraftFields(flowSelectionKey, {
        selectedEventTypeId: selectedEventTypeOption.value,
        eventDate: resolvedEventDate,
        eventName:
          giftEventName.trim() ||
          selectedEventTypeOption.label ||
          "Untitled event",
      });
      setGiftFlowStep("budget", mode, eventId, giftingEventId);
      return;
    }

    try {
      if (mode === "edit") {
        if (!giftingEventId) {
          toast.error("Unable to resolve this gifting event right now.");
          return;
        }

        const response = await updateGiftingEventMutation.mutateAsync({
          id: giftingEventId,
          payload: {
            event: {
              title:
                giftEventName.trim() ||
                selectedEventTypeOption.label ||
                "Untitled event",
              eventTypeId: selectedEventTypeOption.value,
              eventDate: toIsoDate(
                selectedGiftEventDate || getTodayDateInputValue(),
              ),
            },
          },
        });

        toast.success(response.message);
        setGiftFlowDraftFields(flowSelectionKey, {
          selectedEventTypeId: selectedEventTypeOption.value,
          eventDate: selectedGiftEventDate || getTodayDateInputValue(),
          eventName:
            giftEventName.trim() ||
            selectedEventTypeOption.label ||
            "Untitled event",
        });
        setGiftFlowStep("budget", mode, eventId, giftingEventId);
        return;
      }

      const response = await createGiftingEventMutation.mutateAsync({
        event: {
          title:
            giftEventName.trim() ||
            selectedEventTypeOption.label ||
            "Untitled event",
          eventTypeId: selectedEventTypeOption.value,
          eventDate: toIsoDate(selectedGiftEventDate || getTodayDateInputValue()),
        },
      });
      const nextGiftingEventId = response.data.id;
      const nextEventId = response.data.eventId;

      promoteGiftFlowSelection(nextEventId, nextGiftingEventId, "budget");
      toast.success(response.message);
      setGiftFlowStep(
        "budget",
        "create",
        nextEventId,
        nextGiftingEventId,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save this gifting event right now.",
      );
    }
  };

  const handleGiftBudgetNext = async () => {
    const resolvedBudgetRange = resolveGiftBudgetRange(
      selectedBudgetOption as GiftBudgetOptionKey | "",
      customGiftBudgetMinimum,
      customGiftBudgetMaximum,
    );

    if (
      selectedBudgetOption === "custom" &&
      (!resolvedBudgetRange.minimumGiftBudget ||
        !resolvedBudgetRange.maximumGiftBudget)
    ) {
      toast.error("Please enter both minimum and maximum budgets.");
      return;
    }

    if (
      resolvedBudgetRange.minimumGiftBudget !== null &&
      resolvedBudgetRange.maximumGiftBudget !== null &&
      resolvedBudgetRange.minimumGiftBudget >
        resolvedBudgetRange.maximumGiftBudget
    ) {
      toast.error("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    setGiftFlowDraftFields(flowSelectionKey, {
      minimumGiftBudget: resolvedBudgetRange.minimumGiftBudget,
      maximumGiftBudget: resolvedBudgetRange.maximumGiftBudget,
    });
    setGiftFlowStep("gift-selection", mode, eventId, giftingEventId);
  };

  const handleSaveGiftEventDetails = async () => {
    if (!selectedGiftEventTypeId) {
      toast.error("Please complete all gifting event details.");
      return;
    }

    const resolvedEventDate = selectedGiftEventDate || getTodayDateInputValue();

    if (isGiftingMyself) {
      const resolvedTitle =
        giftEventName.trim() ||
        selectedEventTypeOption?.label ||
        "Untitled event";

      setGiftFlowDraftFields(flowSelectionKey, {
        eventName: resolvedTitle,
        eventDate: resolvedEventDate,
      });
      setGiftFlowStep("budget", mode, eventId, giftingEventId);
      return;
    }

    const resolvedTitle =
      giftEventName.trim() ||
      selectedEventTypeOption?.label ||
      "Untitled event";

    try {
      if (mode === "edit") {
        if (!giftingEventId) {
          toast.error("Unable to resolve this gifting event right now.");
          return;
        }

        const response = await updateGiftingEventMutation.mutateAsync({
          id: giftingEventId,
          payload: {
            event: {
              title: resolvedTitle,
              eventTypeId: selectedGiftEventTypeId,
              eventDate: toIsoDate(resolvedEventDate),
            },
          },
        });

        toast.success(response.message);
        setGiftFlowDraftFields(flowSelectionKey, {
          eventName: resolvedTitle,
          eventDate: resolvedEventDate,
        });
        setGiftFlowStep("source", mode, eventId, giftingEventId);
        return;
      }

      if (giftingEventId) {
        const response = await updateGiftingEventMutation.mutateAsync({
          id: giftingEventId,
          payload: {
            event: {
              title: resolvedTitle,
              eventTypeId: selectedGiftEventTypeId,
              eventDate: toIsoDate(resolvedEventDate),
            },
          },
        });

        toast.success(response.message);
        setGiftFlowDraftFields(flowSelectionKey, {
          eventName: resolvedTitle,
          eventDate: resolvedEventDate,
        });
        setGiftFlowStep("source", mode, eventId, giftingEventId);
        return;
      }

      const response = await createGiftingEventMutation.mutateAsync({
        event: {
          title: resolvedTitle,
          eventTypeId: selectedGiftEventTypeId,
          eventDate: toIsoDate(resolvedEventDate),
        },
      });
      const nextGiftingEventId = response.data.id;
      const nextEventId = response.data.eventId;

      promoteGiftFlowSelection(nextEventId, nextGiftingEventId, "source");
      toast.success(response.message);
      setGiftFlowStep("source", "create", nextEventId, nextGiftingEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save this gifting event right now.",
      );
    }
  };

  const activeContactMutationPending =
    createContactMutation.isPending || updateContactMutation.isPending;
  const isSaveNewColleagueDisabled =
    !newColleagueForm.gender ||
    !newColleagueForm.firstName.trim() ||
    !newColleagueForm.lastName.trim();

  const handleOpenAddNewColleague = (
    returnStep: "record" | "review-records" = "record",
  ) => {
    setEditingRecordId(null);
    setAddRecordReturnStep(returnStep);
    setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
    setGiftFlowStep("add-record", mode, eventId, giftingEventId);
  };

  const handleOpenEditColleague = (
    item: SearchableRecordItem,
    returnStep: "record" | "review-records" = "record",
  ) => {
    setEditingRecordId(item.id);
    setAddRecordReturnStep(returnStep);
    setNewColleagueForm({
      gender: item.gender || "",
      ageRange: item.ageRange || "",
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
        ageRange: newColleagueForm.ageRange || undefined,
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
        setSelectedParticipantContactIds(
          flowSelectionKey,
          isGroupGifting
            ? Array.from(
                new Set([
                  ...selectedParticipantContactIds,
                  response.data.id,
                ]),
              )
            : [response.data.id],
        );
      }

      setEditingRecordId(null);
      setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
      setRecordSearchValue("");
      setDebouncedRecordSearchValue("");
      toast.success(response.message);
      if (addRecordReturnStep === "record") {
        setIsGiftRecordPickerOpen(true);
      }
      setGiftFlowStep(addRecordReturnStep, mode, eventId, giftingEventId);
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
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete contact right now.",
      );
    }
  };

  const handleOpenOnedaBusinessStep = () => {
    if (!authToken || !onedaAccountId) {
      toast.error("Your Oneda business details are not available right now.");
      return;
    }

    setGiftFlowStep("oneda-business", mode, eventId, giftingEventId);
  };

  const toSingleSelection = (ids: string[]) => {
    const nextSelectedId = ids
      .map((id) => id.trim())
      .filter(Boolean)
      .at(-1);

    return nextSelectedId ? [nextSelectedId] : [];
  };

  const handleSelectedOnedaBusinessIdsChange = (ids: string[]) => {
    const selectedId = ids.at(-1)?.trim() ?? "";
    const selectedBusiness = onedaBusinessOptions.find(
      (business) => business.id === selectedId,
    );

    setGiftFlowDraftFields(flowSelectionKey, {
      selectedOnedaBusinessIds: selectedBusiness ? [selectedBusiness.id] : [],
      selectedOnedaContactIds: [],
    });
  };

  const handleOnedaBusinessNext = () => {
    if (!selectedOnedaBusinessId) {
      return;
    }

    setGiftFlowStep("oneda-contact", mode, eventId, giftingEventId);
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
      const importedRecords = response.data.map((contact) =>
        mapContactToRecordItem(contact, resolvedCurrentContactId),
      );
      const importedRecordIds = isGroupGifting
        ? importedRecords.map((record) => record.id)
        : toSingleSelection(importedRecords.map((record) => record.id));

      setCustomContactRecordItems((current) =>
        mergeRecordItems(current, importedRecords),
      );
      setSelectedParticipantContactIds(flowSelectionKey, importedRecordIds);
      setRecordSearchValue("");
      setDebouncedRecordSearchValue("");
      toast.success(response.message);
      setGiftFlowStep("record", mode, eventId, giftingEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to import business contacts right now.",
      );
    }
  };

  const handleRecordNext = () => {
    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant.");
      return;
    }

    setGiftFlowStep("review-records", mode, eventId, giftingEventId);
  };

  function getMissingGiftContactFields(
    item: SearchableRecordItem | null | undefined,
  ): MissingGiftContactField[] {
    if (!item) {
      return [];
    }

    const localDetails = recipientDetailsByContactId[item.id];
    const resolvedGender = localDetails?.gender || item.gender || "";
    const resolvedAgeRange = localDetails?.ageRange || item.ageRange || "";
    const resolvedRelationshipId =
      localDetails?.relationshipId || item.relationshipId || "";

    const missingFields: MissingGiftContactField[] = [];

    if (!resolvedGender.trim()) {
      missingFields.push("gender");
    }

    if (!resolvedAgeRange.trim()) {
      missingFields.push("ageRange");
    }

    if (!resolvedRelationshipId.trim()) {
      missingFields.push("relationship");
    }

    return missingFields;
  }

  function canManageGiftRecipientDetails(
    item: SearchableRecordItem | null | undefined,
  ) {
    return Boolean(item?.isManageable);
  }

  const getGiftNextStepAfterParticipantsReview = (): GiftModalStep => {
    if (!selectedGiftEventTypeId) {
      return "event";
    }

    return "budget";
  };

  const getGiftNextStepAfterContactDetails = (): GiftModalStep => {
    if (isGroupGifting) {
      return "review-records";
    }

    return getGiftNextStepAfterParticipantsReview();
  };

  const handleGiftGenderBack = () => {
    if (isGroupGifting) {
      setGiftFlowDraftFields(flowSelectionKey, {
        activeRecipientContactId: "",
      });
      setGiftFlowStep("review-records", mode, eventId, giftingEventId);
      return;
    }

    setGiftFlowStep("review-records", mode, eventId, giftingEventId);
  };

  const handleGiftAgeRangeBack = () => {
    if (isGroupGifting && hasSelectedGiftRecipientGender) {
      setGiftFlowDraftFields(flowSelectionKey, {
        activeRecipientContactId: "",
      });
      setGiftFlowStep("review-records", mode, eventId, giftingEventId);
      return;
    }

    setGiftFlowStep("gender", mode, eventId, giftingEventId);
  };

  const handleGiftRelationshipBack = () => {
    if (isGroupGifting && hasSelectedGiftRecipientAgeRange) {
      if (hasSelectedGiftRecipientGender) {
        setGiftFlowDraftFields(flowSelectionKey, {
          activeRecipientContactId: "",
        });
        setGiftFlowStep("review-records", mode, eventId, giftingEventId);
        return;
      }
    }

    if (!hasSelectedGiftRecipientAgeRange) {
      setGiftFlowStep("age-range", mode, eventId, giftingEventId);
      return;
    }

    if (!hasSelectedGiftRecipientGender) {
      setGiftFlowStep("gender", mode, eventId, giftingEventId);
      return;
    }

    setGiftFlowDraftFields(flowSelectionKey, {
      activeRecipientContactId: "",
    });
    setGiftFlowStep("review-records", mode, eventId, giftingEventId);
  };

  const handleGiftParticipantsNext = () => {
    if (!selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant.");
      return;
    }

    if (isGroupGifting) {
      const nextItemWithMissingDetails = selectedParticipantContactIds
        .map(
          (contactId) =>
            contactRecordOptions.find((record) => record.id === contactId) ??
            null,
        )
        .find((item) => {
          if (
            !item ||
            !canManageGiftRecipientDetails(item) ||
            skippedGiftContactDetailsPromptIds.includes(item.id)
          ) {
            return false;
          }

          return getMissingGiftContactFields(item).length > 0;
        });

      if (nextItemWithMissingDetails) {
        setPendingGiftContactDetailsPrompt({
          item: nextItemWithMissingDetails,
          missingFields: getMissingGiftContactFields(nextItemWithMissingDetails),
        });
        return;
      }
    } else {
      const selectedContactId = selectedParticipantContactIds[0];
      const selectedItem =
        contactRecordOptions.find((record) => record.id === selectedContactId) ??
        null;
      const missingFields = getMissingGiftContactFields(selectedItem);

      if (
        selectedItem &&
        canManageGiftRecipientDetails(selectedItem) &&
        missingFields.length > 0 &&
        !skippedGiftContactDetailsPromptIds.includes(selectedItem.id)
      ) {
        setPendingGiftContactDetailsPrompt({
          item: selectedItem,
          missingFields,
        });
        return;
      }
    }

    setGiftFlowDraftFields(flowSelectionKey, {
      activeRecipientContactId: "",
    });
    setGiftFlowStep(
      getGiftNextStepAfterParticipantsReview(),
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleSkipGiftContactDetailsPrompt = () => {
    const pendingPromptItemId = pendingGiftContactDetailsPrompt?.item.id;
    const nextSkippedIds = pendingPromptItemId
      ? skippedGiftContactDetailsPromptIds.includes(pendingPromptItemId)
        ? skippedGiftContactDetailsPromptIds
        : [...skippedGiftContactDetailsPromptIds, pendingPromptItemId]
      : skippedGiftContactDetailsPromptIds;

    if (pendingPromptItemId) {
      setSkippedGiftContactDetailsPromptIds((current) =>
        current.includes(pendingPromptItemId)
          ? current
          : [...current, pendingPromptItemId],
      );
    }

    if (isGroupGifting) {
      const nextItemWithMissingDetails = selectedParticipantContactIds
        .map(
          (contactId) =>
            contactRecordOptions.find((record) => record.id === contactId) ??
            null,
        )
        .find((item) => {
          if (
            !item ||
            !canManageGiftRecipientDetails(item) ||
            nextSkippedIds.includes(item.id)
          ) {
            return false;
          }

          return getMissingGiftContactFields(item).length > 0;
        });

      if (nextItemWithMissingDetails) {
        setPendingGiftContactDetailsPrompt({
          item: nextItemWithMissingDetails,
          missingFields: getMissingGiftContactFields(nextItemWithMissingDetails),
        });
        return;
      }

      setPendingGiftContactDetailsPrompt(null);
      setGiftFlowStep(
        getGiftNextStepAfterParticipantsReview(),
        mode,
        eventId,
        giftingEventId,
      );
      return;
    }

    setPendingGiftContactDetailsPrompt(null);
    setGiftFlowStep(
      getGiftNextStepAfterContactDetails(),
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleUpdateGiftContactDetailsFromPrompt = () => {
    if (!pendingGiftContactDetailsPrompt) {
      return;
    }

    const shouldOpenGender = pendingGiftContactDetailsPrompt.missingFields.includes(
      "gender",
    );
    const shouldOpenAgeRange =
      pendingGiftContactDetailsPrompt.missingFields.includes("ageRange");

    setPendingGiftContactDetailsPrompt(null);
    setGiftFlowStep(
      shouldOpenGender
        ? "gender"
        : shouldOpenAgeRange
          ? "age-range"
          : "relationship",
      mode,
      eventId,
      giftingEventId,
    );
  };

  const persistActiveRecipientDraftDetails = async (
    overrides?: Partial<{
      gender: "male" | "female" | "";
      ageRange: string;
      relationshipId: string;
    }>,
  ) => {
    const selectedRecord = selectedParticipantRecord;
    const contactId = selectedParticipantRecord?.id?.trim();

    if (!contactId || !selectedRecord) {
      return null;
    }

    const canManageSelectedRecipient =
      canManageGiftRecipientDetails(selectedRecord);

    const nextDetails = {
      gender:
        overrides?.gender ??
        selectedRecipientGender ??
        selectedRecord.gender ??
        "",
      ageRange:
        overrides?.ageRange ??
        selectedRecipientAgeRange ??
        selectedRecord.ageRange ??
        "",
      relationshipId:
        overrides?.relationshipId ??
        selectedRecipientRelationshipId ??
        selectedRecord.relationshipId ??
        "",
    };

    if (isGroupGifting) {
      if (!canManageSelectedRecipient) {
        return null;
      }

      const contactUpdatePayload: {
        gender?: "male" | "female";
        ageRange?: string;
      } = {};

      if (typeof overrides?.gender !== "undefined" && overrides.gender) {
        contactUpdatePayload.gender = overrides.gender;
      }

      if (typeof overrides?.ageRange !== "undefined" && overrides.ageRange) {
        contactUpdatePayload.ageRange = overrides.ageRange;
      }

      if (Object.keys(contactUpdatePayload).length > 0) {
        await updateContactMutation.mutateAsync({
          id: contactId,
          payload: contactUpdatePayload,
        });
      }

      if (
        typeof overrides?.relationshipId !== "undefined" &&
        overrides.relationshipId
      ) {
        await updateContactConnectionMutation.mutateAsync({
          id: contactId,
          payload: {
            relationshipId: overrides.relationshipId,
          },
        });
      }
    }

    setGiftFlowDraftFields(flowSelectionKey, {
      recipientDetailsByContactId: {
        ...recipientDetailsByContactId,
        [contactId]: {
          gender: nextDetails.gender,
          ageRange: nextDetails.ageRange,
          relationshipId: nextDetails.relationshipId,
        },
      },
    });

    return nextDetails;
  };

  const handleOpenGroupRecipientDetails = (contactId: string) => {
    const selectedItem =
      contactRecordOptions.find((record) => record.id === contactId) ?? null;

    if (!selectedItem || !canManageGiftRecipientDetails(selectedItem)) {
      return;
    }

    const missingFields = getMissingGiftContactFields(selectedItem);

    setGiftFlowDraftFields(flowSelectionKey, {
      activeRecipientContactId: contactId,
    });

    setGiftFlowStep(
      missingFields.includes("gender")
        ? "gender"
        : missingFields.includes("ageRange")
          ? "age-range"
          : "relationship",
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleGiftGenderNext = async () => {
    if (!selectedRecipientGender) {
      toast.error("Please select a gender.");
      return;
    }

    try {
      await persistActiveRecipientDraftDetails({
        gender: selectedRecipientGender,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this contact right now.",
      );
      return;
    }

    if (!selectedRecipientAgeRange) {
      setGiftFlowStep("age-range", mode, eventId, giftingEventId);
      return;
    }

    if (!selectedRecipientRelationshipId) {
      setGiftFlowStep("relationship", mode, eventId, giftingEventId);
      return;
    }

    if (isGroupGifting) {
      setGiftFlowDraftFields(flowSelectionKey, {
        activeRecipientContactId: "",
      });
    }

    setGiftFlowStep(
      getGiftNextStepAfterContactDetails(),
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleGiftAgeRangeNext = async () => {
    if (!selectedRecipientAgeRange) {
      toast.error("Please select an age range.");
      return;
    }

    try {
      await persistActiveRecipientDraftDetails({
        ageRange: selectedRecipientAgeRange,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this contact right now.",
      );
      return;
    }

    if (!selectedRecipientRelationshipId) {
      setGiftFlowStep("relationship", mode, eventId, giftingEventId);
      return;
    }

    if (isGroupGifting) {
      setGiftFlowDraftFields(flowSelectionKey, {
        activeRecipientContactId: "",
      });
    }

    setGiftFlowStep(
      getGiftNextStepAfterContactDetails(),
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleGiftRelationshipNext = async () => {
    if (!selectedRecipientRelationshipId) {
      toast.error("Please select a relationship to continue.");
      return;
    }

    try {
      await persistActiveRecipientDraftDetails({
        relationshipId: selectedRecipientRelationshipId,
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update this contact right now.",
      );
      return;
    }

    if (isGroupGifting) {
      setGiftFlowDraftFields(flowSelectionKey, {
        activeRecipientContactId: "",
      });
    }

    setGiftFlowStep(
      getGiftNextStepAfterContactDetails(),
      mode,
      eventId,
      giftingEventId,
    );
  };

  const handleCreateRelationshipOption = async (label: string) => {
    const response = await createRelationshipMutation.mutateAsync({
      name: label.trim(),
      description: "",
      isActive: true,
    });

    if (!response.data) {
      return;
    }

    return {
      value: response.data.id,
      label: response.data.name,
      icon: <UsersIcon className="size-5 text-[#5B5B5B]" />,
      isManageable: true,
    } satisfies OverlaySelectOption;
  };

  const handleUpdateRelationshipOption = async (
    option: OverlaySelectOption,
    label: string,
  ) => {
    const response = await updateRelationshipMutation.mutateAsync({
      id: option.value,
      payload: {
        name: label.trim(),
        description: "",
        isActive: true,
      },
    });

    if (!response.data) {
      return;
    }

    return {
      value: response.data.id,
      label: response.data.name,
      icon: <UsersIcon className="size-5 text-[#5B5B5B]" />,
      isManageable: true,
    } satisfies OverlaySelectOption;
  };

  const handleDeleteRelationshipOption = async (option: OverlaySelectOption) => {
    await deleteRelationshipMutation.mutateAsync(option.value);
  };

  const resolveGiftSelectionContext = () => {
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

    return {
      selectedProducts,
    };
  };

  const buildGiftingSetupPayload = (): GiftingEventSetupPayload | null => {
    const resolvedEventTypeId =
      selectedGiftEventTypeId ||
      selectedEventTypeOption?.value ||
      legacyEventTypeId ||
      "";

    if (!resolvedEventTypeId) {
      toast.error("Please select an event first.");
      return null;
    }

    const resolvedEventDate =
      selectedGiftEventDate?.trim() || getTodayDateInputValue();
    const resolvedTitle =
      giftEventName.trim() ||
      selectedEventTypeOption?.label ||
      "Untitled event";
    const resolvedBudgetRange = resolveGiftBudgetRange(
      selectedBudgetOption as GiftBudgetOptionKey | "",
      customGiftBudgetMinimum,
      customGiftBudgetMaximum,
    );
    const selectionContext = resolveGiftSelectionContext();

    if (!selectionContext) {
      return null;
    }

    if (
      selectedBudgetOption === "custom" &&
      (!resolvedBudgetRange.minimumGiftBudget ||
        !resolvedBudgetRange.maximumGiftBudget)
    ) {
      toast.error("Please enter both minimum and maximum budgets.");
      return null;
    }

    if (
      resolvedBudgetRange.minimumGiftBudget !== null &&
      resolvedBudgetRange.maximumGiftBudget !== null &&
      resolvedBudgetRange.minimumGiftBudget >
        resolvedBudgetRange.maximumGiftBudget
    ) {
      toast.error("Minimum budget cannot be greater than maximum budget.");
      return null;
    }

    if (!isGiftingMyself && !selectedParticipantContactIds.length) {
      toast.error("Please select at least one participant first.");
      return null;
    }

    const participants = isGiftingMyself
      ? []
      : selectedParticipantContactIds.map((contactId, index) => ({
          clientRef: `p${index + 1}`,
          contactId,
          isNotified: true,
        }));

    let giftAssignments: GiftingEventGiftAssignmentPayload[];

    if (isGiftingMyself) {
      giftAssignments = [
        {
          giverRef: "creator",
          recipientRefs: ["creator"],
          gifts: selectionContext.selectedProducts.map((product) => ({
            participantGiftId: product._id,
            quantity: Math.max(
              1,
              giftRecipientQuantitiesById[product._id]?.creator ?? 1,
            ),
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
        },
      ];
    } else {
      const candidateAssignments = selectionContext.selectedProducts.map(
        (product): GiftingEventGiftAssignmentPayload | null => {
          const quantitiesByRecipient =
            giftRecipientQuantitiesById[product._id] ?? {};
          const activeRecipients = participants.filter(
            (participant) =>
              (quantitiesByRecipient[participant.contactId] ?? 1) > 0,
          );

          if (!activeRecipients.length) {
            return null;
          }

          const totalQuantity = activeRecipients.reduce(
            (sum, participant) =>
              sum + (quantitiesByRecipient[participant.contactId] ?? 1),
            0,
          );

          return {
            giverRef: "creator",
            recipientRefs: activeRecipients.map(
              (participant) => participant.clientRef,
            ),
            gifts: [
              {
                participantGiftId: product._id,
                quantity: totalQuantity,
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
              },
            ],
          };
        },
      );

      giftAssignments = candidateAssignments.filter(
        (
          assignment,
        ): assignment is GiftingEventGiftAssignmentPayload =>
          assignment !== null,
      );
    }

    return {
      event: {
        title: resolvedTitle,
        description: "",
        eventTypeId: resolvedEventTypeId,
        eventDate: toIsoDate(resolvedEventDate),
      },
      gifting: {
        minimumGiftBudget: resolvedBudgetRange.minimumGiftBudget ?? undefined,
        maximumGiftBudget: resolvedBudgetRange.maximumGiftBudget ?? undefined,
        currency: "NGN",
        giftDeadline: toIsoDate(resolvedEventDate),
        allowAnonymousGifting: false,
      },
      participants,
      giftAssignments,
    };
  };

  const syncSelectedGiftRecipientDetails = async () => {
    if (isGiftingMyself || isGroupGifting) {
      return;
    }

    for (const selectedContactId of selectedParticipantContactIds) {
      const localDetails = recipientDetailsByContactId[selectedContactId];

      if (!localDetails) {
        continue;
      }

      const contactUpdatePayload: {
        gender?: "male" | "female";
        ageRange?: string;
      } = {};

      if (localDetails.gender) {
        contactUpdatePayload.gender = localDetails.gender;
      }

      if (localDetails.ageRange) {
        contactUpdatePayload.ageRange = localDetails.ageRange;
      }

      if (Object.keys(contactUpdatePayload).length > 0) {
        await updateContactMutation.mutateAsync({
          id: selectedContactId,
          payload: contactUpdatePayload,
        });
      }

      if (localDetails.relationshipId) {
        await updateContactConnectionMutation.mutateAsync({
          id: selectedContactId,
          payload: {
            relationshipId: localDetails.relationshipId,
          },
        });
      }
    }
  };

  const saveGiftingSetup = async () => {
    const payload = buildGiftingSetupPayload();

    if (!payload) {
      return null;
    }

    await syncSelectedGiftRecipientDetails();

    if (mode === "edit") {
      const resolvedGiftingEventId =
        giftingEventId?.trim() || currentEventRow?.giftingEventId?.trim() || "";

      if (!resolvedGiftingEventId) {
        toast.error("Unable to resolve this gifting event right now.");
        return null;
      }

      return updateGiftingEventSetupMutation.mutateAsync({
        id: resolvedGiftingEventId,
        payload,
      });
    }

    return createGiftingEventSetupMutation.mutateAsync(payload);
  };

  const handleGiftFlowSelectionNext = async () => {
    if (!selectedGiftIds.length) {
      toast.error("Please select at least one gift before continuing.");
      return;
    }

    setGiftFlowStep("review-gifts", mode, eventId, giftingEventId);
  };

  const handleGiftReviewNext = () => {
    if (!selectedGiftPreviewProducts.length) {
      toast.error("Please select at least one gift before continuing.");
      return;
    }

    if (!isGiftingMyself && !giftAssignmentRecipients.length) {
      toast.error("Please select at least one recipient before continuing.");
      return;
    }

    const hasInvalidRecipientAssignment = selectedGiftPreviewProducts.some(
      (product) => {
        const recipientQuantities = giftRecipientQuantitiesById[product._id] ?? {};

        if (isGiftingMyself) {
          return Math.max(1, recipientQuantities.creator ?? 1) <= 0;
        }

        return !giftAssignmentRecipients.some((recipient) => {
          const quantity = recipientQuantities[recipient.key] ?? 0;
          return quantity > 0;
        });
      },
    );

    if (hasInvalidRecipientAssignment) {
      toast.error(
        "Please assign at least one unit of each selected gift before continuing.",
      );
      return;
    }

    setIsCompleteGiftingEventConfirmationOpen(true);
  };

  const handleOpenGiftAssignmentDrawer = (productId: string) => {
    setActiveGiftAssignmentProductId(productId);
  };

  const handleUpdateGiftRecipientQuantity = (
    productId: string,
    recipientKey: string,
    nextQuantity: number,
  ) => {
    const currentQuantities = giftRecipientQuantitiesById[productId] ?? {};
    const normalizedRequestedQuantity = isGiftingMyself
      ? Math.max(1, nextQuantity)
      : Math.max(0, nextQuantity);

    let safeQuantity = normalizedRequestedQuantity;

    if (!isGiftingMyself && normalizedRequestedQuantity === 0) {
      const activeRecipientCount = giftAssignmentRecipients.reduce(
        (count, recipient) =>
          count + ((currentQuantities[recipient.key] ?? 1) > 0 ? 1 : 0),
        0,
      );
      const currentRecipientQuantity = currentQuantities[recipientKey] ?? 1;
      const isCurrentRecipientActive = currentRecipientQuantity > 0;

      if (isCurrentRecipientActive && activeRecipientCount <= 1) {
        safeQuantity = 1;
      }
    }

    const nextQuantitiesById = {
      ...giftRecipientQuantitiesById,
      [productId]: {
        ...currentQuantities,
        [recipientKey]: safeQuantity,
      },
    };

    setGiftRecipientQuantitiesById(flowSelectionKey, nextQuantitiesById);
  };

  const handleConfirmSaveGiftingSetupAsDraft = async () => {
    setIsSavingGiftSetupAsDraft(true);

    try {
      const response = await saveGiftingSetup();

      if (!response) {
        return;
      }

      toast.success(response.message || "Gifting event saved as draft.");
      setIsCompleteGiftingEventConfirmationOpen(false);
      resetGiftFlowSelection(flowSelectionKey);
      closeGiftFlowModal();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save this gifting event right now.",
      );
    } finally {
      setIsSavingGiftSetupAsDraft(false);
    }
  };

  const handleConfirmCompleteGiftingEvent = async () => {
    setIsSavingGiftSetupAndCompleting(true);

    try {
      const setupResponse = await saveGiftingSetup();

      if (!setupResponse) {
        return;
      }

      const nextGiftingEventId = setupResponse.data.id?.trim() || "";
      const nextEventId =
        setupResponse.data.eventId?.trim() ||
        setupResponse.data.event.id?.trim() ||
        "";

      if (!nextGiftingEventId || !nextEventId) {
        toast.error("Unable to resolve this gifting event right now.");
        return;
      }

      const completeResponse =
        await completeGiftingEventMutation.mutateAsync(nextGiftingEventId);

      toast.success(completeResponse.message);
      setIsCompleteGiftingEventConfirmationOpen(false);
      setGiftFlowStep("invite", mode, nextEventId, nextGiftingEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this gifting event right now.",
      );
    } finally {
      setIsSavingGiftSetupAndCompleting(false);
    }
  };

  const handleGiftInviteBack = () => {
    setGiftFlowStep("review-gifts", mode, eventId, giftingEventId);
  };

  const handleGiftInviteSendEmail = () => {
    setIsGiftInviteEmailComposeOpen(true);
  };

  const handleConfirmSendGiftInviteEmails = async ({
    title,
    body,
    emails,
  }: {
    title: string;
    body: string;
    emails: string[];
  }) => {
    const resolvedEventId = eventId?.trim() || currentEventRow?.eventId?.trim() || "";
    const resolvedGiftingEventId = giftingEventId?.trim() || "";

    if (!resolvedEventId || !resolvedGiftingEventId) {
      toast.error("Unable to resolve this gifting event right now.");
      return;
    }

    if (!emails.length) {
      toast.error("No participants are available for invitation yet.");
      return;
    }

    try {
      const response = await sendEmailMutation.mutateAsync({
        eventId: resolvedEventId,
        title,
        body,
        redirectUrl: giftInviteShareUrl || `/dashboard/gifts/${resolvedGiftingEventId}`,
        emails,
        giftingId: resolvedGiftingEventId,
      });
      toast.success(response.message);
      setIsGiftInviteEmailComposeOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to send invitation emails right now.",
      );
    }
  };

  const handleGiftInviteCopyLink = async () => {
    if (!giftInviteShareUrl) {
      toast.error("Unable to resolve this gifting invite right now.");
      return;
    }

    try {
      await navigator.clipboard.writeText(giftInviteShareUrl);
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
    if (currentGiftFlowStep !== "record") {
      setIsGiftRecordPickerOpen(false);
    }
  }, [currentGiftFlowStep]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedEventTypeSearchValue(eventTypeSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [eventTypeSearchValue]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedRelationshipSearchValue(relationshipSearchValue.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [relationshipSearchValue]);

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
    if (
      !isGiftFlowOpen ||
      currentGiftFlowStep !== "gift-selection" ||
      isBrowseGiftsFlow ||
      !cartGiftProducts.length ||
      autoPreselectedCaughtMyEyeFlowKeysRef.current.has(flowSelectionKey)
    ) {
      return;
    }

    autoPreselectedCaughtMyEyeFlowKeysRef.current.add(flowSelectionKey);

    const nextSelectedGiftIds = Array.from(
      new Set([...selectedGiftIds, ...cartGiftProductIds]),
    );
    const nextSelectedGiftProductsById = { ...selectedGiftProductsById };

    cartGiftProducts.forEach((product) => {
      nextSelectedGiftProductsById[product._id] = product;
    });

    setStoredSelectedGiftIds(flowSelectionKey, nextSelectedGiftIds);
    setSelectedGiftProductsById(flowSelectionKey, nextSelectedGiftProductsById);
  }, [
    cartGiftProductIds,
    cartGiftProducts,
    currentGiftFlowStep,
    flowSelectionKey,
    isBrowseGiftsFlow,
    isGiftFlowOpen,
    selectedGiftIds,
    selectedGiftProductsById,
    setSelectedGiftProductsById,
    setStoredSelectedGiftIds,
  ]);

  useEffect(() => {
    if (!isGiftFlowOpen) {
      return;
    }

    if ((currentGiftFlowStep as string) !== "contact-details") {
      return;
    }

    replaceGiftFlowStep("gender", mode, eventId, giftingEventId);
  }, [
    currentGiftFlowStep,
    eventId,
    giftingEventId,
    isGiftFlowOpen,
    mode,
    replaceGiftFlowStep,
  ]);

  const selectedParticipantRecord = useMemo(() => {
    const selectedContactId =
      activeRecipientContactId || selectedParticipantContactIds[0];

    if (!selectedContactId) {
      return null;
    }

    return contactRecordOptions.find((record) => record.id === selectedContactId) ?? null;
  }, [
    activeRecipientContactId,
    contactRecordOptions,
    selectedParticipantContactIds,
  ]);

  const hasSelectedGiftRecipientGender = Boolean(
    (
      recipientDetailsByContactId[selectedParticipantRecord?.id ?? ""]?.gender ||
      selectedParticipantRecord?.gender ||
      ""
    ).trim(),
  );

  const hasSelectedGiftRecipientAgeRange = Boolean(
    (
      recipientDetailsByContactId[selectedParticipantRecord?.id ?? ""]?.ageRange ||
      selectedParticipantRecord?.ageRange ||
      ""
    ).trim(),
  );

  useEffect(() => {
    if (!selectedParticipantRecord) {
      return;
    }

    setGiftFlowDraftFields(flowSelectionKey, {
      recipientGender:
        recipientDetailsByContactId[selectedParticipantRecord.id]?.gender ||
        selectedRecipientGender ||
        selectedParticipantRecord.gender ||
        "",
      recipientAgeRange:
        recipientDetailsByContactId[selectedParticipantRecord.id]?.ageRange ||
        selectedRecipientAgeRange ||
        selectedParticipantRecord.ageRange ||
        "",
      recipientRelationshipId:
        recipientDetailsByContactId[selectedParticipantRecord.id]
          ?.relationshipId ||
        selectedRecipientRelationshipId ||
        selectedParticipantRecord.relationshipId ||
        "",
    });
  }, [
    flowSelectionKey,
    recipientDetailsByContactId,
    selectedParticipantRecord,
    selectedRecipientAgeRange,
    selectedRecipientGender,
    selectedRecipientRelationshipId,
    setGiftFlowDraftFields,
  ]);

  useEffect(() => {
    if (!isGiftFlowOpen) {
      return;
    }

    const recipientKeys = giftAssignmentRecipients.map((recipient) => recipient.key);

    if (!recipientKeys.length || !selectedGiftIds.length) {
      return;
    }

    const nextQuantitiesById: Record<string, Record<string, number>> = {};

    selectedGiftIds.forEach((giftId) => {
      const currentQuantities = giftRecipientQuantitiesById[giftId] ?? {};

      nextQuantitiesById[giftId] = recipientKeys.reduce<
        Record<string, number>
      >((accumulator, recipientKey) => {
        const currentQuantity = currentQuantities[recipientKey];
        accumulator[recipientKey] =
          typeof currentQuantity === "number" && currentQuantity >= 0
            ? currentQuantity
            : 1;
        return accumulator;
      }, {});
    });

    if (
      JSON.stringify(nextQuantitiesById) !==
      JSON.stringify(giftRecipientQuantitiesById)
    ) {
      setGiftRecipientQuantitiesById(flowSelectionKey, nextQuantitiesById);
    }
  }, [
    flowSelectionKey,
    giftAssignmentRecipients,
    giftRecipientQuantitiesById,
    isGiftFlowOpen,
    selectedGiftIds,
    setGiftRecipientQuantitiesById,
  ]);

  const giftSelectionStep = (
    <WishlistGiftSelectionStep
      selectedIds={selectedGiftIds}
      onSelectedIdsChange={(ids) =>
        setStoredSelectedGiftIds(flowSelectionKey, ids)
      }
      onSelectedProductToggle={handleGiftFlowProductToggle}
      onViewProduct={handleViewBrowseGiftProduct}
      onBack={() =>
        isBrowseGiftsFlow
          ? router.push(
              shouldReturnToGiftFlow
                ? giftSelectionReturnHref
                : "/dashboard/gifts?tab=events",
              { scroll: false },
            )
          : setGiftFlowStep(
              isGiftingMyself ? "budget" : "review-records",
              mode,
              eventId,
              giftingEventId,
            )
      }
      onNext={
        isBrowseGiftsFlow
          ? () =>
              router.push(
                shouldReturnToGiftFlow
                  ? giftSelectionReturnHref
                  : "/dashboard/gifts?tab=events",
                { scroll: false },
              )
          : handleGiftFlowSelectionNext
      }
      nextDisabled={
        isBrowseGiftsFlow
          ? false
          : !selectedGiftIds.length ||
            createGiftingEventSetupMutation.isPending ||
            updateGiftingEventSetupMutation.isPending ||
            completeGiftingEventMutation.isPending
      }
      nextLabel={
        isBrowseGiftsFlow
          ? "Done"
          : createGiftingEventSetupMutation.isPending ||
              updateGiftingEventSetupMutation.isPending
            ? "Saving..."
            : "Next"
      }
      hideFooterActions={isBrowseGiftsFlow}
      disableContentScroll={true}
      enableInfiniteScroll={true}
      hideSelectionControls={isBrowseGiftsFlow}
      initialMinimumPrice={selectedMinimumGiftBudget}
      initialMaximumPrice={selectedMaximumGiftBudget}
      maximumSpend={selectedMaximumGiftBudget ?? undefined}
      caughtMyEyeProductIds={caughtMyEyeGiftProductIds}
      prioritizedProductIds={prioritizedGiftProductIds}
      deferProductsUntilInitialSelectionResolved={
        !isBrowseGiftsFlow &&
        (isCartParticipantGiftIdsLoading || isCartParticipantGiftIdsFetching)
      }
      emptyStateText={
        isBrowseGiftsFlow
          ? "No gifts matched your current filters."
          : "No gifts matched your current filters."
      }
    />
  );

  const giftReviewStep = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="space-y-2 pb-5">
        <h2 className="text-[26px] font-semibold leading-tight text-[#1E1E1E] sm:text-[32px]">
          Review selected gifts
        </h2>
        <p className="text-[13px] text-[#5F5A6B] sm:text-[14px]">
          {isGiftingMyself
            ? "Review the gifts you selected for yourself before you save this gifting flow."
            : isGroupGifting
              ? "Manage how each selected gift is shared across the people in this group before you save."
              : "Manage the gift and quantity for this recipient before you save this gifting flow."}
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto pr-1 min-[520px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {selectedGiftPreviewProducts.map((product) => {
          const recipientQuantities = giftRecipientQuantitiesById[product._id] ?? {};
          const totalUnits = Object.values(recipientQuantities).reduce(
            (sum, quantity) => sum + quantity,
            0,
          );
          const activeGiftRecipients = giftAssignmentRecipients.filter(
            (recipient) => (recipientQuantities[recipient.key] ?? 1) > 0,
          );

          return (
            <div
              key={product._id}
              className="mx-auto flex h-full w-full max-w-[290px] min-w-0 flex-col overflow-hidden rounded-[16px] border border-gray-100 bg-white p-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] min-[520px]:max-w-none"
            >
              <div className="relative h-[136px] w-full overflow-hidden rounded-[12px] bg-[#F6F2FB] sm:h-[148px] lg:h-[160px]">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 px-1 pt-2">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight text-[#4E4C4D] sm:text-[16px]">
                      {product.title}
                    </h3>
                    <span className="shrink-0 text-[13px] font-semibold leading-tight tracking-[0.03em] text-darker sm:text-[14px]">
                      {formatCurrency(product.amount)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex w-fit max-w-full items-center truncate rounded-[10px] border border-[#3300C9]/15 bg-[#F3EFFB] px-2 py-0.5 text-[9px] font-medium text-[#3300C9]">
                      {totalUnits} unit{totalUnits === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex w-fit max-w-full items-center truncate rounded-[10px] border border-[#E8E1F6] bg-[#F8F6FD] px-2 py-0.5 text-[9px] font-medium text-[#6F6785]">
                      {activeGiftRecipients.length}{" "}
                      {isGiftingMyself ? "wishlist" : "recipient"}
                      {activeGiftRecipients.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-0.5">
                  <div className="flex items-center -space-x-2">
                    {activeGiftRecipients.map((recipient) => (
                      <UserAvatar
                        key={`${product._id}-${recipient.key}`}
                        name={recipient.name}
                        imageUrl={recipient.profileUrl}
                        className="size-7 border-2 border-white text-[10px]"
                        textClassName="text-[10px]"
                      />
                    ))}
                  </div>

                  <ModalButton
                    type="button"
                    variant="secondary"
                    onClick={() => handleOpenGiftAssignmentDrawer(product._id)}
                    className="inline-flex !h-7 !w-fit rounded-full border border-[#3300C9] bg-white px-3 text-[9px] font-semibold text-[#3300C9] hover:bg-[#F6F2FF] sm:!h-8 sm:px-3.5 sm:text-[10px]"
                  >
                    {isGiftingMyself ? "Update Units" : "Manage Recipients"}
                  </ModalButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#F1EDF9] pt-5 mt-5">
        <div className="flex items-center justify-center gap-3">
          <BackButton
            onClick={() =>
              setGiftFlowStep("gift-selection", mode, eventId, giftingEventId)
            }
            className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
            iconClassName="size-[24px]"
          />
          <ModalButton
            type="button"
            onClick={handleGiftReviewNext}
            className="h-[38px] !w-fit min-w-[96px] px-6"
          >
            Next
          </ModalButton>
        </div>
      </div>
    </div>
  );

  if (
    isGiftFlowOpen &&
    (currentGiftFlowStep === "gift-selection" ||
      currentGiftFlowStep === "review-gifts")
  ) {
    return (
      <div className="space-y-6">
        {isBrowseGiftsFlow ? (
          <div className="inline-flex items-center gap-3 text-[18px] font-semibold text-[#3300C9]">
            <BackButton
              onClick={() =>
                router.push(
                  shouldReturnToGiftFlow
                    ? giftSelectionReturnHref
                    : "/dashboard/gifts?tab=events",
                  { scroll: false },
                )
              }
              ariaLabel="Back to gifts"
              className="rounded-full bg-[#F4F0F8] px-4 text-[#3300C9] transition-colors hover:bg-[#ECE5F5]"
              iconClassName="text-[#3300C9]"
            />
            <span>Gifts</span>
          </div>
        ) : null}

        <div
          className={cn(
            "mx-auto  w-full max-w-[1448px] rounded-[24px] border border-[#F1EDF9] bg-white px-4 py-4 shadow-[0_12px_40px_rgba(29,18,68,0.06)] sm:px-6 sm:py-6 lg:px-8",
            !isBrowseGiftsFlow && " lg:min-h-0",
          )}
        >
          <div
            className={cn(
              !isBrowseGiftsFlow && "h-full min-h-0",
              isBrowseGiftsFlow && "min-h-0",
            )}
          >
            {currentGiftFlowStep === "gift-selection"
              ? giftSelectionStep
              : giftReviewStep}
          </div>
        </div>

        <ConfirmationModal
          open={isCompleteGiftingEventConfirmationOpen}
          onClose={() => setIsCompleteGiftingEventConfirmationOpen(false)}
          onConfirm={handleConfirmCompleteGiftingEvent}
          onSecondaryConfirm={handleConfirmSaveGiftingSetupAsDraft}
          action="save"
          title="Save Gifting Event"
          description="You can save this gifting event as a draft, or save and complete it so you can continue to invite participants."
          confirmText="Save"
          secondaryConfirmText="Save as Draft"
          isLoading={
            isSavingGiftSetupAndCompleting ||
            createGiftingEventSetupMutation.isPending ||
            updateGiftingEventSetupMutation.isPending ||
            completeGiftingEventMutation.isPending
          }
          isSecondaryLoading={isSavingGiftSetupAsDraft}
          closeOnOverlayClick={false}
          closeOnEscape={false}
        />

        <SideDrawer
          open={Boolean(activeGiftAssignmentProduct)}
          onOpenChange={(open) => {
            if (!open) {
              setActiveGiftAssignmentProductId(null);
            }
          }}
          title={
            activeGiftAssignmentProduct?.title ||
            (isGiftingMyself ? "Update Units" : "Manage Recipients")
          }
          description={
            isGiftingMyself
              ? "Adjust how many units of this gift you want to save for yourself."
              : isGroupGifting
                ? "Adjust how many units of this gift are assigned to each person in this group."
                : "Adjust how many units of this gift are assigned to this recipient."
          }
          footer={
            <ModalButton
              type="button"
              onClick={() => setActiveGiftAssignmentProductId(null)}
              className="h-11 w-full rounded-[16px] text-[14px]"
            >
              Done
            </ModalButton>
          }
        >
          <div className="space-y-3">
            {giftAssignmentRecipients.map((recipient) => {
              const quantity =
                activeGiftAssignmentProduct
                  ? giftRecipientQuantitiesById[activeGiftAssignmentProduct._id]?.[
                      recipient.key
                    ] ?? 1
                  : 1;
              const isRecipientDisabled = !isGiftingMyself && quantity === 0;

              return (
                <div
                  key={recipient.key}
                  className={cn(
                    "rounded-[18px] border p-4 transition-colors",
                    isRecipientDisabled
                      ? "border-[#EEEAF7] bg-[#F5F3FA] opacity-65"
                      : "border-[#EEEAF7] bg-[#FCFBFF]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <UserAvatar
                        name={recipient.name}
                        imageUrl={recipient.profileUrl}
                        className="size-11 text-[13px]"
                        textClassName="text-[13px]"
                      />
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "truncate text-[14px] font-semibold",
                            isRecipientDisabled
                              ? "text-[#8B8697]"
                              : "text-[#2F2F33]",
                          )}
                        >
                          {recipient.name}
                        </p>
                        <p
                          className={cn(
                            "truncate text-[12px]",
                            isRecipientDisabled
                              ? "text-[#A7A1B5]"
                              : "text-[#7D7888]",
                          )}
                        >
                          {recipient.email || "Assigned recipient"}
                        </p>
                        {/* {isRecipientDisabled ? (
                          <p className="mt-1 text-[11px] font-medium text-[#9A93AB]">
                            Disabled for this gift
                          </p>
                        ) : null} */}
                      </div>
                    </div>

                    {activeGiftAssignmentProduct ? (
                      <div
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-2 py-1",
                          isRecipientDisabled
                            ? "border-[#E5E0EF] bg-[#F8F6FC]"
                            : "border-[#E8E1F6] bg-white",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateGiftRecipientQuantity(
                              activeGiftAssignmentProduct._id,
                              recipient.key,
                              quantity - 1,
                            )
                          }
                          className={cn(
                            "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                            isRecipientDisabled
                              ? "text-[#8F88A3] hover:bg-[#EEEAF6]"
                              : "text-[#3300C9] hover:bg-[#F3EFFB]",
                          )}
                        >
                          <MinusIcon className="size-4" />
                        </button>
                        <input
                          type="number"
                          min={isGiftingMyself ? 1 : 0}
                          value={quantity}
                          onChange={(event) =>
                            handleUpdateGiftRecipientQuantity(
                              activeGiftAssignmentProduct._id,
                              recipient.key,
                              Number.isNaN(Number(event.target.value))
                                ? isGiftingMyself
                                  ? 1
                                  : 0
                                : Number(event.target.value),
                            )
                          }
                          className={cn(
                            "h-8 w-12 border-0 bg-transparent text-center text-[14px] font-semibold outline-none",
                            isRecipientDisabled
                              ? "text-[#8F88A3]"
                              : "text-[#2F2F33]",
                          )}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateGiftRecipientQuantity(
                              activeGiftAssignmentProduct._id,
                              recipient.key,
                              quantity + 1,
                            )
                          }
                          className={cn(
                            "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                            isRecipientDisabled
                              ? "text-[#8F88A3] hover:bg-[#EEEAF6]"
                              : "text-[#3300C9] hover:bg-[#F3EFFB]",
                          )}
                        >
                          <PlusIcon className="size-4" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </SideDrawer>

      </div>
    );
  }

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
              onClick={handleBrowseGifts}
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
              Gifts Given
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
                          Recipients
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
                            <StatusPill status={row.status} />
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
                            <GiftRowActions
                              row={row}
                              onView={handleViewGiftRow}
                              onToggleFulfillment={
                                isReceivedTab
                                  ? handleToggleReceivedGiftFulfillment
                                  : undefined
                              }
                            />
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
        open={Boolean(pendingFulfillmentGiftRow)}
        onClose={() => {
          setPendingFulfillmentGiftRow(null);
          setPendingFulfillmentTarget(null);
        }}
        onConfirm={handleConfirmToggleGiftFulfillment}
        action="save"
        title={
          pendingFulfillmentTarget
            ? "Mark Gift as Fulfilled"
            : "Mark Gift as Not Fulfilled"
        }
        description={
          pendingFulfillmentGiftRow
            ? `Are you sure you want to ${
                pendingFulfillmentTarget
                  ? "mark this gift as fulfilled"
                  : "mark this gift as not fulfilled"
              }?`
            : "Are you sure you want to update this gift?"
        }
        confirmText={
          pendingFulfillmentTarget
            ? "Mark as Fulfilled"
            : "Mark as Not Fulfilled"
        }
        isLoading={updateGiftFulfillmentMutation.isPending}
      />

      <ConfirmationModal
        open={isCompleteGiftingEventConfirmationOpen}
        onClose={() => setIsCompleteGiftingEventConfirmationOpen(false)}
        onConfirm={handleConfirmCompleteGiftingEvent}
        onSecondaryConfirm={handleConfirmSaveGiftingSetupAsDraft}
        action="save"
        title="Save Gifting Event"
        description="You can save this gifting event as a draft, or save and complete it so you can continue to invite participants."
        confirmText="Save"
        secondaryConfirmText="Save as Draft"
        isLoading={
          isSavingGiftSetupAndCompleting ||
          createGiftingEventSetupMutation.isPending ||
          updateGiftingEventSetupMutation.isPending ||
          completeGiftingEventMutation.isPending
        }
        isSecondaryLoading={isSavingGiftSetupAsDraft}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ContentModal
        open={isGiftFlowOpen && currentGiftFlowStep !== "gift-selection"}
        onClose={handleRequestCloseGiftFlow}
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
              setGiftFlowStep("review-records", mode, eventId, giftingEventId)
            }
            initialMinimumPrice={selectedMinimumGiftBudget}
            initialMaximumPrice={selectedMaximumGiftBudget}
            maximumSpend={selectedMaximumGiftBudget ?? undefined}
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
            onShareFacebook={() =>
              shareInvite({
                platform: "facebook",
                inviteUrl: giftInviteShareUrl,
                message: giftInviteShareMessage,
              })
            }
            onShareWhatsApp={() =>
              shareInvite({
                platform: "whatsapp",
                inviteUrl: giftInviteShareUrl,
                message: giftInviteShareMessage,
              })
            }
            onBack={handleGiftInviteBack}
            onSendEmail={handleGiftInviteSendEmail}
            onCopyLink={handleGiftInviteCopyLink}
            isSendingEmail={sendEmailMutation.isPending}
          />
        ) : currentGiftFlowStep === "budget" ? (
          <GiftBudgetStep
            selectedOption={selectedBudgetOption as GiftBudgetOptionKey | ""}
            customMinimumValue={customGiftBudgetMinimum}
            customMaximumValue={customGiftBudgetMaximum}
            onSelectOption={(value) =>
              setGiftFlowDraftFields(flowSelectionKey, {
                selectedBudgetOption: value,
              })
            }
            onCustomMinimumValueChange={setCustomGiftBudgetMinimum}
            onCustomMaximumValueChange={setCustomGiftBudgetMaximum}
            onBack={() =>
              setGiftFlowStep(
                "event",
                mode,
                eventId,
                giftingEventId,
              )
            }
            onNext={handleGiftBudgetNext}
            nextDisabled={
              !selectedBudgetOption || updateGiftingEventMutation.isPending
            }
            nextLabel={
              updateGiftingEventMutation.isPending ? "Saving..." : "Next"
            }
          />
        ) : currentGiftFlowStep === "recipient-choice" ? (
          <GiftRecipientChoiceStep
            value={selectedCelebrationTarget}
            onChange={handleGiftRecipientChoiceSelect}
          />
        ) : currentGiftFlowStep === "add-record" ? (
          <AddColleagueForm
            values={newColleagueForm}
            onChange={handleNewColleagueChange}
            onBack={() => {
              setEditingRecordId(null);
              setNewColleagueForm(EMPTY_NEW_COLLEAGUE_FORM);
              setGiftFlowStep(
                addRecordReturnStep,
                mode,
                eventId,
                giftingEventId,
              );
            }}
            onSave={handleSaveNewColleague}
            saveDisabled={isSaveNewColleagueDisabled}
            isSaving={activeContactMutationPending}
            saveLabel={editingRecordId ? "Edit" : "Save"}
            savingLabel={editingRecordId ? "Editing" : "Saving"}
          />
        ) : currentGiftFlowStep === "source" ? (
          <div className="space-y-12 pt-2">
            <div className="text-center">
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                {isGroupGifting
                  ? "Who are the Lucky People?"
                  : "Who is the Lucky Person?"}
              </p>
            </div>

            <div className="mx-auto max-w-[494px] space-y-4">
              <ModalButton
                variant="secondary"
                onClick={() =>
                  setGiftFlowStep("record", mode, eventId, giftingEventId)
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
                  setGiftFlowStep(
                    "recipient-choice",
                    mode,
                    eventId,
                    giftingEventId,
                  )
                }
                className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
            </div>
          </div>
        ) : currentGiftFlowStep === "oneda-business" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
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
                      setGiftFlowStep("source", mode, eventId, giftingEventId)
                    }
                    className="flex h-[38px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                    iconClassName="size-[24px]"
                  />
                }
                footer={
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <BackButton
                      onClick={() =>
                        setGiftFlowStep("source", mode, eventId, giftingEventId)
                      }
                      className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
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
        ) : currentGiftFlowStep === "oneda-contact" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                {isGroupGifting
                  ? "Who'd you like to gift?"
                  : "Who'd you like to gift?"}
              </p>
            </div>

            <div className="mx-auto max-w-[494px]">
              <OverlayRecordPicker
                items={onedaProfileOptions}
                selectedIds={selectedOnedaContactIds}
                onSelectedIdsChange={(ids) =>
                  setGiftFlowDraftFields(flowSelectionKey, {
                    selectedOnedaContactIds: isGroupGifting
                      ? ids
                      : toSingleSelection(ids),
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
                      setGiftFlowStep(
                        "oneda-business",
                        mode,
                        eventId,
                        giftingEventId,
                      )
                    }
                    className="flex h-[38px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                    iconClassName="size-[24px]"
                  />
                }
                footer={
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <BackButton
                      onClick={() =>
                        setGiftFlowStep(
                          "oneda-business",
                          mode,
                          eventId,
                          giftingEventId,
                        )
                      }
                      className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                      iconClassName="size-[24px]"
                    />

                    <ModalButton
                      onClick={handleOnedaContactNext}
                      disabled={
                        !selectedOnedaContactIds.length ||
                        createBulkContactsMutation.isPending
                      }
                    >
                      {createBulkContactsMutation.isPending
                        ? "Importing..."
                        : "Next"}
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
        ) : currentGiftFlowStep === "review-records" ? (
        <CustomColleagueReview
          greetingName={greetingName}
          items={selectedParticipantReviewItems}
          prompt="Who would you like to gift?"
          topActionLabel={isGroupGifting ? "Add" : "Replace"}
          topActionIcon={isGroupGifting ? "add" : "replace"}
          onTopAction={() =>
            setGiftFlowStep(
              isGroupGifting ? "source" : "record",
              mode,
              eventId,
              giftingEventId,
            )
          }
          onBack={() =>
            setGiftFlowStep("source", mode, eventId, giftingEventId)
          }
          onNext={handleGiftParticipantsNext}
          onItemAction={
            isGroupGifting ? handleOpenGroupRecipientDetails : undefined
          }
          hideItemActions
          nextDisabled={
            !selectedParticipantReviewItems.length
          }
          nextLabel="Next"
        />
        ) : currentGiftFlowStep === "gender" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                What is{" "}
                {selectedParticipantRecord?.firstName?.trim() || "this person's"}{" "}
                sex?
              </p>
            </div>

            <div className="mx-auto flex max-w-[494px] justify-center">
              <RadioGroup
                value={selectedRecipientGender}
                onValueChange={(value) =>
                  setGiftFlowDraftFields(flowSelectionKey, {
                    recipientGender: value as "male" | "female" | "",
                  })
                }
                className="mx-auto inline-flex w-full max-w-[378px] items-center gap-2 rounded-full bg-[#E7EDC7] p-2"
              >
                {[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ].map((option) => {
                  const isActive = selectedRecipientGender === option.value;

                  return (
                    <label
                      key={option.value}
                      className={cn(
                        "relative flex h-[52px] flex-1 cursor-pointer items-center justify-center rounded-full px-4 text-[16px] font-medium transition-colors sm:text-[17px]",
                        isActive
                          ? "bg-[#3300C9] text-white shadow-[0_8px_20px_rgba(51,0,201,0.18)]"
                          : "bg-transparent text-[#3300C9] hover:bg-white/35",
                      )}
                    >
                      <RadioGroupItem
                        value={option.value}
                        className="sr-only"
                        iconClassName="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={handleGiftGenderBack}
                className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
              <ModalButton
                type="button"
                onClick={handleGiftGenderNext}
                className="h-[38px] !w-fit min-w-[96px] px-6"
              >
                Next
              </ModalButton>
            </div>
          </div>
        ) : currentGiftFlowStep === "age-range" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                What is{" "}
                {selectedParticipantRecord?.firstName?.trim() || "this person's"}{" "}
                age range?
              </p>
            </div>

            <div className="mx-auto max-w-[494px]">
              <OverlaySelect
                value={selectedRecipientAgeRange}
                onValueChange={(value) =>
                  setGiftFlowDraftFields(flowSelectionKey, {
                    recipientAgeRange: value,
                  })
                }
                options={(contactEnumsResponse?.data.ageRanges ?? []).map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                placeholder="Select age range"
                panelTitle="Select age range"
                searchPlaceholder=""
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={handleGiftAgeRangeBack}
                className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
              <ModalButton
                type="button"
                onClick={handleGiftAgeRangeNext}
                className="h-[38px] !w-fit min-w-[96px] px-6"
              >
                Next
              </ModalButton>
            </div>
          </div>
        ) : currentGiftFlowStep === "relationship" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                Set relationship
              </p>
              <p className="mt-2 text-[16px] font-normal text-[#666666]">
                Choose how this person is connected to you.
              </p>
            </div>

            <div className="mx-auto max-w-[494px]">
              <OverlaySelect
                value={selectedRecipientRelationshipId}
                onValueChange={(value) =>
                  setGiftFlowDraftFields(flowSelectionKey, {
                    recipientRelationshipId: value,
                  })
                }
                options={relationshipOptions}
                placeholder="Select relationship"
                panelTitle="Select relationship"
                searchPlaceholder=""
                searchValue={relationshipSearchValue}
                onSearchValueChange={setRelationshipSearchValue}
                onCreateOption={handleCreateRelationshipOption}
                onUpdateOption={handleUpdateRelationshipOption}
                onDeleteOption={handleDeleteRelationshipOption}
                triggerClassName="text-[10px]"
              />
            </div>

            {isAvailableRelationshipsError ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void refetchAvailableRelationships()}
                  className="text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  Retry loading relationships
                </button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={handleGiftRelationshipBack}
                className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
              <ModalButton
                type="button"
                onClick={handleGiftRelationshipNext}
                className="h-[38px] !w-fit min-w-[96px] px-6"
                disabled={
                  !selectedRecipientRelationshipId ||
                  isAvailableRelationshipsLoading
                }
              >
                Next
              </ModalButton>
            </div>
          </div>
        ) : currentGiftFlowStep === "record" ? (
          <div className="space-y-8 pt-2">
            <div className="text-center">
              {/* <p className="text-[20px] font-medium leading-tight text-[#1E1E1E]">
                Hey {greetingName},
              </p> */}
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                {isGroupGifting
                  ? "Who are the Lucky People?"
                  : "Who is the Lucky Person?"}
              </p>
            </div>

            <div className="mx-auto max-w-[494px]">
              <OverlayRecordPicker
                open={isGiftRecordPickerOpen}
                onOpenChange={setIsGiftRecordPickerOpen}
                items={contactRecordOptions}
                selectedIds={selectedParticipantContactIds}
                onSelectedIdsChange={(ids) =>
                  setSelectedParticipantContactIds(
                    flowSelectionKey,
                    isGroupGifting ? ids : toSingleSelection(ids),
                  )
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
                      setGiftFlowStep("source", mode, eventId, giftingEventId)
                    }
                    className="flex h-[38px] min-w-[60px] items-center justify-center rounded-[14px] bg-[#F3EFFB] px-5 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                    iconClassName="size-[24px]"
                  />
                }
                addActionLabel="Add New"
                onAddAction={() => handleOpenAddNewColleague("record")}
                onEditItem={(item) => handleOpenEditColleague(item, "record")}
                onDeleteItem={setRecordPendingDelete}
                suspendDismiss={Boolean(recordPendingDelete)}
                footer={
                  <ModalButton
                    type="button"
                    onClick={handleRecordNext}
                    disabled={!selectedParticipantContactIds.length}
                  >
                    Next
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
            <div className="space-y-2 text-center">
              <p className="mt-2 text-[20px] font-normal text-[#434343]">
                What&apos;s the occasion about
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

            <div className="flex flex-wrap items-center justify-center gap-3">
              <BackButton
                onClick={() =>
                  setGiftFlowStep(
                    selectedCelebrationTarget !== "myself"
                      ? "review-records"
                      : "recipient-choice",
                    mode,
                    eventId,
                    giftingEventId,
                  )
                }
                className="flex h-[38px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />
              <ModalButton
                type="button"
                onClick={handleGiftFlowEventNext}
                disabled={
                  !selectedGiftEventTypeId ||
                  (!isGiftingMyself &&
                    (createGiftingEventMutation.isPending ||
                      updateGiftingEventMutation.isPending))
                }
                className="h-[38px] !w-fit min-w-[96px] px-6"
              >
                Next
              </ModalButton>
            </div>
          </div>
        )}
      </ContentModal>

      <ConfirmationModal
        open={isDiscardGiftFlowConfirmationOpen}
        onClose={() => setIsDiscardGiftFlowConfirmationOpen(false)}
        onConfirm={handleConfirmDiscardGiftFlow}
        action="delete"
        title="Discard Gifting Setup?"
        description="If you close this flow now, the records and setup details you have entered locally will be lost."
        confirmText="Discard"
        cancelText="Keep Editing"
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <EmailInviteComposeModal
        open={isGiftInviteEmailComposeOpen}
        onClose={() => setIsGiftInviteEmailComposeOpen(false)}
        initialTitle={
          currentEventRow?.eventName || giftEventName || "Gifting event"
        }
        initialBody={giftInviteShareMessage}
        lockedEmails={giftInviteLockedEmails}
        onSubmit={handleConfirmSendGiftInviteEmails}
        isSubmitting={sendEmailMutation.isPending}
        hasBody={false}
      />

      <ConfirmationModal
        open={Boolean(pendingGiftContactDetailsPrompt)}
        onClose={() => setPendingGiftContactDetailsPrompt(null)}
        onConfirm={handleUpdateGiftContactDetailsFromPrompt}
        onSecondaryConfirm={handleSkipGiftContactDetailsPrompt}
        action="save"
        title="Complete contact details?"
        description={
          pendingGiftContactDetailsPrompt
            ? `This contact is missing ${pendingGiftContactDetailsPrompt.missingFields
                .map((field) =>
                  field === "ageRange"
                    ? "age range"
                    : field === "relationship"
                      ? "relationship"
                      : "gender",
                )
                .join(", ")}. Adding them can help improve gifting suggestions.`
            : ""
        }
        confirmText="Update details"
        secondaryConfirmText="Skip for now"
      />
    </div>
  );
}

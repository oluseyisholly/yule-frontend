"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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
import { useWishListMetricsQuery } from "@/features/wishlist/hooks/useWishListMetricsQuery";
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
import WishlistClaimGiftSelectionStep from "@/components/WishlistClaimGiftSelectionStep";
import WishlistGiftSelectionStep from "@/components/WishlistGiftSelectionStep";
import FilterIcon from "@/components/icons/FilterIcon";
import Pagination from "@/components/Pagination";
import {
  ModalPanelSkeleton,
  TableLoadingState,
} from "@/components/ui/context-skeletons";
import ContentModal from "@/components/ui/modal";
import InviteEmailIcon from "@/components/icons/InviteEmailIcon";
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
import UserAvatar from "@/components/UserAvatar";
import { getEventTypeIcon } from "@/features/event-types/event-type-icons";
import { useAvailableEventTypesQuery } from "@/features/event-types/hooks/useAvailableEventTypesQuery";
import { useCreateEventTypeMutation } from "@/features/event-types/hooks/useCreateEventTypeMutation";
import { useDeleteEventTypeMutation } from "@/features/event-types/hooks/useDeleteEventTypeMutation";
import { useUpdateEventTypeMutation } from "@/features/event-types/hooks/useUpdateEventTypeMutation";
import {
  canManageWishlistEvent,
  isWishlistEventParticipant,
} from "@/features/wishlist-events/access";
import { useWishlistEventsQuery } from "@/features/wishlist-events/hooks/useWishlistEventsQuery";
import { useCreateWishlistEventMutation } from "@/features/wishlist-events/hooks/useCreateWishlistEventMutation";
import { useDeleteWishlistEventMutation } from "@/features/wishlist-events/hooks/useDeleteWishlistEventMutation";
import { useCompleteWishlistEventMutation } from "@/features/wishlist-events/hooks/useCompleteWishlistEventMutation";
import { useWishlistEventClaimedGiftIdsQuery } from "@/features/wishlist-events/hooks/useWishlistEventClaimedGiftIdsQuery";
import { useWishlistEventGiftsQuery } from "@/features/wishlist-events/hooks/useWishlistEventGiftsQuery";
import { useWishlistEventQuery } from "@/features/wishlist-events/hooks/useWishlistEventQuery";
import { useUpdateWishlistEventMutation } from "@/features/wishlist-events/hooks/useUpdateWishlistEventMutation";
import { useClaimGiftMutation } from "@/features/gifts/hooks/useClaimGiftMutation";
import { useParticipantGiftSelectionsQuery } from "@/features/gifts/hooks/useParticipantGiftSelectionsQuery";
import { useCreateBulkGiftsMutation } from "@/features/gifts/hooks/useCreateBulkGiftsMutation";
import type { ParticipantGiftSelection } from "@/features/gifts/types";
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
  profileUrl?: string | null;
  bg: string;
  color: string;
};

type WishListCelebrationType = "" | "gifts" | "hangouts" | "both";
type WishListActivityTab = "organizer" | "participant";

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
  canManage: boolean;
  canClaim: boolean;
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

// Stats are driven from the wishlist metrics API
function useDerivedWishListStats() {
  const { data: metrics = null } = useWishListMetricsQuery(true);

  const m =
    metrics ?? {
      totalItems: { value: 0, percentageChangeThisMonth: 0 },
      activeWishlists: { value: 0, newThisWeek: 0 },
      totalParticipants: { value: 0 },
      reservedItems: { value: 0 },
    };

  const stats: WishListStat[] = [
    {
      icon: <GiftIcon className="size-5 text-[#3300C9]" strokeWidth={1.8} />,
      iconBg: "#EFE6FD",
      value: String(m.totalItems.value),
      label: "Total Items",
      hint: m.totalItems.percentageChangeThisMonth
        ? `+${m.totalItems.percentageChangeThisMonth}% this month`
        : undefined,
      hintColor: "#3300C9",
    },
    {
      icon: (
        <CalendarDaysIcon className="size-5 text-[#1FAB54]" strokeWidth={1.8} />
      ),
      iconBg: "#D9F4E2",
      value: String(m.activeWishlists.value),
      label: "Active Wish Lists",
      hint: m.activeWishlists.newThisWeek
        ? `+${m.activeWishlists.newThisWeek} new this week`
        : undefined,
      hintColor: "#24A959",
    },
    {
      icon: <UsersIcon className="size-5 text-[#C28A00]" strokeWidth={1.8} />,
      iconBg: "#FCEEC8",
      value: String(m.totalParticipants.value),
      label: "Total Participants",
    },
    {
      icon: <Share2Icon className="size-5 text-[#E04F4F]" strokeWidth={1.8} />,
      iconBg: "#FDE0DE",
      value: String(m.reservedItems.value),
      label: "Reserved Items",
    },
  ];

  return stats;
}

const wishListCelebrationTypeOptions: Array<{
  value: Exclude<WishListCelebrationType, "">;
  label: string;
}> = [
  { value: "gifts", label: "Gifts" },
  { value: "hangouts", label: "Hangouts" },
  { value: "both", label: "Both Gifts & Hangouts" },
];

function createParticipants(
  participants: Array<{ name: string; profileUrl?: string | null }>,
) {
  return participants.map(({ name, profileUrl }, index) => {
    const [first = "", second = ""] = name.split(" ");
    const initials = `${first.charAt(0)}${second.charAt(0)}`
      .trim()
      .toUpperCase();
    const palette = participantPalette[index % participantPalette.length];

    return {
      id: index + 1,
      name,
      initials: initials || "WL",
      profileUrl: profileUrl?.trim() || null,
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
  return `${value}T10:00:00.000Z`;
}

function toWishlistDeadlineIsoDate(value: string) {
  return `${value}T10:00:00.000Z`;
}

function normalizeParticipantGiftSelections(
  value: unknown,
): ParticipantGiftSelection[] {
  if (Array.isArray(value)) {
    return value as ParticipantGiftSelection[];
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: ParticipantGiftSelection[] }).data;
  }

  return [];
}

function toMarketplaceCondition(value?: string) {
  const normalizedValue = value?.trim();

  if (
    normalizedValue === "new" ||
    normalizedValue === "used" ||
    normalizedValue === "foreign_used" ||
    normalizedValue === "refurbished" ||
    normalizedValue === "like_new" ||
    normalizedValue === "good" ||
    normalizedValue === "fair" ||
    normalizedValue === "poor"
  ) {
    return normalizedValue;
  }

  return undefined;
}

function mapParticipantGiftSelectionToMarketplaceProduct(
  selection: ParticipantGiftSelection,
): MarketplaceProduct | null {
  const productId =
    selection.participantGiftId?.trim() || selection.id?.trim() || "";

  if (!productId) {
    return null;
  }

  const amount =
    typeof selection.amount === "number"
      ? selection.amount
      : Number(selection.amount ?? 0);

  return {
    _id: productId,
    sellerId: selection.sellerId || undefined,
    categorySlug: selection.categorySlug || undefined,
    subCategorySlug: selection.subCategorySlug || undefined,
    title: selection.title?.trim() || "Selected gift",
    description: selection.description ?? "",
    amount: Number.isFinite(amount) ? amount : 0,
    images: Array.isArray(selection.images)
      ? selection.images.filter(Boolean)
      : selection.imageUrl
        ? [selection.imageUrl]
        : [],
    location: {
      state: selection.locationState || undefined,
      city: selection.locationCity || undefined,
    },
    condition: toMarketplaceCondition(selection.condition),
    slug: selection.productSlug || selection.slug || undefined,
  };
}

function hasRichMarketplaceProductSnapshot(product?: MarketplaceProduct | null) {
  if (!product) {
    return false;
  }

  return Boolean(
    (product.title?.trim() && product.title.trim() !== "Selected gift") ||
      (typeof product.amount === "number" && product.amount > 0) ||
      product.description?.trim() ||
      product.images?.length ||
      product.sellerId ||
      product.slug,
  );
}

function areMarketplaceProductSnapshotsEqual(
  left?: MarketplaceProduct | null,
  right?: MarketplaceProduct | null,
) {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  const leftImages = left.images ?? [];
  const rightImages = right.images ?? [];

  return (
    left._id === right._id &&
    left.sellerId === right.sellerId &&
    left.categorySlug === right.categorySlug &&
    left.subCategorySlug === right.subCategorySlug &&
    left.title === right.title &&
    left.description === right.description &&
    left.amount === right.amount &&
    left.condition === right.condition &&
    left.slug === right.slug &&
    left.location?.state === right.location?.state &&
    left.location?.city === right.location?.city &&
    left.location?.lga === right.location?.lga &&
    leftImages.length === rightImages.length &&
    leftImages.every((image, index) => image === rightImages[index])
  );
}

function mergeMarketplaceProductSnapshots(
  existing?: MarketplaceProduct | null,
  incoming?: MarketplaceProduct | null,
) {
  if (!existing) {
    return incoming ?? null;
  }

  if (!incoming) {
    return existing;
  }

  const preferred =
    hasRichMarketplaceProductSnapshot(existing) ||
    !hasRichMarketplaceProductSnapshot(incoming)
      ? existing
      : incoming;
  const fallback = preferred === existing ? incoming : existing;

  return {
    ...fallback,
    ...preferred,
    _id: preferred._id || fallback._id,
    sellerId: preferred.sellerId || fallback.sellerId,
    categorySlug: preferred.categorySlug || fallback.categorySlug,
    subCategorySlug: preferred.subCategorySlug || fallback.subCategorySlug,
    title:
      preferred.title?.trim() && preferred.title.trim() !== "Selected gift"
        ? preferred.title
        : fallback.title,
    description: preferred.description || fallback.description,
    amount:
      typeof preferred.amount === "number" && preferred.amount > 0
        ? preferred.amount
        : fallback.amount,
    images: preferred.images?.length ? preferred.images : fallback.images,
    location: {
      state: preferred.location?.state || fallback.location?.state,
      city: preferred.location?.city || fallback.location?.city,
      lga: preferred.location?.lga || fallback.location?.lga,
    },
    condition: preferred.condition || fallback.condition,
    slug: preferred.slug || fallback.slug,
  } satisfies MarketplaceProduct;
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
  return createParticipants(
    participants.map((participant) => {
      const actor = participant.eventContact ?? participant.user;

      return {
        name: getParticipantDisplayName(participant),
        profileUrl: actor?.profileUrl?.trim() || null,
      };
    }),
  );
}

function mapWishlistRecordToRow(
  record: WishlistEventRecord,
  options: {
    currentUserId?: string | null;
    currentContactId?: string | null;
  },
): WishListRow {
  const createdBy = record.event.createdBy
    ? `${record.event.createdBy.firstName} ${record.event.createdBy.lastName}`.trim()
    : "—";
  const canManage = canManageWishlistEvent(record, options);
  const isParticipant = isWishlistEventParticipant(record, options);
  const status = formatWishListStatus(record.event.status);

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
    status,
    canManage,
    canClaim: !canManage && isParticipant && status === "Ongoing",
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
        <UserAvatar
          key={`${participant.name}-${index}`}
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
  onView,
  onEdit,
  onClaim,
  onRequestDelete,
}: {
  row: WishListRow;
  onView: (row: WishListRow) => void;
  onEdit: (row: WishListRow) => void;
  onClaim: (row: WishListRow) => void;
  onRequestDelete: (row: WishListRow) => void;
}) {
  const isOngoingState = row.status === "Ongoing";
  const isCompletedState = row.status === "Completed";
  // Edit should be disabled for completed wishlists
  const canEdit = row.canManage && !isCompletedState;
  const canSendInvite = row.canManage && isOngoingState;

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
          {canSendInvite ? (
            <DropdownMenuItem
              onSelect={() => onEdit(row)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
            >
              <InviteEmailIcon className="size-4 text-[#292D32]" />
              Send Invite
            </DropdownMenuItem>
          ) : canEdit ? (
            <DropdownMenuItem
              onSelect={() => onEdit(row)}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
            >
              <EditPencilIcon className="size-4 text-[#292D32]" />
              Edit Wish List
            </DropdownMenuItem>
          ) : null}
          {!row.canManage ? (
            <DropdownMenuItem
              disabled={!row.canClaim}
              onSelect={() => {
                if (!row.canClaim) {
                  return;
                }

                onClaim(row);
              }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm focus:bg-[#F6F2FF]",
                row.canClaim
                  ? "cursor-pointer text-[#434343] focus:text-[#3300C9]"
                  : "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]",
              )}
            >
              <GiftIcon
                className={cn(
                  "size-4",
                  row.canClaim ? "text-[#292D32]" : "text-[#B8B5C3]",
                )}
              />
              Claim Wishlist
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuSeparator className="bg-[#F0ECFA]" />
          <DropdownMenuItem
            disabled={isOngoingState || isCompletedState || !row.canManage}
            onSelect={() => {
              if (isOngoingState || isCompletedState || !row.canManage) {
                return;
              }

              onRequestDelete(row);
            }}
            className={cn(
              "rounded-lg px-3 py-2 text-sm focus:bg-[#FDEEEE]",
              isOngoingState || isCompletedState
                ? "cursor-not-allowed text-[#B8B5C3] focus:text-[#B8B5C3]"
                : "cursor-pointer text-[#E04F4F] focus:text-[#E04F4F]",
            )}
          >
            <DeleteIcon
              className={cn(
                "size-4",
                isOngoingState || isCompletedState ? "text-[#B8B5C3]" : "text-[#DC2626]",
              )}
            />
            Delete Wish List
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function WishListScreen() {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
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
  const [activeTab, setActiveTab] = useState<WishListActivityTab>("organizer");
  const [wishlistInviteSearchValue, setWishlistInviteSearchValue] = useState("");
  const [isWishlistInviteCopyListOpen, setIsWishlistInviteCopyListOpen] =
    useState(false);
  const [isCompleteWishlistConfirmationOpen, setIsCompleteWishlistConfirmationOpen] =
    useState(false);
  const [participantClaimSelectedGiftIds, setParticipantClaimSelectedGiftIds] =
    useState<string[]>([]);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<WishListRow | null>(
    null,
  );
  const [wishlistStatsEmblaRef] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

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
      enabled: isOpen && currentStep === "event",
    },
  );
  const createEventTypeMutation = useCreateEventTypeMutation();
  const updateEventTypeMutation = useUpdateEventTypeMutation();
  const deleteEventTypeMutation = useDeleteEventTypeMutation();
  const createWishlistEventMutation = useCreateWishlistEventMutation();
  const claimGiftMutation = useClaimGiftMutation();
  const deleteWishlistEventMutation = useDeleteWishlistEventMutation();
  const completeWishlistEventMutation = useCompleteWishlistEventMutation();
  const updateWishlistEventMutation = useUpdateWishlistEventMutation();
  const createBulkGiftsMutation = useCreateBulkGiftsMutation();
  const {
    data: wishlistEventsResponse,
    isError: isWishlistEventsError,
    isFetching: isWishlistEventsFetching,
    isLoading: isWishlistEventsLoading,
    refetch: refetchWishlistEvents,
  } = useWishlistEventsQuery({
    scope: activeTab,
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
    data: activeWishlistEventResponse,
    isLoading: isActiveWishlistEventLoading,
    isError: isActiveWishlistEventError,
    refetch: refetchActiveWishlistEvent,
  } = useWishlistEventQuery(wishlistEventId, {
    enabled: isOpen && isWishlistGiftSelectionStep && Boolean(wishlistEventId),
  });
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
  const activeWishlistEventRecord = activeWishlistEventResponse?.data ?? null;
  const canManageActiveWishlist = useMemo(
    () =>
      canManageWishlistEvent(activeWishlistEventRecord, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [activeWishlistEventRecord, authUser?.id, currentContactId],
  );
  const isParticipantClaimWishlistStep = Boolean(
    isWishlistGiftSelectionStep &&
      wishlistEventId &&
      activeWishlistEventRecord &&
      !canManageActiveWishlist,
  );
  const {
    data: participantGiftSelectionsResponse,
    isLoading: isParticipantGiftSelectionsLoading,
    isFetching: isParticipantGiftSelectionsFetching,
    isError: isParticipantGiftSelectionsError,
    refetch: refetchParticipantGiftSelections,
  } = useParticipantGiftSelectionsQuery(currentParticipantId, eventId, {
    enabled:
      isOpen &&
      isWishlistGiftSelectionStep &&
      !isParticipantClaimWishlistStep &&
      Boolean(currentParticipantId) &&
      Boolean(eventId),
  });
  const {
    data: participantClaimWishlistGiftsResponse,
    isLoading: isParticipantClaimWishlistGiftsLoading,
    isError: isParticipantClaimWishlistGiftsError,
    refetch: refetchParticipantClaimWishlistGifts,
  } = useWishlistEventGiftsQuery(
    wishlistEventId,
    {
      page: 1,
      per_page: 100,
    },
    {
      enabled: isOpen && isParticipantClaimWishlistStep,
    },
  );
  const {
    data: participantClaimedGiftIdsResponse,
    isLoading: isParticipantClaimedGiftIdsLoading,
    isError: isParticipantClaimedGiftIdsError,
    refetch: refetchParticipantClaimedGiftIds,
  } = useWishlistEventClaimedGiftIdsQuery(wishlistEventId, {
    enabled: isOpen && isParticipantClaimWishlistStep,
  });
  const publicWishlistLink = useMemo(() => {
    if (!wishlistEventId) {
      return null;
    }

    if (typeof window === "undefined") {
      return `/wishlist/${wishlistEventId}`;
    }

    return new URL(`/wishlist/${wishlistEventId}`, window.location.origin).toString();
  }, [wishlistEventId]);

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
      eventTypeOptions.find((eventType) => eventType.value === selectedEventTypeId) ??
      null,
    [eventTypeOptions, selectedEventTypeId],
  );
  const participantGiftSelections = useMemo(
    () =>
      normalizeParticipantGiftSelections(
        participantGiftSelectionsResponse?.data ?? null,
      ),
    [participantGiftSelectionsResponse],
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
        inviteUrl: publicWishlistLink,
      },
    ];
  }, [
    authUser,
    currentParticipantId,
    myParticipantResponse?.data?.role,
    publicWishlistLink,
  ]);
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
      (wishlistEventsResponse?.data?.data ?? []).map((record) =>
        mapWishlistRecordToRow(record, {
          currentUserId: authUser?.id?.trim() || null,
          currentContactId: currentContactId?.trim() || null,
        }),
      ),
    [authUser?.id, currentContactId, wishlistEventsResponse],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchValue(searchValue.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchValue]);

  useEffect(() => {
    setCurrentPage(1);
    setSelected([]);
  }, [activeTab]);

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
    if (
      currentStep !== "gift-selection" ||
      isParticipantClaimWishlistStep ||
      !participantGiftSelectionsResponse
    ) {
      return;
    }

    const selectedProducts = participantGiftSelections
      .map((selection) =>
        mapParticipantGiftSelectionToMarketplaceProduct(selection),
      )
      .filter((product): product is MarketplaceProduct => Boolean(product));
    const hasLocalWishlistSelection =
      selectedWishlistGiftIds.length > 0 ||
      Object.keys(selectedWishlistGiftProductsById).length > 0;

    if (!hasLocalWishlistSelection) {
      const nextSelectedWishlistGiftIds = selectedProducts.map(
        (product) => product._id,
      );
      const selectedIdsAreEqual =
        selectedWishlistGiftIds.length === nextSelectedWishlistGiftIds.length &&
        selectedWishlistGiftIds.every(
          (giftId, index) => giftId === nextSelectedWishlistGiftIds[index],
        );

      if (!selectedIdsAreEqual) {
        setStoredSelectedWishlistGiftIds(
          flowSelectionKey,
          nextSelectedWishlistGiftIds,
        );
      }
    }

    if (!hasLocalWishlistSelection) {
      const nextProductsById = Object.fromEntries(
        selectedProducts.map((product) => [product._id, product]),
      );
      const productsChanged =
        Object.keys(selectedWishlistGiftProductsById).length !==
          Object.keys(nextProductsById).length ||
        Object.entries(nextProductsById).some(
          ([productId, product]) =>
            !areMarketplaceProductSnapshotsEqual(
              selectedWishlistGiftProductsById[productId],
              product,
            ),
        );

      if (productsChanged) {
        setStoredSelectedWishlistGiftProductsById(
          flowSelectionKey,
          nextProductsById,
        );
      }

      return;
    }

    const nextProductsById = { ...selectedWishlistGiftProductsById };
    let hasProductSnapshotChanged = false;

    selectedProducts.forEach((product) => {
      if (
        selectedWishlistGiftProductsById[product._id] ||
        selectedWishlistGiftIds.includes(product._id)
      ) {
        const mergedProduct =
          mergeMarketplaceProductSnapshots(
            selectedWishlistGiftProductsById[product._id],
            product,
          ) ?? product;

        if (
          !areMarketplaceProductSnapshotsEqual(
            selectedWishlistGiftProductsById[product._id],
            mergedProduct,
          )
        ) {
          nextProductsById[product._id] = mergedProduct;
          hasProductSnapshotChanged = true;
        }
      }
    });

    if (hasProductSnapshotChanged) {
      setStoredSelectedWishlistGiftProductsById(
        flowSelectionKey,
        nextProductsById,
      );
    }
  }, [
    currentStep,
    flowSelectionKey,
    isParticipantClaimWishlistStep,
    participantGiftSelections,
    participantGiftSelectionsResponse,
    selectedWishlistGiftIds,
    selectedWishlistGiftProductsById,
    setStoredSelectedWishlistGiftIds,
    setStoredSelectedWishlistGiftProductsById,
  ]);

  useEffect(() => {
    if (!isParticipantClaimWishlistStep && participantClaimSelectedGiftIds.length) {
      setParticipantClaimSelectedGiftIds([]);
    }
  }, [isParticipantClaimWishlistStep, participantClaimSelectedGiftIds.length]);

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
    const nextStep = row.status === "Ongoing" ? "invite" : resumeStep;

    setWishListDraftFields(editFlowKey, {
      lastVisitedStep: nextStep,
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
    openModal(nextStep, "edit", row.eventId, row.wishlistEventId);
  };

  const handleOpenWishListDetails = (row: WishListRow) => {
    router.push(`/dashboard/wish-list/${row.wishlistEventId}`);
  };

  const handleOpenClaimWishList = (row: WishListRow) => {
    openModal("gift-selection", "edit", row.eventId, row.wishlistEventId);
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

  const handleParticipantClaimWishlistGifts = async () => {
    if (!participantClaimSelectedGiftIds.length) {
      toast.error("Please select at least one gift to claim.");
      return;
    }

    try {
      let lastMessage = "Gift claimed successfully";

      for (const giftId of participantClaimSelectedGiftIds) {
        const response = await claimGiftMutation.mutateAsync(giftId);
        lastMessage = response.message || lastMessage;
      }

      toast.success(
        participantClaimSelectedGiftIds.length > 1
          ? `${participantClaimSelectedGiftIds.length} gifts claimed successfully`
          : lastMessage,
      );
      setParticipantClaimSelectedGiftIds([]);
      void refetchParticipantClaimWishlistGifts();
      void refetchParticipantClaimedGiftIds();
      void refetchActiveWishlistEvent();
    } catch {
      // Errors are already surfaced by the API layer.
    }
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

  const resolveWishlistGiftSelectionContext = async () => {
    if (!eventId) {
      toast.error("Unable to resolve this wish list event right now.");
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

    const selectedProducts = selectedWishlistGiftIds
      .map((selectedId) => selectedWishlistGiftProductsById[selectedId])
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
      resolvedEventId: eventId,
      resolvedParticipantId,
      selectedProducts,
    };
  };

  const handleWishListGiftSelectionNext = async () => {
    const selectionContext = await resolveWishlistGiftSelectionContext();

    if (!selectionContext) {
      return;
    }

    setIsCompleteWishlistConfirmationOpen(true);
  };

  const handleConfirmCompleteWishlistEvent = async () => {
    if (!wishlistEventId) {
      toast.error("Unable to resolve this wish list right now.");
      return;
    }

    const selectionContext = await resolveWishlistGiftSelectionContext();

    if (!selectionContext) {
      return;
    }

    try {
      await createBulkGiftsMutation.mutateAsync({
        eventId: selectionContext.resolvedEventId,
        recipientParticipantId: selectionContext.resolvedParticipantId,
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
        await completeWishlistEventMutation.mutateAsync(wishlistEventId);
      toast.success(completeResponse.message);
      setIsCompleteWishlistConfirmationOpen(false);
      setIsWishlistInviteCopyListOpen(false);
      setCurrentStep("invite", mode, eventId, wishlistEventId);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete this wish list right now.",
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

  const handleWishlistInviteCopyLink = async (participantId: string) => {
    const inviteUrl = wishlistInviteParticipants.find(
      (participant) => participant.participantId === participantId,
    )?.inviteUrl;

    if (!inviteUrl) {
      toast.error("No public wishlist link is available right now.");
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Wishlist link copied.");
    } catch {
      toast.error("Unable to copy this wishlist link right now.");
    }
  };

  const handleDeleteWishList = async () => {
    if (!pendingDeleteRow) {
      return;
    }

    try {
      const response = await deleteWishlistEventMutation.mutateAsync(
        pendingDeleteRow.wishlistEventId,
      );
      toast.success(response.message);
      setPendingDeleteRow(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this wish list right now.",
      );
    }
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
            onView={handleOpenWishListDetails}
            onEdit={handleOpenEditWishListModal}
            onClaim={handleOpenClaimWishList}
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
    emptyState: isWishlistEventsLoading || isWishlistEventsFetching ? (
      <TableLoadingState rows={5} />
    ) : (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-[#7D7D7D]">
          {isWishlistEventsError
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

      <>
        {/* Carousel for mobile */}
        <div className="sm:hidden">
          <div className="overflow-hidden" ref={wishlistStatsEmblaRef}>
            <div className="flex gap-3">
              {useDerivedWishListStats().map((stat) => (
                <div key={stat.label} className="min-w-0 flex-[0_0_100%]">
                  <WishListStatCard {...stat} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid for tablet and above */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {useDerivedWishListStats().map((stat) => (
            <WishListStatCard key={stat.label} {...stat} />
          ))}
        </div>
      </>

      <section className="rounded-2xl border border-[#EEEAF7] bg-white p-4 shadow-[0_2px_6px_rgba(33,16,93,0.04)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <h2 className="text-[14px] font-semibold text-[#434343]">
              Recent Activity
            </h2>
            <div className="flex items-center gap-5 border-b border-[#F1EDF8]">
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

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
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
        bodyScrollable={!isWishlistGiftSelectionStep && !isWishlistInviteStep}
        dialogClassName={cn(
          "rounded-[18px] bg-white sm:rounded-[20px]",
          isWishlistGiftSelectionStep
            ? "max-h-[calc(100vh-1.5rem)] max-w-[1240px]"
            : "max-w-[536px]",
        )}
        bodyClassName={cn(
          isWishlistGiftSelectionStep
            ? "!max-h-[calc(100vh-1.5rem)] flex h-[calc(100vh-1.5rem)] min-h-0 px-4 py-4 sm:px-8 sm:py-8 lg:px-10"
            : "px-4 py-6 sm:px-8 sm:py-10 lg:px-10",
        )}
      >
        {currentStep === "event" ? (
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
          <div className="space-y-6 pt-1 sm:space-y-8">
            <div className="space-y-3 text-left">
              <p className="text-[18px] font-medium leading-tight text-[#434343] sm:text-[20px]">
                Let&apos;s get to the good part!
              </p>
              <p className="max-w-[360px] text-[18px] font-normal leading-[1.35] text-[#434343] sm:text-[20px]">
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
                const isOptionDisabled = option.value !== "gifts";
                const isSelected =
                  !isOptionDisabled && selectedCelebrationType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={isOptionDisabled}
                    onClick={() => {
                      if (isOptionDisabled) {
                        return;
                      }

                      setWishListDraftFields(flowSelectionKey, {
                        celebrationType: option.value,
                      });
                    }}
                    className={cn(
                      "flex h-[44px] w-full items-center justify-center rounded-[10px] border px-4 text-[13px] font-medium transition-colors sm:text-[14px]",
                      isSelected
                        ? "border-[#3300C9] bg-[#F6F2FF] text-[#3300C9]"
                        : isOptionDisabled
                          ? "cursor-not-allowed border-[#E4DFF2] bg-[#F7F5FB] text-[#B8B5C3]"
                          : "border-[#3300C9] bg-white text-[#3300C9] hover:bg-[#F8F5FF]",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <BackButton
                onClick={() =>
                  setCurrentStep("event-name", mode, eventId, wishlistEventId)
                }
                className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
                iconClassName="size-[24px]"
              />

              <ModalButton
                type="button"
                onClick={handleWishListCelebrationTypeNext}
                disabled={selectedCelebrationType !== "gifts"}
                className="!h-[38px] max-w-[100px] rounded-[18px]"
              >
                Next
              </ModalButton>
            </div>
          </div>
        ) : currentStep === "gift-selection" ? (
          isActiveWishlistEventLoading && mode === "edit" && wishlistEventId ? (
            <ModalPanelSkeleton className="min-h-[320px]" />
          ) : isActiveWishlistEventError &&
            mode === "edit" &&
            wishlistEventId &&
            !activeWishlistEventRecord ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#E6E0F7] bg-[#FAF8FF] px-6 text-center">
              <p className="text-[14px] text-[#7D7D7D]">
                Unable to load this wishlist right now.
              </p>
              <button
                type="button"
                onClick={() => {
                  void refetchActiveWishlistEvent();
                }}
                className="mt-3 text-[13px] font-semibold text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry
              </button>
            </div>
          ) : isParticipantClaimWishlistStep ? (
            <WishlistClaimGiftSelectionStep
              title={
                activeWishlistEventRecord?.event.title?.trim() ||
                wishListSuggestedName ||
                selectedEventTypeOption?.label ||
                "Wishlist Gifts"
              }
              allowMultipleItems={
                activeWishlistEventRecord?.allowMultipleItems ?? true
              }
              gifts={participantClaimWishlistGiftsResponse?.data?.data ?? []}
              claimedGiftIds={participantClaimedGiftIdsResponse?.data ?? []}
              selectedIds={participantClaimSelectedGiftIds}
              onSelectedIdsChange={setParticipantClaimSelectedGiftIds}
              onClaim={handleParticipantClaimWishlistGifts}
              claimDisabled={
                !participantClaimSelectedGiftIds.length ||
                claimGiftMutation.isPending ||
                isParticipantClaimWishlistGiftsLoading ||
                isParticipantClaimedGiftIdsLoading
              }
              claimLabel={
                claimGiftMutation.isPending ? "Claiming..." : "Claim Gift"
              }
              isLoading={
                isParticipantClaimWishlistGiftsLoading ||
                isParticipantClaimedGiftIdsLoading
              }
              isError={
                isActiveWishlistEventError ||
                isParticipantClaimWishlistGiftsError ||
                isParticipantClaimedGiftIdsError
              }
              onRetry={() => {
                void refetchActiveWishlistEvent();
                void refetchParticipantClaimWishlistGifts();
                void refetchParticipantClaimedGiftIds();
              }}
            />
          ) : (
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
              isInitialSelectionLoading={
                isMyParticipantLoading ||
                isMyParticipantFetching ||
                isParticipantGiftSelectionsLoading ||
                isParticipantGiftSelectionsFetching
              }
              isInitialSelectionError={isParticipantGiftSelectionsError}
              onRetryInitialSelection={() => {
                void refetchMyParticipant();
                void refetchParticipantGiftSelections();
              }}
              nextDisabled={
                !selectedWishlistGiftIds.length ||
                createBulkGiftsMutation.isPending ||
                isMyParticipantLoading ||
                isMyParticipantFetching
              }
              nextLabel={
                createBulkGiftsMutation.isPending
                  ? "Saving..."
                  : "Next"
              }
            />
          )
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
        isLoading={deleteWishlistEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />

      <ConfirmationModal
        open={isCompleteWishlistConfirmationOpen}
        onClose={() => setIsCompleteWishlistConfirmationOpen(false)}
        onConfirm={handleConfirmCompleteWishlistEvent}
        action="save"
        title="Complete Wish List"
        description="Are you sure you are ready to complete this wish list and continue to the share step?"
        confirmText="Yes, Continue"
        isLoading={
          createBulkGiftsMutation.isPending ||
          completeWishlistEventMutation.isPending
        }
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </div>
  );
}

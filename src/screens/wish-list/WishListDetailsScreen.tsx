"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  GiftIcon,
  MoreHorizontal,
  PencilIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import Checkbox from "@/components/Checkbox";
import DetailHeader from "@/components/DetailHeader";
import Pagination from "@/components/Pagination";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import FilterIcon from "@/components/icons/FilterIcon";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import InviteEmailIcon from "@/components/icons/InviteEmailIcon";
import Table, { type TableData } from "@/components/ui/Table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import { Input } from "@/components/ui/input";
import {
  canManageWishlistEvent,
  isWishlistEventParticipant,
} from "@/features/wishlist-events/access";
import { useDeleteWishlistEventMutation } from "@/features/wishlist-events/hooks/useDeleteWishlistEventMutation";
import { useWishlistEventQuery } from "@/features/wishlist-events/hooks/useWishlistEventQuery";
import { useWishlistEventGiftsQuery } from "@/features/wishlist-events/hooks/useWishlistEventGiftsQuery";
import type {
  WishlistEventGiftRow,
  WishlistEventParticipant,
  WishlistEventRecord,
} from "@/features/wishlist-events/types";
import { cn } from "@/lib/utils";
import { isWishListModalStep } from "@/screens/wish-list/modal-steps";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildWishListFlowHref,
  buildWishListFlowSelectionKey,
  useWishListFlowStore,
} from "@/stores/wishlist-flow-store";

type WishListDetailsScreenProps = {
  wishlistEventId: string;
};

type DetailStatus = "Completed" | "Draft" | "Ongoing" | "In Progress";

type DetailParticipant = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  bg: string;
  email: string;
};

type GiftRow = {
  id: string;
  participantGiftId?: string;
  title: string;
  imageUrl: string;
  conditionLabel: string;
  categoryLabel: string;
  amount: string;
  status: "Claimed" | "Pending";
  assignedParticipant: DetailParticipant | null;
};

const participantPalette = [
  { color: "#3300C9", bg: "#EFE6FD" },
  { color: "#C28A00", bg: "#FCEEC8" },
  { color: "#1FAB54", bg: "#D9F4E2" },
  { color: "#E04F4F", bg: "#FDE0DE" },
  { color: "#0067C9", bg: "#DDF0FF" },
] as const;

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

function formatMonthYear(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value?: string | number | null) {
  const numericValue =
    typeof value === "number" ? value : Number(value?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "₦0";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function toInitials(firstName?: string | null, lastName?: string | null) {
  const firstInitial = firstName?.trim().charAt(0) ?? "";
  const lastInitial = lastName?.trim().charAt(0) ?? "";
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase();

  return initials || "WL";
}

function getParticipantStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return participantPalette[hash % participantPalette.length];
}

function formatStatus(record: WishlistEventRecord): DetailStatus {
  const normalizedStatus = record.event.status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "draft") {
    return "Draft";
  }

  if (normalizedStatus === "ongoing") {
    return "Ongoing";
  }

  return "In Progress";
}

function formatCategoryLabel(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function formatConditionLabel(value?: string | null) {
  if (!value?.trim()) {
    return "Available";
  }

  return value
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join("-");
}

function mapParticipant(
  participant: WishlistEventParticipant,
): DetailParticipant | null {
  const actor = participant.eventContact ?? participant.user;

  if (!actor) {
    return null;
  }

  const fullName = `${actor.firstName} ${actor.lastName}`.trim() || "Participant";
  const { bg, color } = getParticipantStyle(participant.id || actor.id || fullName);

  return {
    id: participant.id,
    name: fullName,
    role: participant.role === "creator" ? "Admin" : "Participant",
    initials: toInitials(actor.firstName, actor.lastName),
    bg,
    color,
    email: actor.email || "",
  };
}

function buildGiftRows(
  gifts: WishlistEventGiftRow[],
  participantsById: Map<string, DetailParticipant>,
): GiftRow[] {
  return gifts.map((gift) => ({
    id: gift.id,
    participantGiftId: gift.participantGiftId,
    title: gift.title?.trim() || "Selected gift",
    imageUrl: gift.imageUrl?.trim() || "",
    conditionLabel: formatConditionLabel(gift.condition),
    categoryLabel: formatCategoryLabel(
      gift.subCategorySlug || gift.categorySlug,
    ),
    amount: formatCurrency(gift.amount),
    status: gift.giverParticipantId ? "Claimed" : "Pending",
    assignedParticipant: gift.giverParticipantId
      ? participantsById.get(gift.giverParticipantId) ?? null
      : null,
  }));
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-[#FFFFFF] px-4 py-4 sm:px-5">
      <p className="text-[14px] font-[500] text-[#434343]">{label}</p>
      <p className="mt-4 text-[16px] font-[600] text-[#1E1E1E] sm:mt-5">
        {value}
      </p>
    </div>
  );
}

function ParticipantAvatar({ participant }: { participant: DetailParticipant }) {
  return (
    <span
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
      style={{
        backgroundColor: participant.bg,
        color: participant.color,
      }}
    >
      {participant.initials}
    </span>
  );
}

function SidebarParticipantRow({
  participant,
}: {
  participant: DetailParticipant;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <ParticipantAvatar participant={participant} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#1E1E1E]">
            {participant.name}
          </p>
          <p className="truncate text-xs text-[#7D7D7D]">{participant.role}</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`More actions for ${participant.name}`}
            className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-[#F6F2FF] hover:text-[#434343]"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-xl border-[#ECE8F7] bg-white p-1.5 shadow-[0_16px_40px_rgba(51,0,201,0.08)]"
        >
          <DropdownMenuItem
            onSelect={() => {
              toast("Participant profile will be connected next.");
            }}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              toast("Participant reminder will be connected next.");
            }}
            className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
          >
            Send Reminder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function GiftNameCell({ gift }: { gift: GiftRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#F5F2FF]">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] font-medium text-[#3300C9]">Gift</span>
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[12px] font-medium text-[#1E1E1E]">
          {gift.title}
        </p>
        <span className="mt-1 inline-flex rounded-full border border-[#FFB978] px-2 py-0.5 text-[10px] font-medium text-[#FF8A00]">
          {gift.conditionLabel}
        </span>
      </div>
    </div>
  );
}

function AssignedParticipantCell({
  participant,
}: {
  participant: DetailParticipant | null;
}) {
  if (!participant) {
    return <span className="text-[#9A97A5]">—</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
        style={{
          backgroundColor: participant.bg,
          color: participant.color,
        }}
      >
        {participant.initials}
      </span>
      <span className="truncate text-[12px] font-medium text-[#1E1E1E]">
        {participant.name}
      </span>
    </div>
  );
}

function GiftStatusPill({ status }: { status: GiftRow["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
        status === "Claimed"
          ? "bg-[#E6F7EC] text-[#1FAB54]"
          : "bg-[#FFF1DD] text-[#C28A00]",
      )}
    >
      {status}
    </span>
  );
}

export default function WishListDetailsScreen({
  wishlistEventId,
}: WishListDetailsScreenProps) {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const [currentGiftPage, setCurrentGiftPage] = useState(1);
  const [giftSearchValue, setGiftSearchValue] = useState("");
  const [selectedGiftIds, setSelectedGiftIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isParticipantListExpanded, setIsParticipantListExpanded] =
    useState(false);

  const deleteWishlistEventMutation = useDeleteWishlistEventMutation();
  const { data, isLoading, isError, refetch } = useWishlistEventQuery(
    wishlistEventId,
  );
  const {
    data: giftsResponse,
    isLoading: isGiftsLoading,
    isError: isGiftsError,
    refetch: refetchGifts,
  } = useWishlistEventGiftsQuery(
    wishlistEventId,
    {
      page: currentGiftPage,
      per_page: 10,
    },
    {
      enabled: Boolean(wishlistEventId),
    },
  );
  const canManageDetail = useMemo(
    () =>
      canManageWishlistEvent(data?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, data?.data],
  );
  const isParticipantDetail = useMemo(
    () =>
      isWishlistEventParticipant(data?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, data?.data],
  );

  const editFlowSelection = useWishListFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildWishListFlowSelectionKey(
          "edit",
          wishlistEventId,
          data?.data?.eventId ?? null,
        )
      ] ?? null,
  );
  const createFlowSelection = useWishListFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildWishListFlowSelectionKey(
          "create",
          wishlistEventId,
          data?.data?.eventId ?? null,
        )
      ] ?? null,
  );

  const detail = useMemo(() => {
    const record = data?.data;

    if (!record) {
      return null;
    }

    const participants = (record.event.participants ?? [])
      .map((participant) => mapParticipant(participant))
      .filter((participant): participant is DetailParticipant => Boolean(participant));
    const participantsById = new Map(
      participants.map((participant) => [participant.id, participant]),
    );
    const createdBy = record.event.createdBy
      ? `${record.event.createdBy.firstName} ${record.event.createdBy.lastName}`.trim()
      : "Unknown";

    return {
      title: record.event.title || "Untitled Event",
      createdBy: createdBy || "Unknown",
      createdAt: formatMonthYear(record.createdAt),
      status: formatStatus(record),
      eventDate: formatDate(record.event.eventDate),
      eventDeadline: formatDate(record.eventDeadline),
      gifts: String(giftsResponse?.data?.total ?? record.items?.length ?? 0),
      totalParticipants: String(participants.length),
      participants,
      participantsById,
      eventId: record.eventId,
    };
  }, [data, giftsResponse?.data?.total]);

  const sourceFlowSelection =
    editFlowSelection?.lastVisitedStep ? editFlowSelection : createFlowSelection;
  const resumeStep =
    sourceFlowSelection?.lastVisitedStep &&
    isWishListModalStep(sourceFlowSelection.lastVisitedStep)
      ? sourceFlowSelection.lastVisitedStep
      : "event";
  const isOngoingWishlist = detail?.status === "Ongoing";
  const canClaimWishlist = isParticipantDetail && !canManageDetail && isOngoingWishlist;

  const giftRows = useMemo(
    () =>
      buildGiftRows(
        giftsResponse?.data?.data ?? [],
        detail?.participantsById ?? new Map(),
      ),
    [detail?.participantsById, giftsResponse],
  );

  const filteredGiftRows = useMemo(() => {
    const normalizedSearch = giftSearchValue.trim().toLowerCase();

    if (!normalizedSearch) {
      return giftRows;
    }

    return giftRows.filter((gift) => {
      const assignedName = gift.assignedParticipant?.name.toLowerCase() ?? "";

      return (
        gift.title.toLowerCase().includes(normalizedSearch) ||
        gift.categoryLabel.toLowerCase().includes(normalizedSearch) ||
        assignedName.includes(normalizedSearch)
      );
    });
  }, [giftRows, giftSearchValue]);

  const allSelectedGiftIds = filteredGiftRows.map((gift) => gift.id);
  const allChecked =
    allSelectedGiftIds.length > 0 &&
    allSelectedGiftIds.every((giftId) => selectedGiftIds.includes(giftId));

  const toggleAllGifts = () => {
    if (allChecked) {
      setSelectedGiftIds((current) =>
        current.filter((giftId) => !allSelectedGiftIds.includes(giftId)),
      );
      return;
    }

    setSelectedGiftIds((current) =>
      Array.from(new Set([...current, ...allSelectedGiftIds])),
    );
  };

  const toggleGift = (giftId: string) => {
    setSelectedGiftIds((current) =>
      current.includes(giftId)
        ? current.filter((currentGiftId) => currentGiftId !== giftId)
        : [...current, giftId],
    );
  };

  const visibleParticipants = isParticipantListExpanded
    ? detail?.participants ?? []
    : (detail?.participants ?? []).slice(0, 6);

  const handleOpenEditFlow = () => {
    if (!detail || !canManageDetail) {
      return;
    }

    const nextStep = isOngoingWishlist ? "invite" : resumeStep;

    router.push(
      buildWishListFlowHref(
        nextStep,
        "edit",
        detail.eventId,
        wishlistEventId,
      ),
    );
  };

  const handleDelete = async () => {
    try {
      const response = await deleteWishlistEventMutation.mutateAsync(
        wishlistEventId,
      );
      toast.success(response.message);
      setIsDeleteModalOpen(false);
      router.push("/dashboard/wish-list");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this wish list right now.",
      );
    }
  };

  const handleClaimWishlist = () => {
    if (!detail?.eventId) {
      return;
    }

    router.push(
      buildWishListFlowHref(
        "gift-selection",
        "edit",
        detail.eventId,
        wishlistEventId,
      ),
    );
  };

  const giftTableData: TableData<GiftRow> = {
    columns: [
      {
        id: "select",
        header: (
          <Checkbox
            checked={allChecked}
            onChange={toggleAllGifts}
            aria-label="Select all gifts"
          />
        ),
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "w-[36px] px-3 py-3",
        render: (row) => (
          <Checkbox
            checked={selectedGiftIds.includes(row.id)}
            onChange={() => toggleGift(row.id)}
            aria-label={`Select ${row.title}`}
          />
        ),
      },
      {
        id: "title",
        header: "Gifts Name",
        headerClassName: "min-w-[220px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <GiftNameCell gift={row} />,
      },
      {
        id: "category",
        header: "Category",
        headerClassName: "min-w-[120px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        accessor: "categoryLabel",
      },
      {
        id: "assignedTo",
        header: "Assigned to",
        headerClassName: "min-w-[170px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => (
          <AssignedParticipantCell participant={row.assignedParticipant} />
        ),
      },
      {
        id: "amount",
        header: "Amount",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3 font-medium",
        accessor: "amount",
      },
      {
        id: "status",
        header: "Status",
        headerClassName: "min-w-[110px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => <GiftStatusPill status={row.status} />,
      },
      {
        id: "actions",
        header: null,
        headerClassName: "w-[36px] px-3 py-2 text-left",
        cellClassName: "px-3 py-3",
        render: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={`More actions for ${row.title}`}
                className="rounded-full p-1 text-[#9A97A5] transition-colors hover:bg-white hover:text-[#434343]"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border-[#ECE8F7] bg-white p-1.5 shadow-[0_16px_40px_rgba(51,0,201,0.08)]"
            >
              <DropdownMenuItem
                onSelect={() => {
                  const query = row.participantGiftId?.trim()
                    ? `?productId=${encodeURIComponent(row.participantGiftId.trim())}`
                    : "";

                  router.push(
                    `/dashboard/wish-list/${wishlistEventId}/gift/${encodeURIComponent(
                      row.id,
                    )}${query}`,
                  );
                }}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
              >
                View Gift
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    rows: filteredGiftRows,
    getRowKey: (row) => row.id,
    headerRowClassName: "text-[12px] font-medium text-[#7D7D7D]",
    headerCellClassName: "bg-transparent",
    bodyCellClassName:
      "border-y border-[#F0EEFF] bg-white text-[12px] text-[#434343] transition-colors first:border-l first:rounded-l-[12px] last:border-r last:rounded-r-[12px] group-hover:bg-[#F4F0FF]",
    rowClassName: (row) =>
      cn("transition-colors", selectedGiftIds.includes(row.id) ? "" : "group"),
    emptyState: (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-[#7D7D7D]">
          {isGiftsLoading
            ? "Loading wishlist gifts..."
            : isGiftsError
              ? "Unable to load wishlist gifts."
              : "No gift items found."}
        </p>
        {isGiftsError ? (
          <button
            type="button"
            onClick={() => refetchGifts()}
            className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        ) : null}
      </div>
    ),
    emptyRowClassName: "bg-white",
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/wish-list" label="View Details" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-6 text-center text-sm text-[#7D7D7D] sm:p-10">
          Loading wishlist details...
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/wish-list" label="View Details" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-6 text-center sm:p-10">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this wish list right now.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <BackLink href="/dashboard/wish-list" label="View Details" />

      <section>
        <div className="flex flex-col gap-5 pb-5 sm:pb-6">
          <DetailHeader
            title={detail.title}
            subtitle={`Created by ${detail.createdBy}`}
            meta={
              <>
                <span className="inline-flex items-center gap-2 text-xs text-[#7D7D7D]">
                  <CustomCalendarIcon className="size-4" />
                  {detail.createdAt}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium",
                    detail.status === "Completed" &&
                      "bg-[#E6F7EC] text-[#1FAB54]",
                    detail.status === "Draft" &&
                      "bg-[#FFF1DD] text-[#C28A00]",
                    detail.status === "Ongoing" &&
                      "bg-[#EFE6FD] text-[#3300C9]",
                    detail.status === "In Progress" &&
                      "bg-[#EFE6FD] text-[#3300C9]",
                  )}
                >
                  {detail.status}
                </span>
              </>
            }
            avatar={{
              initials: detail.title.slice(0, 2).toUpperCase(),
              color: "#3300C9",
              bg: "#EFE6FD",
            }}
            actions={
              canManageDetail ? (
                <>
                  <Button
                    type="button"
                    onClick={handleOpenEditFlow}
                    className="h-10 rounded-full bg-[#3300C9] px-5 text-sm font-medium text-white hover:bg-[#2D00B4]"
                  >
                    {isOngoingWishlist ? (
                      <InviteEmailIcon className="size-4" />
                    ) : (
                      <PencilIcon className="size-4" />
                    )}
                    {isOngoingWishlist ? "Send Invite" : "Edit Wish List"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={isOngoingWishlist}
                    variant="outline"
                    className={cn(
                      "h-10 rounded-full px-5 text-sm font-medium",
                      isOngoingWishlist
                        ? "border-[#E5E2EE] bg-[#F8F8FB] text-[#B8B5C3] hover:bg-[#F8F8FB] hover:text-[#B8B5C3]"
                        : "border-[#F6C8C8] bg-white text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F]",
                    )}
                  >
                    <Trash2Icon className="size-4" />
                    Delete
                  </Button>
                </>
              ) : isParticipantDetail ? (
                <Button
                  type="button"
                  onClick={handleClaimWishlist}
                  disabled={!canClaimWishlist}
                  className={cn(
                    "h-10 rounded-full px-5 text-sm font-medium",
                    canClaimWishlist
                      ? "bg-[#3300C9] text-white hover:bg-[#2D00B4]"
                      : "bg-[#F8F8FB] text-[#B8B5C3] hover:bg-[#F8F8FB]",
                  )}
                >
                  <GiftIcon className="size-4" />
                  Claim Wishlist
                </Button>
              ) : null
            }
          />

          <div className="overflow-hidden rounded-[20px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              <SummaryStat label="Event Date" value={detail.eventDate} />
              <SummaryStat label="Gift Deadline" value={detail.eventDeadline} />
              <SummaryStat label="Gifts" value={detail.gifts} />
              <SummaryStat
                label="Total Participants"
                value={detail.totalParticipants}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[16px] font-[600] text-[#000000]">
                  {isParticipantDetail ? "Claimed Gift Items" : "Gift Items"}
                </h2>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-[220px]">
                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9A97A5]" />
                    <Input
                      value={giftSearchValue}
                      onChange={(event) => setGiftSearchValue(event.target.value)}
                      placeholder="Search gift......"
                      className="h-[44px] rounded-[16px] border-[#F0EEFF] pl-9 text-xs text-[#434343] placeholder:text-[#9A97A5] focus-visible:border-[#D6CCF5] focus-visible:ring-[#D6CCF5]/40"
                    />
                  </div>

                  <button
                    type="button"
                    aria-label="Filter wishlist gifts"
                    onClick={() => {
                      toast("Gift filters will be connected next.");
                    }}
                    className="flex size-[44px] shrink-0 items-center justify-center rounded-[12px] border border-[#F0EEFF] bg-white transition-colors hover:bg-[#F6F2FF]"
                  >
                    <FilterIcon className="size-4 text-[#434343]" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <div className="min-w-[760px]">
                  <Table
                    data={giftTableData}
                    wrapperClassName="w-full"
                    tableClassName="min-w-full table-auto border-separate border-spacing-y-2"
                  />
                </div>
              </div>

              <Pagination
                total={Math.max(giftsResponse?.data.totalPages ?? 1, 1)}
                initialPage={currentGiftPage}
                onPageChange={setCurrentGiftPage}
                className="mt-4"
              />
            </div>

            <aside className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[16px] font-semibold text-[#000000]">
                  Participants ({detail.participants.length})
                </h2>
              </div>

              <div className="mt-4">
                {visibleParticipants.map((participant) => (
                  <SidebarParticipantRow
                    key={participant.id}
                    participant={participant}
                  />
                ))}
              </div>

              {detail.participants.length > 6 ? (
                <button
                  type="button"
                  onClick={() =>
                    setIsParticipantListExpanded((current) => !current)
                  }
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  {isParticipantListExpanded ? "See Less" : "See More"}
                  <ChevronDownIcon
                    className={cn(
                      "size-4 transition-transform",
                      isParticipantListExpanded && "rotate-180",
                    )}
                  />
                </button>
              ) : null}
            </aside>
          </div>
        </div>
      </section>

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete Wish List"
        description={`Are you sure you want to delete ${detail.title}?`}
        confirmText="Delete"
        isLoading={deleteWishlistEventMutation.isPending}
        closeOnOverlayClick={false}
      />
    </div>
  );
}

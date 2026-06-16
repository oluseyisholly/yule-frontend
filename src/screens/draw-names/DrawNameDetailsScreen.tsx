"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDownIcon,
  Link2Icon,
  MoreHorizontal,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import toast from "react-hot-toast";
import BackLink from "@/components/BackLink";
import DetailHeader from "@/components/DetailHeader";
import ConfirmationModal from "@/components/custom/custom-confirmation-modal";
import InviteEmailIcon from "@/components/icons/InviteEmailIcon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/drop-down";
import CustomCalendarIcon from "@/components/icons/CustomCalendarIcon";
import LocationIcon from "@/components/icons/LocationIcon";
import BirthdayIcon from "@/components/icons/BirthdayIcon";
import { canManageDrawNameEvent } from "@/features/draw-name-events/access";
import { useDeleteDrawNameEventMutation } from "@/features/draw-name-events/hooks/useDeleteDrawNameEventMutation";
import { useDrawNameEventQuery } from "@/features/draw-name-events/hooks/useDrawNameEventQuery";
import { useParticipantGiftsQuery } from "@/features/gifts/hooks/useParticipantGiftsQuery";
import { useGiftRecipientQuery } from "@/features/participants/hooks/useGiftRecipientQuery";
import { useMyParticipantQuery } from "@/features/participants/hooks/useMyParticipantQuery";
import type {
  DrawNameEventListParticipant,
  DrawNameEventRecord,
} from "@/features/draw-name-events/types";
import type { ParticipantGiftRow } from "@/features/gifts/types";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  buildDrawNameFlowHref,
  buildDrawNameFlowSelectionKey,
  useDrawNameFlowStore,
} from "@/stores/draw-name-flow-store";
import {
  isParticipantDrawNameFlowStep,
  type DrawNameModalStep,
} from "@/screens/draw-names/modal-steps";

type DrawNameDetailsScreenProps = {
  drawNameEventId: string;
};

type DetailTab = "participants" | "paired";
type DetailStatus = "Completed" | "Draft" | "Ongoing" | "In Progress";
type DetailParticipant = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  bg: string;
  status: "Drawn" | "Pending";
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

  return initials || "NA";
}

function getParticipantStyle(seed: string) {
  const hash = Array.from(seed).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  );

  return participantPalette[hash % participantPalette.length];
}

function toStatus(record: DrawNameEventRecord): DetailStatus {
  const normalizedStatus = record.event.status?.trim().toLowerCase();

  if (normalizedStatus === "completed") {
    return "Completed";
  }

  if (normalizedStatus === "draft") {
    return "Draft";
  }

  if (normalizedStatus === "ongoing" || record.isDrawCompleted) {
    return "Ongoing";
  }

  return "In Progress";
}

function mapParticipant(
  participant: DrawNameEventListParticipant,
): DetailParticipant | null {
  const actor = participant.eventContact ?? participant.user;

  if (!actor) {
    return null;
  }

  const fullName = `${actor.firstName} ${actor.lastName}`.trim() || "Participant";
  const { bg, color } = getParticipantStyle(
    participant.id || actor.id || fullName,
  );

  return {
    id: participant.id,
    name: fullName,
    role: participant.role === "creator" ? "Admin" : "Participant",
    initials: toInitials(actor.firstName, actor.lastName),
    bg,
    color,
    status: participant.isPairActive ? "Drawn" : "Pending",
  };
}

function buildRules(record: DrawNameEventRecord) {
  const rules = [`${formatCurrency(record.budget || record.maximumSpend)} maximum spend`];
  const status = toStatus(record);

  if (status === "Completed") {
    rules.push("Event has been completed successfully");
  } else if (status === "Draft") {
    rules.push("Event is still in draft");
  } else if (status === "Ongoing") {
    rules.push("Draw is currently ongoing");
  } else {
    rules.push("Draw is currently in progress");
  }

  if (record.event.description?.trim()) {
    rules.push(record.event.description.trim());
  }

  return rules;
}

function SendReminderMenuIcon() {
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 10.7812H11.25M7.125 11.1562C7.125 11.5541 6.96696 11.9356 6.68566 12.2169C6.40436 12.4982 6.02282 12.6562 5.625 12.6562C5.22718 12.6562 4.84564 12.4982 4.56434 12.2169C4.28304 11.9356 4.125 11.5541 4.125 11.1562M5.625 0V1.875M9.84375 10.7812H1.40625V5.625C1.40625 4.50612 1.85072 3.43306 2.64189 2.64189C3.43306 1.85072 4.50612 1.40625 5.625 1.40625C6.74388 1.40625 7.81694 1.85072 8.60811 2.64189C9.39928 3.43306 9.84375 4.50612 9.84375 5.625V10.7812Z"
        stroke="#7D7D7D"
        strokeWidth="0.9375"
      />
    </svg>
  );
}

function ViewGiftMenuIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.2312 1.56661H8.74375C8.80104 1.35624 8.80174 1.13446 8.74576 0.92374C8.68979 0.713015 8.57913 0.520819 8.425 0.366608C8.18895 0.134908 7.87139 0.00510067 7.54063 0.00510067C7.20986 0.00510067 6.8923 0.134908 6.65625 0.366608L5.58437 1.44098L4.51562 0.366608C4.39953 0.250388 4.26167 0.158189 4.10993 0.0952837C3.95818 0.0323783 3.79552 0 3.63125 0C3.46698 0 3.30432 0.0323783 3.15257 0.0952837C3.00083 0.158189 2.86297 0.250388 2.74688 0.366608C2.59274 0.520819 2.48209 0.713015 2.42611 0.92374C2.37014 1.13446 2.37083 1.35624 2.42812 1.56661H0.9375C0.68886 1.56661 0.450403 1.66538 0.274587 1.8412C0.0987721 2.01701 0 2.25547 0 2.50411V3.12911C0.000346235 3.31474 0.056165 3.49604 0.160291 3.64972C0.264417 3.80341 0.412098 3.92246 0.584375 3.99161V9.61036C0.585529 10.0244 0.75052 10.4212 1.0433 10.7139C1.33607 11.0067 1.73283 11.1717 2.14687 11.1729H9.02187C9.43628 11.1729 9.8337 11.0082 10.1267 10.7152C10.4198 10.4222 10.5844 10.0248 10.5844 9.61036V3.99786C10.7572 3.92739 10.9053 3.80724 11.0099 3.6526C11.1145 3.49796 11.1708 3.31578 11.1719 3.12911V2.50411C11.1719 2.38073 11.1475 2.25857 11.1002 2.14462C11.0529 2.03067 10.9836 1.92718 10.8962 1.84009C10.8088 1.75299 10.7051 1.684 10.591 1.63707C10.4769 1.59014 10.3546 1.5662 10.2312 1.56661ZM3.1875 0.809733C3.3046 0.693326 3.46301 0.627988 3.62812 0.627988C3.79324 0.627988 3.95165 0.693326 4.06875 0.809733L4.825 1.56661H3.09375C3.02259 1.44811 2.99316 1.30919 3.01015 1.17201C3.02714 1.03483 3.08958 0.907292 3.1875 0.809733ZM4.95937 10.5479H2.14687C1.89823 10.5479 1.65978 10.4491 1.48396 10.2733C1.30815 10.0975 1.20937 9.859 1.20937 9.61036V4.06661H4.95937V10.5479ZM4.95937 3.44161H0.9375C0.85462 3.44161 0.775134 3.40868 0.716529 3.35008C0.657924 3.29147 0.625 3.21199 0.625 3.12911V2.50411C0.625 2.42123 0.657924 2.34174 0.716529 2.28314C0.775134 2.22453 0.85462 2.19161 0.9375 2.19161H4.95937V3.44161ZM7.10312 0.809733C7.21063 0.702861 7.3533 0.638701 7.50459 0.629199C7.65588 0.619698 7.80546 0.665502 7.92549 0.758084C8.04552 0.850666 8.12781 0.983715 8.15704 1.13246C8.18627 1.2812 8.16044 1.43549 8.08437 1.56661H6.34688L7.10312 0.809733ZM9.95937 9.61036C9.95937 9.859 9.8606 10.0975 9.68479 10.2733C9.50897 10.4491 9.27052 10.5479 9.02187 10.5479H6.20937V4.06661H9.95937V9.61036ZM10.5469 3.12911C10.5469 3.21199 10.514 3.29147 10.4553 3.35008C10.3967 3.40868 10.3173 3.44161 10.2344 3.44161H6.20937V2.19161H10.2344C10.3173 2.19161 10.3967 2.22453 10.4553 2.28314C10.514 2.34174 10.5469 2.42123 10.5469 2.50411V3.12911Z"
        fill="#7D7D7D"
      />
    </svg>
  );
}

function DrawNameActionIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.333 9.167v6.666c0 .442.176.866.488 1.179.313.312.737.488 1.179.488h10c.442 0 .866-.176 1.178-.488.313-.313.489-.737.489-1.179V9.167"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 4.583c0-.773-.308-1.515-.854-2.061a2.917 2.917 0 0 0-2.063-.855c-.552 0-1.082.22-1.473.61a2.083 2.083 0 0 0-.61 1.473A2.083 2.083 0 0 0 7.083 5.833H10m0-1.25v1.25m0-1.25c0-.773.307-1.515.854-2.061a2.917 2.917 0 0 1 2.063-.855c.552 0 1.082.22 1.473.61.39.391.61.921.61 1.473 0 .273-.053.544-.158.794s-.26.477-.452.668c-.193.193-.422.346-.674.45-.252.105-.523.158-.795.158H10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M10 9.167V17.5M2.5 5.833h15v3.334h-15V5.833Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function PairedAvatarBadge({
  participant,
}: {
  participant: DetailParticipant;
}) {
  return (
    <span className="relative flex size-[46px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_10px_26px_rgba(26,19,61,0.18)] sm:size-[54px] sm:border-[4px]">
      <span
        className="flex size-full items-center justify-center rounded-full text-[15px] font-semibold"
        style={{
          backgroundColor: participant.bg,
          color: participant.color,
        }}
        title={participant.name}
        aria-label={`Paired with ${participant.name}`}
      >
        {participant.initials}
      </span>

      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-[#191A1F]/45">
        <Link2Icon className="size-4 text-white" strokeWidth={2.1} />
      </span>
    </span>
  );
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

function formatCompactPrice(amount?: string | number | null) {
  const numericValue =
    typeof amount === "number" ? amount : Number(amount?.toString() ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatConditionLabel(condition?: string | null) {
  if (!condition?.trim()) {
    return "Selected gift";
  }

  return condition
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

function getGiftImage(gift: ParticipantGiftRow) {
  const firstGalleryImage = gift.images?.find((image) => Boolean(image?.trim()));

  return firstGalleryImage || gift.imageUrl?.trim() || "";
}

function PairedGiftPreviewCard({
  gift,
  onViewGift,
}: {
  gift: ParticipantGiftRow;
  onViewGift: () => void;
}) {
  const primaryImage = getGiftImage(gift);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onViewGift}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewGift();
        }
      }}
      className="group flex cursor-pointer flex-col gap-3 rounded-[16px] border border-[#EEEAF7] bg-[#FCFBFF] p-3 transition-all hover:border-[#D8CEF8] hover:shadow-[0_10px_28px_rgba(51,0,201,0.08)]"
    >
      <div className="relative h-[130px] w-full overflow-hidden rounded-[12px] bg-[#F4F2FA]">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={gift.title?.trim() || "Selected gift"}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#8A8892]">
            No image
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-[#1E1E1E]">
              {gift.title?.trim() || "Selected gift"}
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#7D7D7D]">
              {gift.description?.trim() || "No description available yet."}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#E8DDFE] bg-white px-2 py-1 text-[10px] font-medium text-[#3300C9]">
            {formatConditionLabel(gift.condition)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[16px] font-semibold text-[#3300C9]">
            ₦{formatCompactPrice(gift.amount)}
          </span>
          <span className="rounded-full bg-[#F3EFFB] px-3 py-1 text-[11px] font-medium text-[#3300C9]">
            View gift
          </span>
        </div>
      </div>
    </div>
  );
}

function ParticipantRow({
  participant,
  menuVariant = "default",
  onSendReminder,
  onViewGift,
}: {
  participant: DetailParticipant;
  menuVariant?: "default" | "paired";
  onSendReminder?: () => void;
  onViewGift?: () => void;
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

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-[11px] font-medium",
            participant.status === "Drawn"
              ? "bg-[#E6F7EC] text-[#1FAB54]"
              : "bg-[#FFF1DD] text-[#C28A00]",
          )}
        >
          {participant.status}
        </span>

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
            className=" rounded-xl border-[#ECE8F7] bg-white p-1.5 shadow-[0_16px_40px_rgba(51,0,201,0.08)]"
          >
            {menuVariant === "paired" ? (
              <>
                <DropdownMenuItem
                  onSelect={onSendReminder}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
                >
                  <SendReminderMenuIcon />
                  Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={onViewGift}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]"
                >
                  <ViewGiftMenuIcon />
                  View Gift
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]">
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-[#434343] focus:bg-[#F6F2FF] focus:text-[#3300C9]">
                  Send Reminder
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function DrawNameDetailsScreen({
  drawNameEventId,
}: DrawNameDetailsScreenProps) {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const currentContactId = useAuthStore((state) => state.currentContactId);
  const [activeTab, setActiveTab] = useState<DetailTab>("participants");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const deleteDrawNameEventMutation = useDeleteDrawNameEventMutation();
  const { data, isLoading, isError, refetch } = useDrawNameEventQuery(
    drawNameEventId,
  );
  const canManageDetail = useMemo(
    () =>
      canManageDrawNameEvent(data?.data, {
        currentUserId: authUser?.id?.trim() || null,
        currentContactId: currentContactId?.trim() || null,
      }),
    [authUser?.id, currentContactId, data?.data],
  );
  const {
    data: giftRecipientResponse,
    isLoading: isGiftRecipientLoading,
    isFetching: isGiftRecipientFetching,
    isError: isGiftRecipientError,
    refetch: refetchGiftRecipient,
  } = useGiftRecipientQuery(data?.data?.event.id ?? null, {
    enabled: Boolean(data?.data?.event.id),
  });
  const creatorFlowSelection = useDrawNameFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildDrawNameFlowSelectionKey(
          "creator",
          drawNameEventId,
          data?.data?.eventId ?? null,
        )
      ] ?? null,
  );
  const participantFlowSelection = useDrawNameFlowStore(
    (state) =>
      state.flowSelectionsByKey[
        buildDrawNameFlowSelectionKey(
          "participant",
          drawNameEventId,
          data?.data?.eventId ?? null,
        )
      ] ?? null,
  );
  const { data: myParticipantResponse } = useMyParticipantQuery(
    data?.data?.event.id ?? null,
    {
      enabled: Boolean(data?.data?.event.id) && !canManageDetail,
    },
  );

  useEffect(() => {
    if (!canManageDetail && activeTab !== "paired") {
      setActiveTab("paired");
    }
  }, [activeTab, canManageDetail]);

  const detail = useMemo(() => {
    const record = data?.data;

    if (!record) {
      return null;
    }

    const status = toStatus(record);
    const participants = (record.event.participants ?? [])
      .map((participant) => mapParticipant(participant))
      .filter((participant): participant is DetailParticipant => Boolean(participant));
    const createdBy = record.event.createdBy
      ? `${record.event.createdBy.firstName} ${record.event.createdBy.lastName}`.trim()
      : "Unknown";

    return {
      title: record.event.title || "Untitled Event",
      eventId: record.event.id,
      createdBy: createdBy || "Unknown",
      createdAt: formatMonthYear(record.createdAt),
      status,
      isDrawCompleted: record.isDrawCompleted,
      eventDate: formatDate(record.event.eventDate),
      drawDate: formatDate(record.drawDate),
      budget: formatCurrency(record.budget || record.maximumSpend),
      totalParticipants: String(participants.length),
      participants,
      location: record.location?.trim() || "-",
      rules: buildRules(record),
    };
  }, [data]);

  const pairedParticipant = useMemo<DetailParticipant | null>(() => {
    const recipientContact = giftRecipientResponse?.data?.eventContact;
    const recipientParticipantId = giftRecipientResponse?.data?.id?.trim();

    if (!recipientContact) {
      return null;
    }

    const matchedParticipant = recipientParticipantId
      ? detail?.participants.find(
          (participant) => participant.id.trim() === recipientParticipantId,
        ) ?? null
      : null;

    const name =
      `${recipientContact.firstName} ${recipientContact.lastName}`.trim() ||
      "Gift Recipient";
    const { bg, color } = getParticipantStyle(
      giftRecipientResponse?.data?.id || recipientContact.id || name,
    );

    return {
      id: giftRecipientResponse?.data?.id || recipientContact.id || name,
      name,
      initials: toInitials(
        recipientContact.firstName,
        recipientContact.lastName,
      ),
      bg,
      color,
      role: recipientContact.email || "Gift Recipient",
      status: matchedParticipant?.status ?? "Pending",
    };
  }, [detail?.participants, giftRecipientResponse]);
  const pairedParticipantId = giftRecipientResponse?.data?.id?.trim() || null;
  const {
    data: pairedParticipantGiftsResponse,
    isLoading: isPairedParticipantGiftsLoading,
    isFetching: isPairedParticipantGiftsFetching,
    isError: isPairedParticipantGiftsError,
    refetch: refetchPairedParticipantGifts,
  } = useParticipantGiftsQuery(
    pairedParticipantId,
    detail?.eventId ?? null,
    {
      page: 1,
      per_page: 5,
    },
    {
      enabled: Boolean(pairedParticipantId) && Boolean(detail?.eventId),
    },
  );
  const pairedParticipantGiftPreview = useMemo(
    () => pairedParticipantGiftsResponse?.data?.data ?? [],
    [pairedParticipantGiftsResponse?.data?.data],
  );

  const isCompletedInviteState = detail?.status === "Completed";
  const isOngoingInviteState = detail?.status === "Ongoing";
  const isInviteState = isCompletedInviteState || isOngoingInviteState;
  const storedParticipantResumeStep =
    participantFlowSelection?.lastVisitedStep ?? null;
  const participantResumeStep = isParticipantDrawNameFlowStep(
    storedParticipantResumeStep,
  )
    ? (storedParticipantResumeStep as DrawNameModalStep)
    : ("wishlist-gifts" as DrawNameModalStep);
  const isParticipantDrawDisabled =
    !canManageDetail && myParticipantResponse?.data?.isPairActive === true;
  const canParticipantDraw =
    !canManageDetail &&
    detail?.status === "Ongoing" &&
    Boolean(myParticipantResponse?.data?.id) &&
    !isParticipantDrawDisabled;
  const canOpenPrimaryAction = canManageDetail
    ? !isCompletedInviteState
    : canParticipantDraw;
  const primaryActionLabel = canManageDetail
    ? isInviteState
      ? "Send Invite"
      : "Edit"
    : "Draw Name";

  const handlePrimaryAction = () => {
    if (!detail?.eventId || !canOpenPrimaryAction) {
      return;
    }

    const resumeStep = canManageDetail
      ? isOngoingInviteState
        ? ("draw-invite" as DrawNameModalStep)
        : creatorFlowSelection?.lastVisitedStep || ("event" as DrawNameModalStep)
      : participantResumeStep;

    router.push(
      buildDrawNameFlowHref(
        resumeStep,
        detail.eventId,
        drawNameEventId,
      ),
    );
  };

  const handleDelete = async () => {
    if (!canManageDetail) {
      return;
    }

    try {
      const response = await deleteDrawNameEventMutation.mutateAsync(
        drawNameEventId,
      );
      toast.success(response.message);
      setIsDeleteModalOpen(false);
      router.push("/dashboard/draw-names");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete this draw right now.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/draw-names" label="View Details" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center text-sm text-[#7D7D7D]">
          Loading draw details...
        </div>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="space-y-5">
        <BackLink href="/dashboard/draw-names" label="View Details" />
        <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-10 text-center">
          <p className="text-sm text-[#7D7D7D]">
            Unable to load this draw right now.
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

  const pairedContent =
    isGiftRecipientLoading || isGiftRecipientFetching ? (
      <div className="rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
        Loading pairing details...
      </div>
    ) : isGiftRecipientError ? (
      <div className="rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
        <p>Unable to load your gift recipient right now.</p>
        <button
          type="button"
          onClick={() => refetchGiftRecipient()}
          className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
        >
          Retry
        </button>
      </div>
    ) : pairedParticipant ? (
      <>
        <h2 className="text-[16px] font-[600] text-[#000000]">
          You&apos;re paired with
        </h2>

        <div className="mt-4">
          <ParticipantRow
            participant={pairedParticipant}
            menuVariant="paired"
            onSendReminder={() => {
              toast("Send reminder is not available yet.");
            }}
            onViewGift={() => {
              const pairedParticipantId = giftRecipientResponse?.data?.id?.trim();

              if (!pairedParticipantId) {
                toast.error("Unable to open this gift right now.");
                return;
              }

              router.push(
                `/dashboard/draw-names/${drawNameEventId}/gift?participantId=${pairedParticipantId}`,
              );
            }}
          />
        </div>

        <div className="mt-6 border-t border-[#F1EDF8] pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1E1E1E]">
                Gift Selections
              </h3>
              <p className="mt-1 text-[12px] text-[#7D7D7D]">
                A quick look at what {pairedParticipant.name.split(" ")[0] || "your pair"} has picked.
              </p>
            </div>
            {pairedParticipantGiftPreview.length > 0 ? (
              <span className="rounded-full bg-[#F3EFFB] px-3 py-1 text-[11px] font-medium text-[#3300C9]">
                {pairedParticipantGiftPreview.length} of{" "}
                {pairedParticipantGiftsResponse?.data?.total ?? pairedParticipantGiftPreview.length}
              </span>
            ) : null}
          </div>

          {isPairedParticipantGiftsLoading || isPairedParticipantGiftsFetching ? (
            <div className="mt-4 rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
              Loading gift selections...
            </div>
          ) : isPairedParticipantGiftsError ? (
            <div className="mt-4 rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
              <p>Unable to load gift selections right now.</p>
              <button
                type="button"
                onClick={() => void refetchPairedParticipantGifts()}
                className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
              >
                Retry
              </button>
            </div>
          ) : pairedParticipantGiftPreview.length > 0 ? (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {pairedParticipantGiftPreview.map((gift) => {
                  const selectedGiftId =
                    gift.participantGiftId?.trim() || gift.id?.trim();

                  return (
                    <PairedGiftPreviewCard
                      key={gift.id}
                      gift={gift}
                      onViewGift={() => {
                        if (!pairedParticipantId || !selectedGiftId) {
                          toast.error("Unable to open this gift right now.");
                          return;
                        }

                        router.push(
                          `/dashboard/draw-names/${drawNameEventId}/gift/${selectedGiftId}?participantId=${pairedParticipantId}`,
                        );
                      }}
                    />
                  );
                })}
              </div>

              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!pairedParticipantId) {
                      toast.error("Unable to open these gifts right now.");
                      return;
                    }

                    router.push(
                      `/dashboard/draw-names/${drawNameEventId}/gift?participantId=${pairedParticipantId}`,
                    );
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-[#DCD4F6] bg-white px-5 py-2.5 text-sm font-medium text-[#3300C9] transition-colors hover:bg-[#F6F2FF]"
                >
                  View more
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-[14px] border border-dashed border-[#DDD7F1] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
              No gift selections have been added here yet.
            </div>
          )}
        </div>
      </>
    ) : (
      <div className="rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
        Pairing details are not available yet.
      </div>
    );

  return (
    <div className="space-y-5">
      <BackLink href="/dashboard/draw-names" label="View Details" />

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
            avatarBadge={
              pairedParticipant ? (
                <PairedAvatarBadge participant={pairedParticipant} />
              ) : null
            }
            actions={
              <>
                <Button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={!canOpenPrimaryAction}
                  className="h-10 rounded-full bg-[#3300C9] px-5 text-sm font-medium text-white hover:bg-[#2D00B4]"
                >
                  {primaryActionLabel === "Draw Name" ? (
                    <DrawNameActionIcon className="size-4 shrink-0" />
                  ) : primaryActionLabel === "Send Invite" ? (
                    <InviteEmailIcon className="size-4 shrink-0" />
                  ) : (
                    <PencilIcon className="size-4 shrink-0" />
                  )}
                  {primaryActionLabel}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (isInviteState || !canManageDetail) {
                      return;
                    }

                    setIsDeleteModalOpen(true);
                  }}
                  variant="outline"
                  disabled={isInviteState || !canManageDetail}
                  className={cn(
                    "h-10 rounded-full px-5 text-sm font-medium",
                    isInviteState || !canManageDetail
                      ? "border-[#E4E0EE] bg-[#F7F6FA] text-[#B8B5C3] hover:bg-[#F7F6FA] hover:text-[#B8B5C3]"
                      : "border-[#F6C8C8] bg-white text-[#E04F4F] hover:bg-[#FFF5F5] hover:text-[#E04F4F]",
                  )}
                >
                  <Trash2Icon className="size-4" />
                  Delete
                </Button>
              </>
            }
          />

          <div className="overflow-hidden rounded-[20px]">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
              <SummaryStat label="Gift Exchange Date" value={detail.eventDate} />
              <SummaryStat label="Maximum Spend" value={detail.budget} />
              <SummaryStat label="Draw Date" value={detail.drawDate} />
              <SummaryStat
                label="Total Participants"
                value={detail.totalParticipants}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
            <div className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <div className="-mx-1 flex items-center gap-4 overflow-x-auto border-b border-[#F1EDF8] px-1 sm:gap-6">
                {canManageDetail ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("participants")}
                    className={cn(
                      "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                      activeTab === "participants"
                        ? "border-[#3300C9] text-[#3300C9]"
                        : "border-transparent text-[#9A97A5]",
                    )}
                  >
                    Participants
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setActiveTab("paired")}
                  className={cn(
                    "border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                    activeTab === "paired"
                      ? "border-[#3300C9] text-[#3300C9]"
                      : "border-transparent text-[#9A97A5]",
                  )}
                >
                  You&apos;re paired with
                </button>
              </div>

              <div className="pt-5">
                {activeTab === "participants" && canManageDetail ? (
                  <>
                    <h2 className="text-[16px] font-[600] text-[#000000]">
                      Participants
                    </h2>

                    <div className="mt-4">
                      {detail.participants.map((participant) => (
                        <ParticipantRow
                          key={participant.id}
                          participant={participant}
                          menuVariant="paired"
                          onSendReminder={() => {
                            toast("Send reminder is not available yet.");
                          }}
                          onViewGift={() => {
                            router.push(
                              `/dashboard/draw-names/${drawNameEventId}/gift?participantId=${participant.id}`,
                            );
                          }}
                        />
                      ))}
                    </div>

                    {detail.participants.length > 5 ? (
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                      >
                        See More
                        <ChevronDownIcon className="size-4" />
                      </button>
                    ) : null}
                  </>
                ) : (
                  pairedContent
                )}
              </div>
            </div>

            <aside className="rounded-[20px] border border-[#EEEAF7] bg-white p-4 sm:p-5">
              <h2 className="text-[16px] font-semibold text-[#000000]">
                Other Information
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-[14px] font-[500] text-[#434343]">
                    Location
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-[12px] font-[400] text-sm text-[#434343]">
                    <LocationIcon className="size-4 text-[#7D7D7D]" />
                    {detail.location}
                  </p>
                </div>

                <div>
                  <p className="text-[14px] font-[500] text-[#7D7D7D]">
                    Event Name
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-[12px] font-[400] text-sm text-[#434343]">
                    <BirthdayIcon className="size-4 text-[#7D7D7D]" />
                    {detail.title}
                  </p>
                </div>

                <div>
                  <p className="text-[14px] text-[#434343]">
                    Event Rules & Guidelines
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {detail.rules.map((rule) => (
                      <li
                        key={rule}
                        className="flex items-center gap-1 text-xs text-[#7D7D7D]"
                      >
                        <div className="mt-0.5 h-[5px] w-[5px] shrink-0 rounded-full bg-[#3300C9]" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <ConfirmationModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        action="delete"
        title="Delete Draw"
        description={`Are you sure you want to delete ${detail.title}?`}
        confirmText="Delete"
        isLoading={deleteDrawNameEventMutation.isPending}
        closeOnOverlayClick={false}
        closeOnEscape={false}
      />
    </div>
  );
}

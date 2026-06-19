"use client";

import type { ReactNode } from "react";
import BackButton from "@/components/BackButton";
import { InviteLinksLoadingSkeleton } from "@/components/ui/context-skeletons";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

export type DrawNameInviteParticipant = {
  id: string;
  participantId: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  inviteUrl?: string | null;
};

type DrawNameInviteStepProps = {
  title?: ReactNode;
  onBack: () => void;
  participants: DrawNameInviteParticipant[];
  isCopyListOpen: boolean;
  onToggleCopyList: () => void;
  onSendEmail: () => void;
  onCopyLink: (participantId: string) => void;
  isSendingEmail?: boolean;
  isLoadingLinks?: boolean;
  isLinksError?: boolean;
  onRetryLinks?: () => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
};

const inviteOptions = [
  {
    label: "SMS",
    iconSrc: "/invite-sms.svg",
    iconClassName: "h-[35px] w-[29px]",
  },
  {
    label: "Email",
    iconSrc: "/invite-email.svg",
    iconClassName: "h-[31px] w-[38px]",
  },
  {
    label: "App",
    iconSrc: "/invite-app.svg",
    iconClassName: "h-[38px] w-[38px]",
  },
  {
    label: "Facebook",
    iconSrc: "/invite-facebook.svg",
    iconClassName: "h-[38px] w-[38px]",
  },
  {
    label: "WhatsApp",
    iconSrc: "/invite-whatsapp.svg",
    iconClassName: "h-[37px] w-[37px]",
  },
  {
    label: "Copy",
    iconSrc: "/invite-copy.svg",
    iconClassName: "h-[38px] w-[38px]",
  },
] as const;

export default function DrawNameInviteStep({
  title,
  onBack,
  participants,
  isCopyListOpen,
  onToggleCopyList,
  onSendEmail,
  onCopyLink,
  isSendingEmail = false,
  isLoadingLinks = false,
  isLinksError = false,
  onRetryLinks,
  searchValue,
  onSearchValueChange,
}: DrawNameInviteStepProps) {
  return (
    <div className="space-y-8 pt-2 sm:space-y-12">
      <div className="space-y-4 text-center">
        <p className="text-[20px] font-normal leading-[1.35] text-[#434343] sm:text-[24px]">
          {title ?? (
            <>
              Invite members of the group to draw
              <br />
              a name.
            </>
          )}
        </p>
      </div>

      <div className="rounded-[10px] bg-[#3300C9] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:flex-nowrap sm:justify-between">
          {inviteOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-label={option.label}
              onClick={
                option.label === "Email"
                  ? onSendEmail
                  : option.label === "Copy"
                    ? onToggleCopyList
                    : undefined
              }
              disabled={
                isSendingEmail ||
                !["Email", "Copy"].includes(option.label)
              }
              className={cn(
                "inline-flex h-[38px] w-[38px] items-center justify-center transition-opacity",
                ["Email", "Copy"].includes(option.label)
                  ? "cursor-pointer hover:opacity-90"
                  : "cursor-not-allowed opacity-60",
              )}
            >
              <img
                src={option.iconSrc}
                alt=""
                aria-hidden="true"
                className={option.iconClassName}
              />
            </button>
          ))}
        </div>
      </div>

      {isCopyListOpen ? (
        <div className="space-y-4 rounded-[18px] border border-[#EEEAF7] bg-white px-5 py-5">
          <div className="space-y-1">
            <p className="text-[16px] font-semibold text-[#1E1E1E]">
              Copy invitation links
            </p>
            <p className="text-[12px] text-[#7D7D7D]">
              Copy the unique invitation link for each participant.
            </p>
          </div>

          <SearchInput
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Search participant"
            containerClassName="w-full"
            className="h-10 rounded-[12px] border-[#ECE8F7] bg-[#FFFFFF] text-[13px] placeholder:text-[#9A97A5]"
          />

          {isLoadingLinks ? (
            <div className="rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5">
              <InviteLinksLoadingSkeleton rows={4} />
            </div>
          ) : isLinksError ? (
            <div className="rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
              <p>Unable to load invitation links right now.</p>
              {onRetryLinks ? (
                <button
                  type="button"
                  onClick={onRetryLinks}
                  className="mt-3 text-sm font-medium text-[#3300C9] transition-colors hover:text-[#2400A1]"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : participants.length ? (
            <div className="max-h-[200px] space-y-1 overflow-y-auto pr-1">
              {participants.map((participant) => (
                <div
                  key={participant.participantId}
                  className="flex items-center justify-between gap-3 border-b border-[#F1EDF8] py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: participant.avatarBg,
                        color: participant.avatarColor,
                      }}
                    >
                      {participant.initials}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#1E1E1E]">
                        {participant.name}
                      </p>
                      <p className="truncate text-xs text-[#7D7D7D]">
                        {participant.role}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Copy invitation link for ${participant.name}`}
                    onClick={() => onCopyLink(participant.participantId)}
                    disabled={!participant.inviteUrl}
                    className={cn(
                      "inline-flex h-[28px] w-[28px] items-center justify-center rounded-[10px] transition-colors",
                      participant.inviteUrl
                        ? "cursor-pointer bg-[#F6F2FF] hover:bg-[#EEE7FF]"
                        : "cursor-not-allowed bg-[#F7F6FA] opacity-60",
                    )}
                  >
                    <img
                      src="/invite-copy.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-[20px] w-[20px]"
                    />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[14px] border border-[#F1EDF8] bg-[#FCFBFF] px-4 py-5 text-sm text-[#7D7D7D]">
              No participants available for invitation yet.
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-center pt-2">
        <BackButton
          onClick={onBack}
          className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
          iconClassName="size-[24px]"
        />
      </div>
    </div>
  );
}

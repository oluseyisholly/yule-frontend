"use client";

import type { ReactNode } from "react";
import BackButton from "@/components/BackButton";
import { cn } from "@/lib/utils";

export type DrawNameInviteParticipant = {
  id: string;
  participantId: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  email?: string | null;
  profileUrl?: string | null;
  inviteUrl?: string | null;
};

type DrawNameInviteStepProps = {
  title?: ReactNode;
  onBack?: (() => void) | undefined;
  onSendEmail: () => void;
  onShareFacebook: () => void;
  onShareWhatsApp: () => void;
  onCopyLink: (participantId: string) => void | Promise<void>;
  participants?: DrawNameInviteParticipant[];
  isCopyListOpen?: boolean;
  onToggleCopyList?: () => void;
  isLoadingLinks?: boolean;
  isLinksError?: boolean;
  onRetryLinks?: () => void;
  searchValue?: string;
  onSearchValueChange?: (value: string) => void;
  isSendingEmail?: boolean;
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
  onSendEmail,
  onShareFacebook,
  onShareWhatsApp,
  onCopyLink,
  participants = [],
  isCopyListOpen = false,
  onToggleCopyList,
  isLoadingLinks = false,
  isLinksError = false,
  onRetryLinks,
  searchValue = "",
  onSearchValueChange,
  isSendingEmail = false,
}: DrawNameInviteStepProps) {
  const filteredParticipants = participants.filter((participant) => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    if (!normalizedSearchValue) {
      return true;
    }

    return [participant.name, participant.email ?? "", participant.role]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearchValue);
  });

  return (
    <div className="space-y-8 pt-2 sm:space-y-12 min-h-[300px]">
      <div className="space-y-4 text-center">
        <p className="text-[20px] font-normal leading-[1.35] text-[#434343] sm:text-[24px]">
          {title ?? (
            <>
              Invite members of the group to draw
              <br />a name.
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
                  : option.label === "Facebook"
                    ? onShareFacebook
                    : option.label === "WhatsApp"
                      ? onShareWhatsApp
                      : option.label === "Copy"
                        ? (onToggleCopyList ?? (() => onCopyLink("")))
                        : undefined
              }
              disabled={
                isSendingEmail ||
                !["Email", "Copy", "Facebook", "WhatsApp"].includes(
                  option.label,
                )
              }
              className={cn(
                "inline-flex h-[38px] w-[38px] items-center justify-center transition-opacity",
                ["Email", "Copy", "Facebook", "WhatsApp"].includes(option.label)
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
        <div className="rounded-[18px] border border-[#ECE8F7] bg-white p-4 shadow-[0_18px_40px_rgba(26,19,61,0.08)]">
          <div className="space-y-3">
            <p className="text-[14px] font-semibold text-[#434343]">
              Copy invitation link
            </p>

            {onSearchValueChange ? (
              <input
                type="search"
                value={searchValue}
                onChange={(event) => onSearchValueChange(event.target.value)}
                placeholder="Search participant"
                className="h-10 w-full rounded-[12px] border border-[#ECE8F7] bg-white px-4 text-[13px] text-[#434343] outline-none placeholder:text-[#A7A1BA] focus:border-[#3300C9]"
              />
            ) : null}
          </div>

          <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
            {isLoadingLinks ? (
              <div className="rounded-[12px] bg-[#F6F3FF] px-4 py-3 text-[13px] text-[#6B647A]">
                Loading invitation links...
              </div>
            ) : isLinksError ? (
              <div className="space-y-3 rounded-[12px] bg-[#FFF4F3] px-4 py-3 text-[13px] text-[#A43B32]">
                <p>Unable to load invitation links.</p>
                {onRetryLinks ? (
                  <button
                    type="button"
                    onClick={onRetryLinks}
                    className="font-semibold text-[#3300C9]"
                  >
                    Retry
                  </button>
                ) : null}
              </div>
            ) : filteredParticipants.length ? (
              filteredParticipants.map((participant) => (
                <div
                  key={participant.participantId || participant.id}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-[#F1EEFA] px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {participant.profileUrl ? (
                      <img
                        src={participant.profileUrl}
                        alt=""
                        className="size-9 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex size-9 items-center justify-center rounded-full text-[12px] font-semibold"
                        style={{
                          backgroundColor: participant.avatarBg,
                          color: participant.avatarColor,
                        }}
                      >
                        {participant.initials}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#434343]">
                        {participant.name}
                      </span>
                      <span className="block truncate text-[12px] text-[#8C8799]">
                        {participant.email || participant.role}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onCopyLink(participant.participantId)}
                    className="shrink-0 rounded-full bg-[#F3EFFB] px-3 py-1.5 text-[12px] font-semibold text-[#3300C9] transition-colors hover:bg-[#E8E0FA]"
                  >
                    Copy
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-[12px] bg-[#F6F3FF] px-4 py-3 text-[13px] text-[#6B647A]">
                No participants found.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {onBack ? (
        <div className="flex justify-center pt-2">
          <BackButton
            onClick={onBack}
            className="flex h-[44px] min-w-[82px] items-center justify-center rounded-[16px] bg-[#F3EFFB] px-6 text-[#3300C9] transition-colors hover:bg-[#ECE6FB]"
            iconClassName="size-[24px]"
          />
        </div>
      ) : null}
    </div>
  );
}

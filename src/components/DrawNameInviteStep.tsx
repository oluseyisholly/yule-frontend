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
  onBack: () => void;
  onSendEmail: () => void;
  onCopyLink: () => void;
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
  onCopyLink,
  isSendingEmail = false,
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
                    ? onCopyLink
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

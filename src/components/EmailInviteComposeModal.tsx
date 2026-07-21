"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RichTextComposer from "@/components/RichTextComposer";
import ContentModal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

type EmailInviteComposeModalProps = {
  open: boolean;
  onClose: () => void;
  initialTitle: string;
  initialBody?: string;
  lockedEmails: string[];
  onSubmit: (payload: {
    title: string;
    body: string;
    emails: string[];
  }) => Promise<void> | void;
  isSubmitting?: boolean;
  hasBody?: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function uniqueEmails(emails: string[]) {
  const seen = new Set<string>();

  return emails
    .map((email) => email.trim())
    .filter(Boolean)
    .filter((email) => {
      const normalizedEmail = normalizeEmail(email);

      if (seen.has(normalizedEmail)) {
        return false;
      }

      seen.add(normalizedEmail);
      return true;
    });
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

export default function EmailInviteComposeModal({
  open,
  onClose,
  initialTitle,
  initialBody = "",
  lockedEmails,
  onSubmit,
  isSubmitting = false,
  hasBody = true,
}: EmailInviteComposeModalProps) {
  const normalizedLockedEmails = useMemo(
    () => uniqueEmails(lockedEmails),
    [lockedEmails],
  );
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (wasOpenRef.current) {
      return;
    }

    wasOpenRef.current = true;
    setTitle(initialTitle);
    setBody(initialBody);
    setEmailInput("");
    setExtraEmails([]);
    setErrorMessage("");
  }, [initialBody, initialTitle, open]);

  const allEmails = useMemo(
    () => uniqueEmails([...normalizedLockedEmails, ...extraEmails]),
    [extraEmails, normalizedLockedEmails],
  );

  const handleAddEmail = () => {
    const email = emailInput.trim();

    if (!email) {
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const alreadyExists = allEmails.some(
      (currentEmail) => normalizeEmail(currentEmail) === normalizedEmail,
    );

    if (alreadyExists) {
      setErrorMessage("This email has already been added.");
      return;
    }

    setExtraEmails((current) => [...current, email]);
    setEmailInput("");
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = getPlainTextFromHtml(body);

    if (!trimmedTitle) {
      setErrorMessage("Please provide an email title.");
      return;
    }

    if (!trimmedBody && hasBody) {
      setErrorMessage("Please write a message for the email body.");
      return;
    }

    if (!allEmails.length) {
      setErrorMessage("Please add at least one recipient email.");
      return;
    }

    setErrorMessage("");
    await onSubmit({
      title: trimmedTitle,
      body,
      emails: allEmails,
    });
  };

  return (
    <ContentModal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      showHeader={false}
      closeOnOverlayClick={false}
      closeOnEscape={!isSubmitting}
      bodyScrollable={false}
      dialogClassName="w-[calc(100%-24px)] max-w-[620px] overflow-hidden bg-white"
      bodyClassName="!p-0"
    >
      <div className="flex max-h-[calc(100dvh-32px)] min-h-0 flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 border-b border-[#F0EDF8] bg-white px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <h2 className="text-[22px] font-semibold leading-tight text-[#292929] sm:text-[28px]">
                Send invitation email
              </h2>

              <p className="max-w-[560px] text-[13px] leading-relaxed text-[#6F6F77] sm:text-[14px]">
                Send a message to participants. Existing participant emails are
                locked in so nobody is accidentally removed.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-[13px] font-medium text-[#4B4B55]">
                Title
              </span>

              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Email title"
                className="h-[52px] rounded-[16px] border-[#ECE8F7] bg-white px-4 text-[15px] text-[#292929]"
                disabled={isSubmitting}
              />
            </label>

            <div className="space-y-2">
              <span className="text-[13px] font-medium text-[#4B4B55]">
                Recipients
              </span>

              <div className="rounded-[18px] border border-[#ECE8F7] bg-[#FCFBFF] p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={emailInput}
                    onChange={(event) => {
                      setEmailInput(event.target.value);
                      setErrorMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        handleAddEmail();
                      }
                    }}
                    placeholder="Add another email"
                    className="!h-[44px]  rounded-[14px] border-[#ECE8F7] bg-white px-4 text-[14px]"
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={handleAddEmail}
                    disabled={isSubmitting || !emailInput.trim()}
                    className="inline-flex h-[44px] w-full items-center justify-center rounded-[14px] bg-[#3300C9] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#2D00B4] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Add
                  </button>
                </div>

                <div className="no-scrollbar mt-3 flex max-h-[132px] flex-wrap gap-2 overflow-y-auto pr-1">
                  {normalizedLockedEmails.map((email) => (
                    <span
                      key={`locked-${email}`}
                      className="inline-flex max-w-full items-center rounded-full bg-[#F0F0F3] px-3 py-1.5 text-[12px] font-medium text-[#8A8892]"
                    >
                      <span className="truncate">{email}</span>
                    </span>
                  ))}

                  {extraEmails.map((email) => (
                    <span
                      key={`extra-${email}`}
                      className="inline-flex max-w-full items-center rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#45454D] shadow-[0_0_0_1px_#ECE8F7]"
                    >
                      <span className="truncate">{email}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setExtraEmails((current) =>
                            current.filter(
                              (currentEmail) => currentEmail !== email,
                            ),
                          )
                        }
                        disabled={isSubmitting}
                        className="ml-2 text-[#8C8A95] transition-colors hover:text-[#E13B3B] disabled:cursor-not-allowed"
                        aria-label={`Remove ${email}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {hasBody && (
              <div className="space-y-2">
                <span className="text-[13px] font-medium text-[#4B4B55]">
                  Body
                </span>
                <RichTextComposer
                  value={body}
                  onChange={(message) => {
                    setBody(message);
                    setErrorMessage("");
                  }}
                  readOnly={isSubmitting}
                  placeholder="Write your invitation message..."
                  className="shadow-none"
                />
              </div>
            )}

            {errorMessage ? (
              <p className="rounded-[12px] bg-[#FFF1F1] px-4 py-3 text-[13px] font-medium text-[#D22F2F]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#F0EDF8] bg-white px-5 py-4 sm:px-8">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-[38px] w-full items-center justify-center rounded-[16px] border border-[#3300C9] px-6 text-[15px] font-medium text-[#3300C9] transition-colors hover:bg-[#F6F2FF] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex h-[38px] w-full items-center justify-center rounded-[16px] bg-[#3300C9] px-7 text-[15px] font-medium text-white transition-colors hover:bg-[#2D00B4] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Sending..." : "Send email"}
            </button>
          </div>
        </div>
      </div>
    </ContentModal>
  );
}

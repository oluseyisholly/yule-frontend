"use client";

import Image, { type ImageProps } from "next/image";
import {
  isValidElement,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ContentModalProps = {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  dialogClassName?: string;
  bodyClassName?: string;
  bodyScrollable?: boolean;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
  icon?: ImageProps["src"] | ReactNode;
  showHeader?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
};

function DefaultModalIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      <path
        d="M8 1.33301L13.3333 3.33301V7.29301C13.3333 10.6597 11.0533 13.7997 8 14.6663C4.94667 13.7997 2.66667 10.6597 2.66667 7.29301V3.33301L8 1.33301Z"
        stroke="#315C07"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.66667 8.00033L7.33334 9.66699L10.6667 6.33301"
        stroke="#315C07"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function renderModalHeaderIcon(icon?: ImageProps["src"] | ReactNode) {
  if (!icon) {
    return <DefaultModalIcon />;
  }

  if (isValidElement(icon)) {
    return icon;
  }

  if (typeof icon !== "string" && typeof icon !== "object") {
    return <DefaultModalIcon />;
  }

  return (
    <Image
      src={icon as ImageProps["src"]}
      alt=""
      width={16}
      height={16}
      className="size-4 shrink-0"
    />
  );
}

export default function ContentModal({
  open,
  onClose,
  title = "Modal",
  children,
  dialogClassName,
  bodyClassName,
  bodyScrollable = true,
  showCloseButton = true,
  closeAriaLabel = "Close",
  icon,
  showHeader = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ContentModalProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !closeOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4"
      aria-hidden={false}
    >
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-[#191A1F]/45 backdrop-blur-[2px]"
        onClick={() => {
          if (closeOnOverlayClick) {
            onClose?.();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-[101] w-full max-w-[640px] overflow-hidden rounded-[22px] bg-[#F5F5F8] shadow-[0_24px_80px_rgba(14,18,35,0.18)] sm:rounded-[26px]",
          dialogClassName,
        )}
      >
        <div
          className={cn(
            bodyScrollable
              ? "relative max-h-[95vh] overflow-y-auto px-4 pt-8 pb-5 sm:px-6 sm:pt-10 sm:pb-6 md:px-8"
              : "relative flex max-h-[95vh] min-h-0 flex-col overflow-hidden px-4 pt-8 pb-5 sm:px-6 sm:pt-10 sm:pb-6 md:px-8",
            bodyClassName,
          )}
        >
          {showCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-[#6A6B73] transition-colors hover:text-[#2D2E35]"
              aria-label={closeAriaLabel}
            >
              <X className="size-5" />
            </button>
          ) : null}

          {/* <h2 id={titleId} className={showHeader ? "sr-only" : "mb-6 text-xl font-semibold text-[#2D2E35]"}>
            {title}
          </h2> */}

          {showHeader ? (
            <div className="flex justify-center">
              <div className="mx-auto mb-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#D7FFB3] pe-5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#66C10A]">
                  {renderModalHeaderIcon(icon)}
                </span>
                <p className="text-base font-semibold text-[#315C07] md:text-xl">
                  {title}
                </p>
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

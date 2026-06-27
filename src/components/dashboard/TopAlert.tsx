"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ExternalLinkIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";

type TopAlertProps = {
  title: string;
  externalLink: string;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onCancel?: () => void;
};

export default function TopAlert({
  title,
  onThumbsUp,
  onThumbsDown,
  onCancel,
  externalLink,
}: TopAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  const handleCancel = () => {
    onCancel?.();
    setIsVisible(false);
  };

  return (
    <Alert className="relative overflow-hidden rounded-[10px] bg-[#EFE6FD] text-[#434343] px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 pr-7 sm:pr-8 md:flex-row md:items-center md:justify-center md:gap-4">
        <p className="text-[11px] leading-4 sm:text-xs sm:leading-5 md:text-center">
          {title}
        </p>

        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-3">
          <button
            type="button"
            onClick={onThumbsUp}
            aria-label="Helpful"
            className="flex h-7 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#f8f5ff] sm:w-11"
          >
            <ThumbsUpIcon size={16} />
          </button>

          <button
            type="button"
            onClick={onThumbsDown}
            aria-label="Not helpful"
            className="flex h-7 w-10 shrink-0 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#f8f5ff] sm:w-11"
          >
            <ThumbsDownIcon size={16} />
          </button>

          <Link
            href={externalLink}
            className="flex min-w-0 items-center gap-1.5 text-[11px] text-[#24A959] sm:gap-2 sm:text-sm md:whitespace-nowrap"
          >
            <span className="truncate">Learn more</span>
            <ExternalLinkIcon size={16} className="shrink-0" />
          </Link>
        </div>
      </div>

      <button
        type="button"
        aria-label="Dismiss alert"
        className="absolute right-2 top-2 cursor-pointer rounded-full p-0.5 transition-colors hover:bg-white/60 md:right-4 md:top-4"
        onClick={handleCancel}
      >
        <XIcon size={18} className="sm:size-5 md:size-6" />
      </button>
    </Alert>
  );
}

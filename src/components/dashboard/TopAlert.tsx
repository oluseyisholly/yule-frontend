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
    <Alert className="relative flex items-center gap-3 bg-[#EFE6FD] rounded-[10px] text-[#434343] max-md:p-2 md:justify-center md:gap-4">
      <p className="pr-8 text-[9px] md:pr-0 md:text-xs">{title}</p>

      <button
        type="button"
        onClick={onThumbsUp}
        aria-label="Helpful"
        className="flex h-7 w-11 shrink-0 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#f8f5ff]"
      >
        <ThumbsUpIcon size={16} />
      </button>

      <button
        type="button"
        onClick={onThumbsDown}
        aria-label="Not helpful"
        className="flex h-7 w-11 shrink-0 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#f8f5ff]"
      >
        <ThumbsDownIcon size={16} />
      </button>

      <Link
        href={externalLink}
        className="mr-5 flex items-center gap-1.5 text-[9px] text-nowrap text-[#24A959] md:gap-2.5 md:text-sm"
      >
        Learn more <ExternalLinkIcon size={16} />
      </Link>

      <button
        type="button"
        aria-label="Dismiss alert"
        className="absolute right-1.5 top-3 cursor-pointer md:right-4 md:top-4"
        onClick={handleCancel}
      >
        <XIcon size={24} />
      </button>
    </Alert>
  );
}

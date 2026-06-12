"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { BackIcon } from "@/components/BackLink";

type BackButtonProps = {
  onClick?: () => void;
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
  type?: ComponentProps<"button">["type"];
  disabled?: boolean;
};

export default function BackButton({
  onClick,
  ariaLabel = "Go back",
  className,
  iconClassName,
  type = "button",
  disabled = false,
}: BackButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center !h-[38px]",
        className,
      )}
    >
      <BackIcon className={iconClassName} />
    </button>
  );
}

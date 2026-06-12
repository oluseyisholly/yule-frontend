"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
};

export function BackIcon({
  className,
  ...props
}: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-5", className)}
      {...props}
    >
      <path
        d="M9.57031 5.92969L3.50031 11.9997L9.57031 18.0697"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 12H3.67"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BackLink({
  href,
  label,
  className,
  linkClassName,
  iconClassName,
}: BackLinkProps) {
  return (
    <div
      className={cn("flex items-center gap-2 text-[20px] text-[#1E1E1E]", className)}
    >
      <Link
        href={href}
        className={cn(
          "inline-flex items-center gap-2 font-medium transition-colors hover:text-[#3300C9]",
          linkClassName,
        )}
      >
        <BackIcon className={iconClassName} />
        {label}
      </Link>
    </div>
  );
}

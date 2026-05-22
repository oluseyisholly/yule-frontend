"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardPageHeaderProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function DashboardPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  actionIcon,
  actions,
  className,
}: DashboardPageHeaderProps) {
  const buttonContent = (
    <>
      <span className="flex size-6 items-center justify-center rounded-full border border-white/35 bg-white/10">
        {actionIcon ?? <PlusIcon className="size-4" />}
      </span>
      <span>{actionLabel}</span>
    </>
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-[#1e1e1e] sm:text-[34px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-[#7d7d7d] sm:text-base">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">{actions}</div>
      ) : actionLabel ? (
        actionHref ? (
          <Button
            asChild
            className="h-[40px] rounded-full bg-[#3300C9] px-4 text-sm font-medium text-white hover:bg-[#2d00b4]"
          >
            <Link href={actionHref} className="inline-flex items-center gap-2.5">
              {buttonContent}
            </Link>
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onAction}
            className="h-[40px] rounded-full bg-[#3300C9] px-4 text-sm font-medium text-white hover:bg-[#2d00b4]"
          >
            <span className="inline-flex items-center gap-2.5">
              {buttonContent}
            </span>
          </Button>
        )
      ) : null}
    </div>
  );
}

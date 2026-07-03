"use client";

import { cn } from "@/lib/utils";

export type StatusPillTone =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral";

type StatusPillProps = {
  status?: string | null;
  label?: string;
  tone?: StatusPillTone;
  compact?: boolean;
  className?: string;
};

const toneClassNames: Record<StatusPillTone, string> = {
  success: "bg-[#E6F7EC] text-[#1FAB54]",
  warning: "bg-[#FFF1DD] text-[#C28A00]",
  info: "bg-[#EFE6FD] text-[#3300C9]",
  danger: "bg-[#FDE0DE] text-[#D14B4B]",
  neutral: "bg-[#F4F4F6] text-[#7D7D7D]",
};

const statusToneMap: Record<string, StatusPillTone> = {
  active: "info",
  assigned: "success",
  claimed: "success",
  completed: "success",
  delivered: "success",
  drawn: "success",
  past: "success",
  purchased: "success",
  received: "success",
  sent: "success",
  success: "success",
  accepted: "success",
  draft: "warning",
  pending: "warning",
  upcoming: "warning",
  ongoing: "info",
  "in progress": "info",
  in_progress: "info",
  failed: "danger",
  rejected: "danger",
  cancelled: "danger",
  canceled: "danger",
  expired: "danger",
  inactive: "neutral",
  disabled: "neutral",
};

export function normalizeStatusPillValue(status?: string | null) {
  return status?.trim().toLowerCase() || "pending";
}

export function formatStatusPillLabel(status?: string | null) {
  if (!status?.trim()) {
    return "Pending";
  }

  return status
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function getStatusPillTone(status?: string | null): StatusPillTone {
  return statusToneMap[normalizeStatusPillValue(status)] ?? "info";
}

export default function StatusPill({
  status,
  label,
  tone,
  compact = false,
  className,
}: StatusPillProps) {
  const pillTone = tone ?? getStatusPillTone(status);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
        compact
          ? "min-w-[58px] px-2 py-0.5 text-[9px]"
          : "min-w-[78px] px-3 py-1 text-[11px]",
        toneClassNames[pillTone],
        className,
      )}
    >
      {label ?? formatStatusPillLabel(status)}
    </span>
  );
}

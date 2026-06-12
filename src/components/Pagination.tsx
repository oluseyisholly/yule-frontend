"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  total: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
};

export default function Pagination({
  total,
  initialPage = 1,
  onPageChange,
  className,
  previousLabel = "← Previous",
  nextLabel = "Next →",
}: PaginationProps) {
  const [current, setCurrent] = useState(initialPage);

  const go = (page: number) => {
    const clamped = Math.min(Math.max(page, 1), total);
    setCurrent(clamped);
    onPageChange?.(clamped);
  };

  const pages = buildPages(current, total);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6",
        className
      )}
    >
      <Button
        label={previousLabel}
        variant="outlined"
        onClick={() => go(current - 1)}
        disabled={current === 1}
        className="rounded-lg px-4 py-2 text-[13px] border-gray-200 text-dark hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      />

      <div className="flex items-center gap-1.5">
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`gap-${i}`} className="px-2 text-muted text-[13px]">
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => go(page)}
              aria-current={current === page ? "page" : undefined}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-medium transition-colors cursor-pointer",
                current === page
                  ? "bg-gray-100 text-dark"
                  : "text-muted hover:bg-gray-50"
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <Button
        label={nextLabel}
        variant="outlined"
        onClick={() => go(current + 1)}
        disabled={current === total}
        className="rounded-lg px-4 py-2 text-[13px] border-gray-200 text-dark hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function buildPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3 || current >= total - 2) {
    return [1, 2, 3, "...", total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

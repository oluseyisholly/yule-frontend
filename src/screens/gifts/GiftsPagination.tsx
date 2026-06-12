"use client";

import Button from "@/components/Button";
import { useState } from "react";

const totalPages = 10;

export default function GiftsPagination() {
  const [current, setCurrent] = useState(1);

  const pages = buildPages(current, totalPages);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
      <Button
        label="← Previous"
        variant="outlined"
        onClick={() => setCurrent((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrent(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
                current === page
                  ? "bg-gray-100 text-dark"
                  : "text-muted hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      <Button
        label="Next →"
        variant="outlined"
        onClick={() => setCurrent((p) => Math.min(totalPages, p + 1))}
        disabled={current === totalPages}
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

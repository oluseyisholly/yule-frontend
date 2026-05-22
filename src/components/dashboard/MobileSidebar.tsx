"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebarNav from "@/components/dashboard/SidebarNav";
import { YuleWordmarkIcon } from "@/components/dashboard/icons";
import { cn } from "@/lib/utils";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MobileSidebar({
  isOpen,
  onClose,
}: MobileSidebarProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-white px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile sidebar"
      >
        <div className="flex items-center justify-between border-b border-[#f1eef8] pb-4">
          <Link href="/" onClick={onClose} className="block w-fit">
            <YuleWordmarkIcon
              className="h-auto w-[66px]"
              role="img"
              aria-label="Yule logo"
            />
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full text-[#434343] hover:bg-[#f6f2ff]"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pt-6">
          <DashboardSidebarNav onItemClick={onClose} />
        </div>
      </div>
    </div>
  );
}

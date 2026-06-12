"use client";

import { BellIcon, MenuIcon, SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getDashboardNavItemByPathname,
} from "@/components/dashboard/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function CompanyBranchIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.63875 0.807656L8.01375 2.15765C8.145 2.21015 8.25 2.36764 8.25 2.50639V3.7514C8.25 3.95765 8.08125 4.1264 7.875 4.1264H1.125C0.91875 4.1264 0.75 3.95765 0.75 3.7514V2.50639C0.75 2.36764 0.855002 2.21015 0.986252 2.15765L4.36125 0.807656C4.43625 0.777656 4.56375 0.777656 4.63875 0.807656Z"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 8.25H0.75V7.125C0.75 6.91875 0.91875 6.75 1.125 6.75H7.875C8.08125 6.75 8.25 6.91875 8.25 7.125V8.25Z"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6.75V4.125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.375 8.25H8.625"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 3.1875C4.81066 3.1875 5.0625 2.93566 5.0625 2.625C5.0625 2.31434 4.81066 2.0625 4.5 2.0625C4.18934 2.0625 3.9375 2.31434 3.9375 2.625C3.9375 2.93566 4.18934 3.1875 4.5 3.1875Z"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BranchBusinessNameIcon() {
  return <CompanyBranchIcon />;
}

function CompanyBranchSeparatorIcon() {
  return (
    <svg
      width="9"
      height="9"
      viewBox="0 0 9 9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5.6582 7.47125L3.2132 5.02625C2.92445 4.7375 2.92445 4.265 3.2132 3.97625L5.6582 1.53125"
        stroke="#434343"
        strokeWidth="0.5625"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getInitials(name: string) {
  const parts = name.split(" ").filter(Boolean);

  if (parts.length === 0) return "Y";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

type DashboardHeaderProps = {
  onMobileMenuToggle?: () => void;
};

export default function DashboardHeader({
  onMobileMenuToggle,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const activeItem = getDashboardNavItemByPathname(pathname);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const activeBusinessName = "Yule";
  const activeBranchName = activeItem.label;
  const dashboardHeaderProfile = {
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
      "Yule User",
    email: user?.email?.trim() || "No email",
  };

  return (
    <header className="overflow-hidden  border border-white/70 bg-white px-4 py-4  sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full text-[#434343] hover:bg-[#f6f2ff]"
          aria-label="Open sidebar"
          onClick={onMobileMenuToggle}
        >
          <MenuIcon size={24} />
        </Button>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="flex min-w-0 max-w-[46vw] items-center gap-1 text-xs text-[#434343]">
            <p className="flex items-center gap-1 truncate">
              <CompanyBranchIcon />
              <span className="truncate">{activeBusinessName}</span>
            </p>
            <CompanyBranchSeparatorIcon />
            <p className="flex items-center gap-1 truncate">
              <BranchBusinessNameIcon />
              <span className="truncate">{activeBranchName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="size-9" />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-9 rounded-full text-[#434343] hover:bg-[#f6f2ff]"
              onClick={() => setShowMobileSearch((prev) => !prev)}
              aria-label="Toggle search"
            >
              <SearchIcon className="size-4" />
            </Button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-9 items-center justify-center rounded-full text-[#434343] transition-colors hover:bg-[#f6f2ff]"
            >
              <BellIcon className="size-4" />
              <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#ff6600]" />
            </button>

            <button
              type="button"
              aria-label="Profile"
              className="flex size-9 items-center justify-center rounded-full bg-[#efe6fd] text-xs font-semibold text-[#3300C9]"
            >
              {getInitials(dashboardHeaderProfile.name)}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden justify-end lg:flex">
        <div className="flex min-w-0 items-center justify-end gap-4 xl:gap-6">
          <div className="relative w-[280px] shrink-0 xl:w-[340px]">
            <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7d7d7d]" />
            <Input
              placeholder="Search..."
              className="h-[42px] rounded-full border-[#ece8f7] bg-[#fcfbff] pl-11 text-[14px] text-[#434343] placeholder:text-[#9a97a5] focus-visible:border-[#d6ccf5] focus-visible:ring-[#d6ccf5]/40"
            />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1 text-xs text-[#434343]">
            <p className="flex items-center gap-1 truncate">
              <BranchBusinessNameIcon />
              <span className="truncate">{activeBranchName}</span>
            </p>
            <CompanyBranchSeparatorIcon />
            <p className="flex items-center gap-1 truncate">
              <CompanyBranchIcon />
              <span className="truncate">{activeBusinessName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="size-10" />
            <button
              type="button"
              className="flex items-center gap-3 rounded-full  bg-white py-1.5 pl-1.5 pr-4 text-left transition-colors hover:bg-[#faf8ff]"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[#efe6fd] text-sm font-semibold text-[#3300C9]">
                {getInitials(dashboardHeaderProfile.name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[#1e1e1e]">
                  {dashboardHeaderProfile.name}
                </span>
                <span className="block truncate text-xs text-[#7d7d7d]">
                  {dashboardHeaderProfile.email}
                </span>
              </span>
            </button>

            <button
              type="button"
              aria-label="Notifications"
              className="relative flex size-10 items-center justify-center rounded-full  bg-white text-[#434343] transition-colors hover:bg-[#f8f5ff]"
            >
              <BellIcon className="size-4" />
              <span className="absolute right-3 top-3 size-1.5 rounded-full bg-[#ff6600]" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 lg:hidden",
          showMobileSearch ? "max-h-24 pt-4" : "max-h-0",
        )}
      >
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#7d7d7d]" />
          <Input
            placeholder="Search..."
            className="h-[42px] rounded-full border-[#ece8f7] bg-[#fcfbff] pl-11 text-[14px] text-[#434343] placeholder:text-[#9a97a5] focus-visible:border-[#d6ccf5] focus-visible:ring-[#d6ccf5]/40"
          />
        </div>
      </div>
    </header>
  );
}

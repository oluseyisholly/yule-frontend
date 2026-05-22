import Link from "next/link";
import { PlusIcon, SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function ActionPlusIcon() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 items-center justify-center rounded-full border border-white/40 bg-white/15"
    >
      <PlusIcon className="size-3.5" strokeWidth={2.5} />
    </span>
  );
}

function ActionPlusIconOutline() {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 items-center justify-center rounded-full border border-[#3300C9]/30 bg-[#F1ECFF]"
    >
      <PlusIcon className="size-3.5 text-[#3300C9]" strokeWidth={2.5} />
    </span>
  );
}

function InboxIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 12.5h3.333l1.25 1.667h5.834l1.25-1.667H17.5"
        stroke="#3300C9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.583 4.167h10.834l2.083 8.333v3.333a1.667 1.667 0 0 1-1.667 1.667H3.75a1.667 1.667 0 0 1-1.667-1.667V12.5l2.5-8.333Z"
        stroke="#3300C9"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardActions() {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <Button
        asChild
        className="h-[44px] rounded-full bg-[#3300C9] pl-2 pr-5 text-sm font-medium text-white hover:bg-[#2d00b4]"
      >
        <Link href="/start" className="inline-flex items-center gap-2.5">
          <ActionPlusIcon />
          <span>Start Celebrating</span>
        </Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className="h-[44px] rounded-full border-[#3300C9] bg-white pl-2 pr-5 text-sm font-medium text-[#3300C9] hover:bg-[#F6F2FF] hover:text-[#3300C9]"
      >
        <Link
          href="/dashboard/schedule"
          className="inline-flex items-center gap-2.5"
        >
          <ActionPlusIconOutline />
          <span>Schedule Event</span>
        </Link>
      </Button>

      <button
        type="button"
        aria-label="Open inbox"
        className="relative flex size-[42px] items-center justify-center rounded-[10px] border border-[#ECE8F7] bg-white transition-colors hover:bg-[#F6F2FF]"
      >
        <InboxIcon />
        <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#FF6600]" />
      </button>

      <button
        type="button"
        aria-label="Open settings"
        className="flex size-[42px] items-center justify-center rounded-[10px] border border-[#ECE8F7] bg-white text-[#3300C9] transition-colors hover:bg-[#F6F2FF]"
      >
        <SettingsIcon className="size-[18px]" strokeWidth={1.6} />
      </button>
    </div>
  );
}

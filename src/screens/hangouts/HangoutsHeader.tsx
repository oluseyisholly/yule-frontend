import Image from "next/image";
import { Input } from "@/components/ui/input";
import dropIcon from "@/assets/icons/dropIcon.svg";

const dropdowns = ["Category", "Price", "Location"];

export default function HangoutsHeader() {
  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Title */}
      <div>
        <h1 className="font-title text-[26px] sm:text-[30px] md:text-[34px] lg:text-[36px] text-dark leading-tight mb-2">
          Your Next Hangout Starts Here
        </h1>
        <p className="text-muted text-[13px] sm:text-[14px] max-w-xl">
          Find places, plans, and people—all in one tap.
        </p>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 lg:items-center">
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-dark text-[13px] font-medium px-3.5 py-2 rounded-lg hover:bg-gray-200/70 transition-colors cursor-pointer"
          >
            <FilterIcon />
            Filter
          </button>

          {dropdowns.map((label) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-dark text-[13px] font-medium px-3.5 py-2 rounded-lg hover:bg-gray-200/70 transition-colors cursor-pointer"
            >
              {label}
              <Image src={dropIcon} alt="" aria-hidden className="w-3 h-3" />
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search for hangout or place"
            className="w-full h-10 pl-9 bg-gray-100 border-gray-200 placeholder:text-gray-400 text-[13px] rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

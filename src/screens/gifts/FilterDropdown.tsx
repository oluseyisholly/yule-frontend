"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import dropIcon from "@/assets/icons/dropdowns.svg";

type FilterDropdownProps = {
  label: string;
  options: string[];
};

export default function FilterDropdown({ label, options }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-2 bg-[#E4E9ED] border border-gray-200 text-dark text-[13px] font-medium px-3.5 py-2 rounded-lg hover:bg-[#E4E9ED] transition-colors cursor-pointer"
      >
        {selected ?? label}
        <Image
          src={dropIcon}
          alt=""
          aria-hidden
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 z-20 mt-1.5 min-w-[180px] max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={selected === option}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-[13px] hover:bg-gray-100 transition-colors cursor-pointer ${
                  selected === option ? "text-primary font-semibold" : "text-dark"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

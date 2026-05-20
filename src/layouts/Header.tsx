"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Find Gifts", href: "/gifts" },
  { label: "Find Hangouts", href: "/hangouts" },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="w-full bg-white border-b border-gray-100 relative z-50">
      <div className="max-w-7xl mx-auto px-[30px] py-5.5 flex items-center justify-between gap-14">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="shrink-0">
          <Image src={Logo} alt="Yule logo" className="h-[35px] w-[65.5px]" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-[16px] font-semibold transition-colors ${
                pathname === href
                  ? "text-primary"
                  : "text-dark hover:text-primary"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-9 shrink-0">
          <Button
            label="Create your first celebration"
            href="/celebrate"
            variant="outlined"
          />
          <Button
            label="Start Celebrating"
            href="/start"
            variant="filled"
          />
        </div>

        {/* Mobile hamburger */}
        <Button
          type="button"
          variant="ghost"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((s) => !s)}
          className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 px-0 py-0"
        >
          <span
            className={`block w-6 h-0.5 bg-dark transition-all ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-dark transition-opacity ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-dark transition-all ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </Button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="px-6 py-6 flex flex-col gap-5">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`text-base font-semibold py-2 ${
                  pathname === href ? "text-primary" : "text-dark"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <Button
              label="Create your first celebration"
              href="/celebrate"
              variant="outlined"
              className="w-full"
            />
            <Button
              label="Start Celebrating"
              href="/start"
              variant="filled"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

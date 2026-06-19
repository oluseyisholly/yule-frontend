"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Button from "@/components/Button";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import Logo from "@/assets/images/logoblue.svg";
import { useAuthStore } from "@/stores/auth-store";
import { YULE_SIGN_IN_URL, YULE_SIGN_UP_URL } from "@/lib/external-links";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Find Gifts", href: "/gifts" },
  { label: "Find Hangouts", href: "/hangouts" },
];

function getInitials(firstName?: string | null, lastName?: string | null) {
  const initials = `${firstName?.trim().charAt(0) ?? ""}${
    lastName?.trim().charAt(0) ?? ""
  }`
    .trim()
    .toUpperCase();

  return initials || "YU";
}

function SignedInUserCard({
  name,
  email,
  initials,
  onClick,
  className = "",
}: {
  name: string;
  email: string;
  initials: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      className={`flex min-w-0 items-center gap-3 rounded-full border border-transparent px-4 py-2.5 transition-colors hover:border-[#F1EBFF] ${className}`}
    >
      <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#EEE6FF] text-[16px] font-semibold text-[#3300C9]">
        {initials}
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[16px] font-medium leading-tight text-[#3300C9]">
          {name}
        </span>
        <span className="block truncate text-[14px] leading-tight text-[#5F5C67]">
          {email}
        </span>
      </span>
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fullName =
    `${authUser?.firstName?.trim() ?? ""} ${authUser?.lastName?.trim() ?? ""}`.trim() ||
    "Yule User";
  const email = authUser?.email?.trim() || "No email address";
  const initials = getInitials(authUser?.firstName, authUser?.lastName);
  const shouldShowSignedInCard = isAuthenticated && Boolean(authUser);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5 lg:gap-10 xl:px-8">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="shrink-0">
          <Image
            src={Logo}
            alt="Yule logo"
            className="h-[30px] w-[56px] sm:h-[35px] sm:w-[65.5px]"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex xl:gap-10">
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
        <div className="hidden shrink-0 items-center gap-4 lg:flex xl:gap-6">
          {shouldShowSignedInCard ? (
            <SignedInUserCard
              name={fullName}
              email={email}
              initials={initials}
              className="max-w-[280px]"
            />
          ) : (
            <>
              <Button
                label="Create your first celebration"
                href={YULE_SIGN_UP_URL}
                variant="outlined"
              />
              <Button
                label="Start Celebrating"
                href={YULE_SIGN_IN_URL}
                variant="filled"
              />
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile toggle + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((s) => !s)}
            className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 px-0 py-0"
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
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
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
          {shouldShowSignedInCard ? (
            <SignedInUserCard
              name={fullName}
              email={email}
              initials={initials}
              onClick={closeMenu}
              className="w-full"
            />
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                label="Create your first celebration"
                href={YULE_SIGN_UP_URL}
                variant="outlined"
                className="w-full"
              />
              <Button
                label="Start Celebrating"
                href={YULE_SIGN_IN_URL}
                variant="filled"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

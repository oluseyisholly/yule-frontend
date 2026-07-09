"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthCtaButtonProps = {
  signUpHref: string;
  signInHref: string;
  activeOption?: "sign-up" | "sign-in";
  className?: string;
};

export default function AuthCtaButton({
  signUpHref,
  signInHref,
  activeOption = "sign-up",
  className,
}: AuthCtaButtonProps) {
  const optionClassName =
    "flex min-h-[35px] w-auto shrink-0 items-center justify-center whitespace-nowrap rounded-[22px] px-4 text-center text-[11px] font-medium transition-colors sm:min-h-[42px] sm:rounded-[25px] sm:px-5 sm:text-[14px]";

  return (
    <div
      className={cn(
        "inline-flex w-fit items-center rounded-[28px] border border-[#3F10E8] bg-white  sm:rounded-[31px] p-1",
        className,
      )}
    >
      <Link
        href={signUpHref}
        aria-current={activeOption === "sign-up" ? "page" : undefined}
        className={cn(
          optionClassName,
          activeOption === "sign-up"
            ? "bg-[#3300C9] text-white"
            : "text-[#3300C9] hover:bg-[#F5F1FF]",
        )}
      >
        Sign up for free
      </Link>

      <Link
        href={signInHref}
        aria-current={activeOption === "sign-in" ? "page" : undefined}
        className={cn(
          optionClassName,
          activeOption === "sign-in"
            ? "bg-[#3300C9] text-white"
            : "text-[#3300C9] hover:bg-[#F5F1FF]",
        )}
      >
        Sign in
      </Link>
    </div>
  );
}
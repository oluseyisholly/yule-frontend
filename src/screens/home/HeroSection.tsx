"use client";

import Button from "@/components/Button";
import Image from "next/image";
import pics1 from "@/assets/icons/firstHead.svg";
import pics2 from "@/assets/icons/secondHead.svg";
import pics3 from "@/assets/icons/thirdHead.svg";
import pics5 from "@/assets/icons/fifthHead.svg";
import {
  getAuthAwareCtaHref,
  YULE_SIGN_IN_URL,
  YULE_SIGN_UP_URL,
} from "@/lib/external-links";
import { useAuthStore } from "@/stores/auth-store";

const avatars = [pics1, pics2, pics3, pics3, pics5];

export default function HeroSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const startCelebratingHref = getAuthAwareCtaHref(
    isAuthenticated,
    YULE_SIGN_IN_URL,
  );
  const createCelebrationHref = getAuthAwareCtaHref(
    isAuthenticated,
    YULE_SIGN_UP_URL,
  );

  return (
    <section className="flex flex-col items-center px-5 pb-8 pt-9 text-center sm:px-6 md:px-10 md:pb-18 md:pt-19 lg:px-20 xl:px-28">
      {/* Social proof */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 sm:mb-6 sm:gap-4 lg:mb-7">
        <div className="flex -space-x-2">
          {avatars.map((avatar, i) => (
            <Image
              key={i}
              src={avatar}
              alt={`user avatar ${i + 1}`}
              width={36}
              height={36}
              className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-full border-[0.3px] border-white"
            />
          ))}
        </div>
        <span className="text-[11px] sm:text-[12px] text-text-dark text-muted">
          Over 200 thousand users
        </span>
      </div>

      {/* Heading */}
      <h1 className="mb-4 max-w-[340px] font-title text-[28px] leading-[1.12] tracking-[0.04em] sm:mb-5 sm:max-w-[560px] sm:text-[38px] md:max-w-[720px] md:text-[46px] lg:mb-6 lg:max-w-[854px] lg:text-[52px] lg:mx-auto">
        <span className="text-primary">Celebrate </span>
        <span className="text-dark">
          Life&apos;s Moment&apos;s
          <br className="hidden sm:block" />
          <span className="sm:ml-2">without Missing a Beat</span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-muted mb-5 max-w-[320px] text-[14px] leading-relaxed sm:mb-6 sm:max-w-[620px] sm:text-base md:max-w-[860px] md:text-[20px] lg:mx-auto">
        Life is full of moments worth celebrating. Yule helps you turn them into meaningful gestures through effortless messages, thoughtful
        <br className="hidden lg:inline" />
        {" "}gifts, and memorable experiences so no special moment ever goes
        <br className="hidden lg:inline" />
        {" "}unnoticed. 🎉
      </p>

      {/* CTAs */}
      <div className="flex w-full max-w-[420px] flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
        <Button
          label="Start Celebrating"
          href={startCelebratingHref}
          variant="filled"
          className="w-full px-6 py-3 text-[14px] sm:w-auto sm:px-7 sm:py-3.5 lg:px-8 lg:text-base"
        />
        <Button
          label="Create your first celebration"
          href={createCelebrationHref}
          variant="outlined"
          className="w-full px-6 py-3 text-[14px] sm:w-auto sm:px-7 sm:py-3.5 lg:px-8 lg:text-base"
        />
      </div>
    </section>
  );
}

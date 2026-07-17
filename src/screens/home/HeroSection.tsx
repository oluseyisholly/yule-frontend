"use client";

import Image, { type StaticImageData } from "next/image";

import Button from "@/components/Button";
import {
  CelebrationSprinkles,
  MotionFloat,
  MotionReveal,
  MotionStagger,
  MotionStaggerItem,
} from "@/components/LandingMotion";
import { cn } from "@/lib/utils";
import {
  getAuthAwareCtaHref,
  YULE_SIGN_UP_URL,
} from "@/lib/external-links";
import { useAuthStore } from "@/stores/auth-store";

import hero from "@/assets/images/hero1.svg";
import diagArrow from "@/assets/icons/diagArrow.svg";
import dashSearch from "@/assets/icons/dashSearch.svg";
import dashLocation from "@/assets/icons/dashLocation.svg";

type SearchFieldProps = {
  label: string;
  icon: StaticImageData;
  placeholder: string;
  className?: string;
  onClick?: () => void;
};

function SearchField({
  label,
  icon,
  placeholder,
  className,
  onClick,
}: SearchFieldProps) {
  return (
    <Button
      type="button"
      label={label}
      variant="filled"
      onClick={onClick}
      className={cn(
        "flex min-h-[58px] w-full items-center justify-start gap-3",
        "rounded-[20px] !bg-white px-4 py-3 text-left",
        "sm:min-h-[64px] sm:px-5",
        className,
      )}
    >
      <Image
        src={icon}
        alt=""
        aria-hidden="true"
        className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
      />

      <span className="min-w-0 truncate text-[12px] font-normal text-[#716F6F] sm:text-[13px]">
        {placeholder}
      </span>
    </Button>
  );
}

export default function HeroSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const createCelebrationHref = getAuthAwareCtaHref(
    isAuthenticated,
    YULE_SIGN_UP_URL,
  );

  return (
    <section className="relative">
      <CelebrationSprinkles className="hidden md:block" />

      <div
        className={cn(
          "flex flex-col gap-8 pt-3",
          "md:flex-row md:items-center md:gap-6 md:pt-8",
          "lg:gap-10",
        )}
      >
        {/* Hero content */}
        <MotionStagger
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-center gap-3",
            "sm:gap-4",
            "lg:gap-5",
          )}
        >
          <MotionStaggerItem>
            <h1
              className={cn(
                "mb-1 max-w-[560px] font-[600]",
                "text-[34px] leading-[1.12] tracking-[0.04em] text-dark",
                "sm:mb-3 sm:text-[44px]",
                "md:text-[50px]",
                "lg:mb-6 lg:max-w-[854px] lg:text-[60px]",
                "font-poppins",
              )}
            >
              Celebrate Life&apos;s Moments{" "}
              <span className="block sm:inline">Without Missing a Beat</span>
            </h1>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <p
              className={cn(
                "mb-2 max-w-[660px] text-[15px] leading-relaxed text-muted",
                "sm:mb-3 sm:text-[16px]",
                "md:text-[18px]",
                "lg:text-[20px]",
              )}
            >
              Life is full of moments worth celebrating. Festa helps you turn
              them into meaningful gestures through effortless messages,
              thoughtful gifts, and memorable experiences, so no special moment
              ever goes unnoticed. 🎉
            </p>
          </MotionStaggerItem>

          <MotionStaggerItem>
            <div className="flex w-full max-w-[420px] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-4">
              <Button
                label="Get Started"
                href={createCelebrationHref}
                variant="filled"
                className={cn(
                  "w-full px-6 py-3 text-[14px]",
                  "sm:w-auto sm:px-7",
                  "lg:px-8 lg:text-base",
                )}
              >
                <span className="inline-flex items-center justify-center gap-3">
                  Get Started

                  <Image
                    src={diagArrow}
                    alt=""
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0"
                  />
                </span>
              </Button>
            </div>
          </MotionStaggerItem>
        </MotionStagger>

        {/* Hero illustration */}
        <MotionFloat
          className={cn(
            "relative min-h-[320px] w-full flex-1",
            "sm:min-h-[420px]",
            "md:min-h-[460px] md:self-end",
            "lg:min-h-[560px]",
          )}
        >
          <Image
            src={hero}
            alt="People celebrating special moments with Festa"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-contain object-bottom"
          />
        </MotionFloat>
      </div>

      {/* Search panel */}
      <MotionReveal delay={0.15} amount={0.1}>
        <div
          className={cn(
            "w-full rounded-[20px] bg-[#104A63]",
            "px-4 py-5",
            "sm:px-6 sm:py-6",
            "lg:px-12 lg:py-7",
          )}
        >
          <p className="pb-4 text-[18px] font-light text-white sm:text-[21px] lg:text-[24px]">
            What do you feel like doing today?
          </p>

          <div
            className={cn(
              "grid grid-cols-1 gap-3",
              "sm:gap-4",
              "lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)_auto]",
            )}
          >
            <SearchField
              label="Search for a hangout"
              icon={dashSearch}
              placeholder="Dinner, birthday, romantic dinner, coffee date"
            />

            <SearchField
              label="Choose a location"
              icon={dashLocation}
              placeholder="Location"
            />

            <Button
              label="Find hangout"
              href={createCelebrationHref}
              variant="filled"
              className={cn(
                "min-h-[58px] w-full rounded-[20px] !bg-[#FF6600]",
                "px-7 py-3 text-[14px]",
                "sm:min-h-[64px]",
                "lg:w-auto lg:min-w-[170px] lg:text-base",
              )}
            >
              Find hangout
            </Button>
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}

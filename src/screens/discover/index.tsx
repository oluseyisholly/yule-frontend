"use client";

import {
  type ComponentType,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";

import image1 from "@/assets/icons/discover/image.svg";
import diagArrow from "@/assets/icons/diagArrow.svg";
import { cn } from "@/lib/utils";

import {
  Step1Icon,
  Step2Icon,
  Step3Icon,
  Step4Icon,
  Step5Icon,
  Step6Icon,
} from "./icons";

type StepIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type BusinessStep = {
  id: number;
  stepLabel: string;
  title: string;
  description: string;
  bullets?: string[];
  note?: string;
  finalStep?: boolean;
  icon: StepIconComponent;
};

const businessSteps: BusinessStep[] = [
  {
    id: 1,
    stepLabel: "Step one",
    title: "Create a Shobu account",
    description:
      "Festa showcases products and businesses listed on Shobu, Viktri's marketplace. If you don't already have an account, create one in just a few minutes.",
    icon: Step1Icon,
  },
  {
    id: 2,
    stepLabel: "Step two",
    title: "List Your Business or Products",
    description:
      "Create your business profile and add the products or services you would like people to discover.",
    icon: Step2Icon,
    bullets: [
      "Gift items",
      "Flowers",
      "Cakes",
      "Restaurants",
      "Hotels",
      "Resorts",
    ],
    note:
      "The better your photos, descriptions and pricing, the more attractive your listing becomes.",
  },
  {
    id: 3,
    stepLabel: "Step three",
    title: "Choose the Right Category",
    description:
      "When creating your listing, make sure it is placed under the appropriate category.",
    icon: Step3Icon,
    bullets: [
      "Gift items — for products people buy as gifts",
      "Hospitality — for hotels, restaurants, cafés, resorts and lounges",
      "Events — for venues and celebration spaces",
    ],
    note:
      "The better your photos, descriptions and pricing, the more attractive your listing becomes.",
  },
  {
    id: 4,
    stepLabel: "Step four",
    title: "Feature Your Listing on Festa",
    description:
      "Once your listing is live, simply use Shobu Add-ons to boost it to Festa Featured Listing. This makes it easier for people planning birthdays, anniversaries, hangouts, weddings and holidays to discover your business.",
    icon: Step4Icon,
  },
  {
    id: 5,
    stepLabel: "Step five",
    title: "Get Discovered",
    description:
      "Your products and business can now be discovered by people actively searching for gifts, celebration ideas and memorable moments.",
    note:
      "The more relevant your offering, the greater your opportunity to connect with customers already looking for businesses like yours.",
    icon: Step5Icon,
  },
  {
    id: 6,
    stepLabel: "",
    title: "Ready to Get Started?",
    description:
      "List your business on Shobu, feature it on Festa, and let your next customer discover you where memories begin.",
    icon: Step6Icon,
    finalStep: true,
  },
];

type StepIconProps = {
  highlighted: boolean;
  icon: StepIconComponent;
};

function StepIcon({ highlighted, icon: Icon }: StepIconProps) {
  const iconFill = highlighted ? "#FF6600" : "#9B9B9B";

  return (
    <span
      className={cn(
        "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center",
        "rounded-[9px] border bg-white text-[12px] font-semibold",
        "transition-all duration-300",
        highlighted
          ? "border-[#FF6600] text-[#FF6600]"
          : "border-[#D8D8D8] text-[#9B9B9B]",
      )}
    >
      <Icon
        aria-hidden="true"
        className="h-4 w-4 transition-all duration-300"
        fill={iconFill}
      />
    </span>
  );
}

type TimelineStepProps = {
  step: BusinessStep;
  highlighted: boolean;
  setStepRef: (element: HTMLElement | null) => void;
};

function TimelineStep({
  step,
  highlighted,
  setStepRef,
}: TimelineStepProps) {
  return (
    <article
      ref={setStepRef}
      aria-current={highlighted ? "step" : undefined}
      className="relative flex scroll-mt-32 gap-4 pb-8 last:pb-0 sm:gap-5"
    >
      <StepIcon highlighted={highlighted} icon={step.icon} />

      <div className="min-w-0 flex-1 pt-0.5">
        {step.stepLabel ? (
          <p
            className={cn(
              "mb-1 text-[12px] font-medium transition-colors duration-300",
              highlighted ? "text-[#FF6600]" : "text-[#D3D3D3]",
            )}
          >
            {step.stepLabel}
          </p>
        ) : null}

        <h2
          className={cn(
            "font-poppins text-[20px] font-semibold leading-[1.25]",
            "transition-colors duration-300 sm:text-[20px]",
            highlighted ? "text-[#FF6600]" : "text-[#000000]",
          )}
        >
          {step.title}
        </h2>

        <p className="mt-2 max-w-[580px] text-[12px] leading-[1.55] text-[#7D7D7D] sm:text-[13px]">
          {step.description}
        </p>

        {step.bullets?.length ? (
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {step.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex items-start gap-2 text-[11px] leading-[1.45] text-[#8B8B8B] sm:text-[12px]"
              >
                <span
                  className={cn(
                    "mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full",
                    "transition-colors duration-300",
                    highlighted ? "bg-[#FF6600]" : "bg-[#3300C9]",
                  )}
                />

                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {step.note ? (
          <p className="mt-3 max-w-[580px] text-[11px] leading-[1.55] text-[#9B9B9B] sm:text-[12px]">
            {step.note}
          </p>
        ) : null}

        {step.finalStep ? (
          <Link
            href="#"
            className={cn(
              "mt-5 flex min-h-[44px] w-full items-center justify-center",
              "gap-2 rounded-full bg-[#3300C9] px-6 text-[12px]",
              "font-medium text-white transition-all duration-300",
              "hover:bg-[#2F00B4] sm:text-[13px]",
              highlighted &&
                "shadow-[0_8px_24px_rgba(51,0,201,0.22)]",
            )}
          >
            Get Started on Shobu

            <Image
              src={diagArrow}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
            />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export default function BusinessFeaturePage() {
  const [activeStepId, setActiveStepId] = useState(
    businessSteps[0]?.id ?? 1,
  );

  const stepRefs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    let animationFrameId: number | null = null;

    const updateActiveStep = () => {
      animationFrameId = null;

      /*
       * This is the vertical point where a step becomes active.
       * 35% places the active area slightly above the centre
       * of the screen.
       */
      const activationPoint = window.innerHeight * 0.35;

      let closestStepId = businessSteps[0]?.id ?? 1;
      let closestDistance = Number.POSITIVE_INFINITY;

      businessSteps.forEach((step) => {
        const element = stepRefs.current[step.id];

        if (!element) {
          return;
        }

        const elementPosition =
          element.getBoundingClientRect().top + 18;

        const distance = Math.abs(
          elementPosition - activationPoint,
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestStepId = step.id;
        }
      });

      setActiveStepId((currentStepId) =>
        currentStepId === closestStepId
          ? currentStepId
          : closestStepId,
      );
    };

    const handleScroll = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId =
        window.requestAnimationFrame(updateActiveStep);
    };

    updateActiveStep();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1220px]">
        <header className="mx-auto max-w-[850px] text-center">
          <h1 className="font-poppins text-[28px] font-semibold leading-tight text-black sm:text-[36px] lg:text-[42px]">
            Get Your Business Featured on Festa
          </h1>

          <p className="mx-auto mt-3 max-w-[760px] text-[14px] leading-[1.55] text-[#999999] sm:text-[13px]">
            Every day, people visit Festa looking for the perfect gift,
            restaurant, café, hotel, resort, event centre and memorable places
            to celebrate life&apos;s special moments. Here&apos;s how you can
            put your business in front of them.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:mt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
          {/* Image section */}
          <div className="lg:sticky lg:top-8">
            <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-[#B7C4BF] via-[#879991] to-[#35453F]">
              <Image
                src={image1}
                alt="Image of a person holding a gift box with a ribbon, surrounded by festive decorations and confetti, representing the concept of gifting and celebration."
                className={cn(
                  "object-contain",
                  "sm:min-h-[280px]",
                  "md:min-h-0",
                )}
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent px-6 pb-7 pt-20 text-center sm:px-10 sm:pb-9" />
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div
              className="absolute bottom-12 left-[17px] top-4 w-px bg-[#D8D8D8]"
              aria-hidden="true"
            />

            <div>
              {businessSteps.map((step) => (
                <TimelineStep
                  key={step.id}
                  step={step}
                  highlighted={activeStepId === step.id}
                  setStepRef={(element) => {
                    stepRefs.current[step.id] = element;
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
import Image, { type StaticImageData } from "next/image";

import Button from "@/components/Button";
import { MotionReveal } from "@/components/LandingMotion";
import { cn } from "@/lib/utils";

import chatHero from "@/assets/images/chatHero.svg";
import diagArrow from "@/assets/icons/diagArrow.svg";
import santaHero from "@/assets/images/santaHero.svg";
import noteHero from "@/assets/images/noteHero.svg";
import hangoutHero from "@/assets/images/hangoutHero.svg";
import goodiesHero from "@/assets/images/goodiesHero.svg";

type FeatureCardData = {
  id: string;
  title: string;
  description: string;
  buttonText: string;
  image: StaticImageData;
  imageAlt: string;

  /**
   * Determines the desktop layout.
   * Mobile always stacks vertically.
   */
  imagePosition: "left" | "right";

  /**
   * Per-card design overrides.
   * These preserve the intentional spacing differences.
   */
  cardClassName?: string;
  imageWrapperClassName?: string;
  imageClassName?: string;
  contentClassName?: string;
};

const features: FeatureCardData[] = [
  {
    id: "celebratory-messaging",
    title: "Automated & Instant Celebratory Messaging",
    description:
      "Never miss another special day. Set it once, and let Festa remember for you. Automatically send birthday wishes or event messages to friends, family, or customers at the perfect time even when life gets busy.",
    buttonText: "Create a message",
    image: chatHero,
    imageAlt: "Automated & Instant Celebratory Messaging",
    imagePosition: "left",

    cardClassName: "py-8 sm:py-10 md:py-11 lg:py-12",

    imageWrapperClassName: "rounded-[8px]",

    imageClassName: "h-full w-full object-contain",

    contentClassName: "items-start text-left md:items-end md:text-right",
  },
  {
    id: "wishlist",
    title: "Let people celebrate you the right way",
    description:
      "Create your personal wish list so friends and loved ones know exactly what would make you smile. No more guessing, just meaningful gifts you actually want.",
    buttonText: "Create a wishlist",
    image: noteHero,
    imageAlt: "Create a personal wishlist",
    imagePosition: "right",

    cardClassName:
      "items-stretch bg-[#FCB900] px-5 sm:px-6 flex-col-reverse",

    imageWrapperClassName:
      "rounded-[8px] mt-[-28px] w-full min-h-full sm:min-h-full  md:min-h-full md:self-stretch",

    imageClassName:
      "w-full object-contain sm:min-h-[200px] md:h-full md:min-h-full ",

    contentClassName: "items-start text-left py-5 sm:py-8",
  },
  {
    id: "draw-names",
    title: "Add a little mystery to the celebration",
    description:
      "Planning a festive exchange with friends, family, or colleagues? Fasta handles the random matching so everyone gets to give and receive a surprise.",
    buttonText: "Start a draw",
    image: santaHero,
    imageAlt: "Secret Santa name draw",
    imagePosition: "left",

    cardClassName: "py-8 sm:py-10 md:py-11 lg:py-12",

    imageWrapperClassName: "rounded-[8px]",

    imageClassName: "h-full w-full object-contain",

    contentClassName: "items-start text-left md:items-end md:text-right",
  },
  {
    id: "hangouts",
    title: "Turn celebrations into experiences",
    description:
      "Sometimes the best gifts is a great time together. Discover restaurants, lounges, and fun spots to celebrate life’s moments with the people who matter most.",
    buttonText: "Create a hangout",
    image: hangoutHero,
    imageAlt: "Friends enjoying a hangout",
    imagePosition: "right",

    cardClassName:
      "mt-[-12px] items-center bg-[#FCB900] px-5 py-6 sm:px-6 sm:py-8",

    /**
     * This keeps the intentional extra vertical space
     * around this particular illustration.
     */
    imageWrapperClassName: "rounded-[8px] py-7",

    imageClassName: "w-full object-contain",

    contentClassName: "items-start text-left",
  },
  {
    id: "gift-marketplace",
    title: "Great Gifts Made Easy",
    description:
      "Discover thoughtful gifts from trusted sellers perfect for birthdays, anniversaries, or just because. Find something memorable without the stress of searching.",
    buttonText: "Browse gifts",
    image: goodiesHero,
    imageAlt: "Celebration gifts and goodies",
    imagePosition: "left",

    cardClassName: "py-8 sm:py-10 md:py-11 lg:py-12",

    imageWrapperClassName: "rounded-[8px]",

    imageClassName: "h-full w-full object-contain",

    contentClassName: "items-start text-left md:items-end md:text-right",
  },
];

type FeatureCardProps = FeatureCardData;

function FeatureCard({
  title,
  description,
  buttonText,
  image,
  imageAlt,
  imagePosition,
  cardClassName,
  imageWrapperClassName,
  imageClassName,
  contentClassName,
}: FeatureCardProps) {
  const imageIsOnRight = imagePosition === "right";

  return (
    <article
      className={cn(
        /*
         * Mobile:
         * Stack content vertically.
         *
         * Desktop:
         * Display image and text side-by-side.
         */
        "flex cursor-pointer flex-col gap-6 rounded-[16px] transition-colors",
        "md:flex-row md:gap-4",
        cardClassName,
      )}
    >
      <div
        className={cn(
          /*
           * min-h protects illustrations from becoming
           * too short on narrow mobile screens.
           */
          "relative min-h-[240px] w-full shrink-0 overflow-hidden",
          "sm:min-h-[300px]",
          "md:min-h-[360px] md:w-1/2 md:flex-1",
          imageIsOnRight && "md:order-2",
          imageWrapperClassName,
        )}
      >
        <Image
          src={image}
          alt={imageAlt}
          className={cn(
            "mx-auto max-h-[420px] min-h-[220px] w-full object-contain",
            "sm:min-h-[280px]",
            "md:min-h-0",
            imageClassName,
          )}
        />
      </div>

      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col justify-center gap-3",
          "sm:gap-4 lg:gap-5",
          imageIsOnRight && "md:order-1",
          contentClassName,
        )}
      >
        <h3
          className={cn(
            "text-[24px] font-semibold   max-w-[600px] leading-[1.2] text-[#3300C9]",
            "sm:text-[32px]",
            "lg:text-[40px]",
            "font-poppins",
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "text-[14px] font-normal leading-[1.7] max-w-[600px] text-[#434343]",
            "sm:text-[16px]",
            "lg:text-[20px]",
          )}
        >
          {description}
        </p>

        <Button
          label={buttonText}
          variant="filled"
          className={cn(
            "w-full px-6 py-3 text-[14px]",
            "sm:w-auto sm:px-7",
            "lg:px-8 lg:text-base",
          )}
        >
          <span className="inline-flex items-center gap-2">
            {buttonText}

            <Image
              src={diagArrow}
              alt=""
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
            />
          </span>
        </Button>
      </div>
    </article>
  );
}

export default function FeaturesSection() {
  return (
    <section
      className={cn(
        "mt-10 rounded-[16px] bg-[#F4F4F4]",
        "px-4 pt-8 mb-10",
        "sm:px-6 sm:pt-10",
        "md:px-12 md:pt-12",
        "lg:pt-15",
      )}
    >
      <div className="mx-auto">
        <MotionReveal
          amount={0.35}
          className={cn(
            "mb-1 flex flex-col items-center justify-center text-center",
            "sm:mb-4",
            "md:mb-6",
            "lg:mb-8",
          )}
        >
          <h2
            className={cn(
              "mb-3 font-bold text-[24px] leading-[1.18] tracking-[0.05em] text-dark",
              "sm:text-[28px]",
              "md:text-[32px]",
              "lg:text-[40px]",
              "font-poppins",
            )}
          >
            One Celebration. Endless Moments.
          </h2>

          <p className="text-[14px] font-medium text-muted sm:text-[15px] lg:text-[16px]">
            Experience curated gifting, vibrant hangouts, and live name draws
            designed to bring everyone together.
          </p>
        </MotionReveal>

        <div>
          {features.map((feature, index) => (
            <MotionReveal
              key={feature.id}
              amount={0.18}
              delay={Math.min(index * 0.04, 0.16)}
              direction={feature.imagePosition === "left" ? "right" : "left"}
            >
              <FeatureCard {...feature} />
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

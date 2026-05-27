import Button from "@/components/Button";
import Image from "next/image";
import pics1 from "@/assets/icons/featureImg1.svg";
import pics2 from "@/assets/icons/featureImg2.svg";
import pics3 from "@/assets/icons/featureImg3.svg";
import pics4 from "@/assets/icons/featureImg4.svg";
import pics5 from "@/assets/icons/featureImg5.svg";
import pics6 from "@/assets/icons/featureImg6.svg";


const features = [
  {
    id: 1,
    title: "Automated Messages",
    description:
      "Never miss another special day. Set it once, and let Yule remember for you. Automatically send birthday wishes or event messages to friends, family, or customers at the perfect time even when life gets busy.",
    cta: "Set Up Automatic Wishes",
    href: "/automated-messages",
    highlight: true,
    image: pics1,
  },
  {
    id: 2,
    title: "Instant Message",
    description:
      "Celebrate the moment, right now. Forgot a birthday until the last minute? No worries. Send a thoughtful message instantly and make someone's day feel just as special.",
    cta: "Send a Wish Now",
    href: "/instant-message",
    highlight: false,
    image: pics2,
  },
  {
    id: 3,
    title: "Wish lists",
    description:
      "Let people celebrate you the right way. Create your personal wish list so friends and loved ones know exactly what would make you smile. No more guessing just meaningful gifts you actually want.",
    cta: "Create Your Wish lists",
    href: "/wish-lists",
    highlight: false,
    image: pics3,
  },
  {
    id: 4,
    title: "Secret Santa",
    description:
      "Add a little mystery to the celebration. Planning a festive exchange with friends, family, or colleagues? Yule handles the random matching so everyone gets to give and receive a surprise.",
    cta: "Start a Secret Santa",
    href: "/secret-santa",
    highlight: false,
    image: pics4,
  },
  {
    id: 5,
    title: "Find Gifts",
    description:
      "Great gifts made easy. Discover thoughtful gifts from trusted sellers perfect for birthdays, anniversaries, or just because. Find something memorable without the stress of searching.",
    cta: "Set Up Automatic Wishes",
    href: "/find-gifts",
    highlight: false,
    image: pics5,
  },
  {
    id: 6,
    title: "Find Hangouts",
    description:
      "Turn celebrations into experiences. Sometimes the best gift is a great time together. Discover restaurants, lounges, and fun spots to celebrate life's moments with the people who matter most.",
    cta: "Find Places to Celebrate",
    href: "/find-hangouts",
    highlight: false,
    image: pics6,
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white px-5 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-15">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          <span className="inline-block bg-[#FF660014] border border-[#FF6600] text-[#FF6600] text-[12px] sm:text-[14px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-[12px] mb-3 sm:mb-4 tracking-wide">
            Main Features
          </span>
          <h2 className="font-title text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] leading-[1.18] tracking-[0.05em] text-dark mb-3">
            One Celebration. Endless Moments.
          </h2>
          <p className="text-muted text-[14px] sm:text-[15px] lg:text-[16px] font-medium">
            Experience curated gifting, vibrant hangouts, and live name draws
            designed to bring everyone together.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-25">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-[16px] cursor-pointer px-5 sm:px-6 py-8 sm:py-10 md:py-11 lg:py-12.5 flex flex-col gap-4 border-2 transition-colors hover:border-primary border-gray-200"
            >
              <div className="w-full aspect-video rounded-[8px] overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 flex-1">
                <h3 className="font-title text-[20px] sm:text-[22px] lg:text-[24px] text-dark">
                  {feature.title}
                </h3>
                <p className="text-muted text-[14px] sm:text-[15px] lg:text-[16px] leading-relaxed flex-1">
                  {feature.description}
                </p>
                <Button
                  href={feature.href}
                  label={feature.cta}
                  variant="outlined"
                  className="mt-2 w-full rounded-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

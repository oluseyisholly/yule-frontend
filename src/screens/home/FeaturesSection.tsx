import Link from "next/link";

const features = [
  {
    id: 1,
    title: "Automated Messages",
    description:
      "Never miss another special day. Set it once, and let Yule remember for you. Automatically send birthday wishes or event messages to friends, family, or customers at the perfect time even when life gets busy.",
    cta: "Set Up Automatic Wishes",
    href: "/automated-messages",
    highlight: true,
    image: "Person using phone",
  },
  {
    id: 2,
    title: "Instant Message",
    description:
      "Celebrate the moment, right now. Forgot a birthday until the last minute? No worries. Send a thoughtful message instantly and make someone's day feel just as special.",
    cta: "Send a Wish Now",
    href: "/instant-message",
    highlight: false,
    image: "Hand holding phone with message",
  },
  {
    id: 3,
    title: "Wish lists",
    description:
      "Let people celebrate you the right way. Create your personal wish list so friends and loved ones know exactly what would make you smile. No more guessing just meaningful gifts you actually want.",
    cta: "Create Your Wish lists",
    href: "/wish-lists",
    highlight: false,
    image: "Birthday wish card",
  },
  {
    id: 4,
    title: "Secret Santa",
    description:
      "Add a little mystery to the celebration. Planning a festive exchange with friends, family, or colleagues? Yule handles the random matching so everyone gets to give and receive a surprise.",
    cta: "Start a Secret Santa",
    href: "/secret-santa",
    highlight: false,
    image: "Christmas gifts and cookies",
  },
  {
    id: 5,
    title: "Find Gifts",
    description:
      "Great gifts made easy. Discover thoughtful gifts from trusted sellers perfect for birthdays, anniversaries, or just because. Find something memorable without the stress of searching.",
    cta: "Set Up Automatic Wishes",
    href: "/find-gifts",
    highlight: false,
    image: "Gift box with ribbon",
  },
  {
    id: 6,
    title: "Find Hangouts",
    description:
      "Turn celebrations into experiences. Sometimes the best gift is a great time together. Discover restaurants, lounges, and fun spots to celebrate life's moments with the people who matter most.",
    cta: "Find Places to Celebrate",
    href: "/find-hangouts",
    highlight: false,
    image: "Friends celebrating together",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-white px-6 py-14 md:py-20">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-14">
          <span className="inline-block border border-[#F5A623] text-[#F5A623] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            Main Features
          </span>
          <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-bold text-dark leading-tight mb-4">
            One Celebration. Endless Moments.
          </h2>
          <p className="text-muted text-base max-w-xl leading-relaxed">
            Experience curated gifting, vibrant hangouts, and live name draws
            designed to bring everyone together.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`rounded-2xl p-5 flex flex-col gap-4 border ${
                feature.highlight
                  ? "border-2 border-primary"
                  : "border border-gray-200"
              }`}
            >
              {/* Image placeholder */}
              <div className="w-full aspect-video rounded-xl bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm text-center px-3">
                  {feature.image}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 flex-1">
                <h3 className="font-title text-xl font-bold text-dark">
                  {feature.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed flex-1">
                  {feature.description}
                </p>
                <Link
                  href={feature.href}
                  className="mt-1 w-full text-center border border-primary text-primary text-sm font-semibold py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
                >
                  {feature.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

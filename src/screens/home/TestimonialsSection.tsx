import Image from "next/image";
import pics1 from "@/assets/icons/video(1).svg";
import pics2 from "@/assets/icons/video(2).svg";
import pics3 from "@/assets/icons/video(3).svg";
import pics4 from "@/assets/icons/video(4).svg";

const testimonials = [
  {
    id: 1,
    name: "Jalen kyle",
    role: "Founder of Mediahouse",
    image: pics1,
    playing: false,
  },
  {
    id: 2,
    name: "Alexander",
    role: "Content Writer",
    image: pics2,
    playing: true,
  },
  {
    id: 3,
    name: "Emily Grace",
    role: "Marketing Head",
    image: pics3,
    playing: false,
  },
  {
    id: 4,
    name: "Daniel Ethan",
    role: "Product Designer",
    image: pics4,
    playing: false,
  },
];

function PlayIcon() {
  return (
    <span
      className="block ml-0.5"
      style={{
        width: 0,
        height: 0,
        borderLeft: "9px solid white",
        borderTop: "6px solid transparent",
        borderBottom: "6px solid transparent",
      }}
    />
  );
}

function PauseIcon() {
  return (
    <span className="flex gap-1">
      <span className="block w-1 h-3.5 bg-white" />
      <span className="block w-1 h-3.5 bg-white" />
    </span>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="bg-gradient-to-b from-[#3300C9] to-[#1F007D] px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:py-15">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-10 flex flex-col items-center text-center sm:mb-12 lg:mb-14">
          <span className="mb-3 inline-block rounded-[12px] border border-white px-3 py-1.5 text-[12px] tracking-wide text-white sm:mb-4 sm:px-4 sm:py-2 sm:text-[14px]">
            Reviews
          </span>
          <h2 className="mb-3 font-title text-[26px] leading-tight text-white sm:mb-4 sm:text-[32px] md:text-[36px] lg:text-[40px]">
            See what Users are saying
          </h2>
          <p className="max-w-[680px] text-[14px] font-medium leading-relaxed text-white/80 sm:text-[15px] lg:text-[16px]">
            Discover how video testimonial has helped in celebrating there loved
            ones specially
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 justify-items-center sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="relative aspect-[288/450] w-full max-w-[320px] overflow-hidden rounded-[24px] bg-gray-700 sm:max-w-[288px] lg:h-[450px] lg:w-[288px] lg:max-w-none lg:aspect-auto"
            >
              {/* Image placeholder — replace with <Image /> */}
              <Image
                src={t.image}
                alt={`${t.name} testimonial`}
                fill
                className="object-cover"
              />

              {/* Bottom gradient for text contrast */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Name + role + play/pause */}
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                <div className="min-w-0 text-white">
                  <h3 className="truncate font-inter text-sm font-semibold leading-[24.01px] tracking-[-0.5px] md:text-[18px]">
                    {t.name}
                  </h3>
                  <p className="text-[14px] text-[#D4D4D8] truncate">{t.role}</p>
                </div>

                <button
                  type="button"
                  aria-label={t.playing ? "Pause testimonial" : "Play testimonial"}
                  className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/70 transition-colors hover:bg-white/10"
                >
                  {t.playing ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

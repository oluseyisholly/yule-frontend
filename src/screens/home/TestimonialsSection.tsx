const testimonials = [
  {
    id: 1,
    name: "Jalen kyle",
    role: "Founder of Mediahouse",
    image: "Jalen kyle portrait",
    playing: false,
  },
  {
    id: 2,
    name: "Alexander",
    role: "Content Writer",
    image: "Alexander portrait",
    playing: true,
  },
  {
    id: 3,
    name: "Emily Grace",
    role: "Marketing Head",
    image: "Emily Grace portrait",
    playing: false,
  },
  {
    id: 4,
    name: "Daniel Ethan",
    role: "Product Designer",
    image: "Daniel Ethan portrait",
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
    <section className="bg-gradient-to-b from-[#3300C9] to-[#1F007D] px-5 sm:px-6 py-8 sm:py-10 md:py-12 lg:py-15">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-12 lg:mb-14">
          <span className="inline-block border border-white text-white text-[12px] sm:text-[14px] px-3 sm:px-4 py-1.5 sm:py-2 rounded-[12px] mb-3 sm:mb-4 tracking-wide">
            Reviews
          </span>
          <h2 className="font-title text-[26px] sm:text-[32px] md:text-[36px] lg:text-[40px] text-white leading-tight mb-3 sm:mb-4">
            See what Users are saying
          </h2>
          <p className="text-white/80 text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-relaxed max-w-xl">
            Discover how video testimonial has helped in celebrating there loved
            ones specially
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-items-center">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="relative w-full max-w-[288px] aspect-[288/450] rounded-[24px] overflow-hidden bg-gray-700 lg:w-[288px] lg:h-[450px] lg:max-w-none lg:aspect-auto"
            >
              {/* Image placeholder — replace with <Image /> */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-xs text-center px-2">
                  {t.image}
                </span>
              </div>

              {/* Bottom gradient for text contrast */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Name + role + play/pause */}
              <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
                <div className="text-white min-w-0">
                  <h3 className="font-title font-bold text-sm md:text-base truncate">
                    {t.name}
                  </h3>
                  <p className="text-xs text-white/80 truncate">{t.role}</p>
                </div>

                <button
                  type="button"
                  aria-label={t.playing ? "Pause testimonial" : "Play testimonial"}
                  className="shrink-0 w-10 h-10 rounded-lg border border-white/70 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
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

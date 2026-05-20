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
    <section className="bg-gradient-to-b from-[#3300C9] to-[#1F007D] px-6 py-14 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-block border border-white/50 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide">
            Reviews
          </span>
          <h2 className="font-title text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            See what Users are saying
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-2xl leading-relaxed">
            Discover how video testimonial has helped in celebrating there loved
            ones specially
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-700"
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

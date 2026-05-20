export default function CtaBannerSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background image placeholder — replace with <Image /> */}
      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
        <span className="text-gray-400 text-sm">
          People celebrating background
        </span>
      </div>

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center text-white py-16 md:py-24 px-6">
        <h2 className="font-title text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight">
          Turn Every Moment Into a Celebration.
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white/90 mb-8 md:mb-10 max-w-3xl">
          Celebrate better, Remember more. Make every moment count with Yule
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
          <button className="bg-primary text-white px-8 sm:px-10 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer sm:min-w-[220px]">
            Start Using Yule Today
          </button>
          <button className="border border-white text-white px-8 sm:px-10 py-3.5 rounded-full font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer sm:min-w-[220px]">
            Make Someone&apos;s Day
          </button>
        </div>
      </div>
    </section>
  );
}

import Button from "@/components/Button";
import bgImage from "@/assets/images/ctaBg.png";

export default function CtaBannerSection() {
  return (
    <section className="flex w-full justify-center bg-white px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-10 lg:py-20">
      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-[16px] bg-cover bg-center bg-no-repeat sm:rounded-[20px] lg:rounded-[24px]"
        style={{ backgroundImage: `url(${bgImage.src})` }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center px-5 py-10 text-center text-white sm:px-6 sm:py-12 md:py-20 lg:py-24">
          <p className="mb-3 text-[26px] font-bold leading-tight sm:mb-4 sm:text-[30px] md:text-[38px] lg:text-[40px]">
            Turn Every Moment Into a Celebration.
          </p>
          <p className="mb-5 max-w-[720px] text-[14px] text-white sm:mb-6 sm:text-[16px] md:text-[20px] lg:mb-6 lg:text-[24px]">
            Celebrate better, Remember more. Make every moment count with Yule
          </p>

          <div className="flex w-full max-w-[460px] flex-col justify-center gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:gap-6 md:gap-8 lg:gap-12">
            <Button
              label="Start Using Yule Today"
              variant="filled"
              className="w-full px-6 py-3 sm:min-w-[200px] sm:w-auto sm:px-8 sm:py-3.5 lg:min-w-[220px] lg:px-10"
            />
            <Button
              label="Make Someone's Day"
              variant="outlined"
              className="w-full border-white px-6 py-3 text-white hover:bg-white/10 sm:min-w-[200px] sm:w-auto sm:px-8 sm:py-3.5 lg:min-w-[220px] lg:px-10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

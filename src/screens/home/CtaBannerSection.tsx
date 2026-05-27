import Button from "@/components/Button";
import bgImage from "@/assets/images/ctaBg.png";

export default function CtaBannerSection() {
  return (
    <section className="bg-white w-full flex justify-center px-4 sm:px-6 md:px-10 lg:px-24 py-8 sm:py-10 md:py-14 lg:py-26">
      <div
        className="relative w-[95%] sm:w-[92%] md:w-[88%] lg:w-[80%] overflow-hidden rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${bgImage.src})` }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center text-white py-10 sm:py-12 md:py-20 lg:py-28 px-5 sm:px-6">
          <p className="text-[24px] sm:text-[28px] md:text-[34px] lg:text-[40px] font-bold mb-3 sm:mb-4 leading-tight">
            Turn Every Moment Into a Celebration.
          </p>
          <p className="text-[14px] sm:text-[16px] md:text-[20px] lg:text-[24px] text-white mb-5 sm:mb-6 lg:mb-6.5">
            Celebrate better, Remember more. Make every moment count with Yule
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-10 lg:gap-16.5 justify-center w-full sm:w-auto">
            <Button
              label="Start Using Yule Today"
              variant="filled"
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 sm:min-w-[200px] lg:min-w-[220px]"
            />
            <Button
              label="Make Someone's Day"
              variant="outlined"
              className="px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 sm:min-w-[200px] lg:min-w-[220px] border-white text-white hover:bg-white/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

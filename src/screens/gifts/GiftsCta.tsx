import Button from "@/components/Button";
import bgImage from "@/assets/icons/featureImg3.svg";

export default function GiftsCta() {
  return (
    <section className="bg-white w-full flex justify-center px-4 sm:px-6 md:px-10 lg:px-24 py-8 sm:py-10 md:py-14 lg:py-20">
      <div
        className="relative w-full overflow-hidden rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${bgImage.src})` }}
      >
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 flex flex-col items-center text-center text-white py-10 sm:py-12 md:py-16 lg:py-20 px-5 sm:px-6">
          <p className="text-[24px] sm:text-[28px] md:text-[32px] lg:text-[36px] font-bold mb-3 leading-tight">
            Turn Every Moment Into a Celebration.
          </p>
          <p className="text-[14px] sm:text-[16px] md:text-[18px] text-white mb-6 max-w-2xl">
            From thoughtful gifts to unforgettable hangouts, we help you make every occasion extraordinary.
          </p>

          <Button
            label="Get Started"
            variant="filled"
            className="px-8 sm:px-10 py-3 sm:py-3.5 min-w-[180px]"
          />
        </div>
      </div>
    </section>
  );
}

import Button from "@/components/Button";
import Image from "next/image";
import pics1 from "@/assets/icons/firstHead.svg";
import pics2 from "@/assets/icons/secondHead.svg";
import pics3 from "@/assets/icons/thirdHead.svg";
import pics5 from "@/assets/icons/fifthHead.svg";

const avatars = [pics1, pics2, pics3, pics3, pics5];


export default function HeroSection() {
  return (
    <section className="flex flex-col items-center text-center lg:px-28 pt-9 md:pt-19 pb-8 md:pb-18 ">
      {/* Social proof */}
      <div className="flex items-center gap-4 mb-7">
        <div className="flex -space-x-2">
          {avatars.map((avatar, i) => (
            <Image
              key={i}
              src={avatar}
              alt={`user avatar ${i + 1}`}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full border-[0.3px] border-white"
            />
          ))}
        </div>
        <span className="text-[12px] text-text-dark text-muted">
          Over 200 thousand users
        </span>
      </div>

      {/* Heading */}
      <h1 className="font-title text-[48px] leading-[1.15] tracking-[0.04em] mb-6 lg:max-w-[854px] lg:mx-auto ">
        <span className="text-primary">Celebrate </span>
        <span className="text-dark">
          Life&apos;s Moment&apos;s
          <br />
          without Missing a Beat
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-muted text-base md:text-[20px] mb-5 leading-relaxed lg:max-w-[760px] lg:mx-auto">
        Life is full of moments worth celebrating. Yule helps you turn them
        into meaningful gestures through effortless messages, thoughtful
        gifts, and memorable experiences so no special moment ever goes
        unnoticed. 🎉
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full sm:w-auto">
        <Button
          label="Start Celebrating"
          variant="filled"
          className="px-8 py-3.5 text-base"
        />
        <Button
          label="Create your first celebration"
          variant="outlined"
          className="px-8 py-3.5 text-base"
        />
      </div>
      
    </section>
  );
}

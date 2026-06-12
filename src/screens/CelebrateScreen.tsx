import Image from "next/image";
import CreateCelebrationForm from "@/screens/celebrate/CreateCelebrationForm";
import sideImage from "@/assets/images/createAcc.png";

export default function CelebrateScreen() {
  return (
    <main className="bg-white">
      <section className="max-w-7xl mx-auto px-[30px] py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-18 items-stretch">
          {/* Image */}
          <div className="relative w-full h-full min-h-[340px] md:min-h-[420px] lg:min-h-0 overflow-hidden rounded-[20px] lg:rounded-[24px] bg-gray-100 order-1">
            <Image
              src={sideImage}
              alt="A gift box wrapped with a ribbon"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Form */}
          <div className="order-2 flex items-center justify-center w-full">
            <CreateCelebrationForm />
          </div>
        </div>
      </section>
    </main>
  );
}

import Image from "next/image";
import StartCelebratingForm from "@/screens/start/StartCelebratingForm";
import sideImage from "@/assets/images/start.png";

export default function StartScreen() {

  
  return (
    <main className="bg-white">
      <section className="max-w-7xl mx-auto px-[30px] py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Image */}
          <div className="relative w-full aspect-[4/5] md:aspect-[5/6] lg:aspect-[4/5] overflow-hidden rounded-[20px] lg:rounded-[24px] bg-gray-100 order-1">
            <Image
              src={sideImage}
              alt="People celebrating"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Form */}
          <div className="order-2 flex justify-center w-full">
            <StartCelebratingForm />
          </div>
        </div>
      </section>
    </main>
  );
}

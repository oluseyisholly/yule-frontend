import Image from "next/image";
import pics1 from "@/assets/icons/imgGallery1.svg";
import pics2 from "@/assets/icons/imgGallery2.svg";
import pics3 from "@/assets/icons/imgGallery3.svg";
import pics4 from "@/assets/icons/imgGallery4.svg";

const galleryImages = [pics1, pics2, pics3, pics4];

export default function ImageGallerySection() {
  return (
    <section className="px-5 pb-6 sm:px-6 sm:pb-8 md:px-8 md:pb-13">
      <div className="mx-auto grid max-w-[420px] grid-cols-2 gap-3 sm:max-w-[520px] sm:gap-5 md:max-w-[720px] md:gap-6 lg:max-w-[860px] xl:max-w-none xl:flex xl:flex-wrap xl:justify-center xl:gap-9">
        {galleryImages.map((src, i) => (
          <div
            key={i}
            className="aspect-[289/267] overflow-hidden rounded-[8px] xl:h-[267px] xl:w-[289px] xl:aspect-auto"
          >
            <Image
              src={src}
              alt={`gallery image ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

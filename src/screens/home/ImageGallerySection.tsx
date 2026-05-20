import Image from "next/image";
import pics1 from "@/assets/icons/imgGallery1.svg";
import pics2 from "@/assets/icons/imgGallery2.svg";
import pics3 from "@/assets/icons/imgGallery3.svg";
import pics4 from "@/assets/icons/imgGallery4.svg";

const galleryImages = [pics1, pics2, pics3, pics4];

export default function ImageGallerySection() {
  return (
    <section className="px-5 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-13">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 max-w-[420px] sm:max-w-[520px] md:max-w-[720px] lg:max-w-[860px] mx-auto xl:max-w-none xl:flex xl:flex-wrap xl:justify-center xl:gap-9">
        {galleryImages.map((src, i) => (
          <div
            key={i}
            className="aspect-[289/267] rounded-[8px] overflow-hidden xl:aspect-auto xl:w-[289px] xl:h-[267px]"
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

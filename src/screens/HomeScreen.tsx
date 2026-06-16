import HeroSection from "@/screens/home/HeroSection";
import ImageGallerySection from "@/screens/home/ImageGallerySection";
import FeaturesSection from "@/screens/home/FeaturesSection";
import TestimonialsSection from "@/screens/home/TestimonialsSection";
import CtaBannerSection from "@/screens/home/CtaBannerSection";
import FAQSection from "@/screens/home/FAQSection";
import heroBg from "@/assets/images/heroBg.png";

export default function HomeScreen() {
  return (
    <main className="overflow-x-hidden">
      <div
        className="bg-surface bg-cover bg-no-repeat bg-[position:center_top] sm:bg-[position:center_22%]"
        style={{ backgroundImage: `url(${heroBg.src})` }}
      >
        <HeroSection />
        <ImageGallerySection />
      </div>
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <CtaBannerSection />
    </main>
  );
}

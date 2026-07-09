import HeroSection from "@/screens/home/HeroSection";
import FeaturesSection from "@/screens/home/FeaturesSection";
import { Poppins } from "next/font/google";




export default function HomeScreen() {
  return (
    <main className="overflow-x-hidden">
      <div
        
      >
        <HeroSection />
        {/* <ImageGallerySection /> */}
      </div>
      <FeaturesSection />
      {/* <TestimonialsSection />
      <FAQSection />
      <CtaBannerSection /> */}
    </main>
  );
}

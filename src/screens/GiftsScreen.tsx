import GiftsHeader from "@/screens/gifts/GiftsHeader";
import GiftsGrid from "@/screens/gifts/GiftsGrid";
import GiftsCta from "@/screens/gifts/GiftsCta";

export default function GiftsScreen() {
  return (
    <main className="bg-white">
      <section className="mx-auto pt-6 md:pt-8 lg:pt-10 pb-10 md:pb-14 lg:pb-16 flex flex-col gap-8 md:gap-10">
        <GiftsHeader />
        <GiftsGrid />
      </section>

      <GiftsCta />
    </main>
  );
}

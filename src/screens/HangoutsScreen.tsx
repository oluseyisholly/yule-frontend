import HangoutsHeader from "@/screens/hangouts/HangoutsHeader";
import HangoutsGrid from "@/screens/hangouts/HangoutsGrid";
import PromoCta from "@/components/PromoCta";

export default function HangoutsScreen() {
  return (
    <main className="bg-white">
      <section className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8 lg:px-12 pt-8 md:pt-10 lg:pt-12 pb-10 md:pb-14 lg:pb-16 flex flex-col gap-8 md:gap-10">
        <HangoutsHeader />
        <HangoutsGrid />
      </section>

      <PromoCta />
    </main>
  );
}

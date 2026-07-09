import HangoutsHeader from "@/screens/hangouts/HangoutsHeader";
import HangoutsGrid from "@/screens/hangouts/HangoutsGrid";
import PromoCta from "@/components/PromoCta";

export default function HangoutsScreen() {
  return (
    <main className="bg-white">
      <section className="mx-auto pt-8 md:pt-10 lg:pt-12 pb-10 md:pb-14 lg:pb-16 flex flex-col gap-8 md:gap-10">
        <HangoutsHeader />
        <HangoutsGrid />
      </section>

      <PromoCta />
    </main>
  );
}

import { Suspense } from "react";
import HomeScreen from "@/screens/HomeScreen";
import LandingPageEntry from "@/screens/LandingPageEntry";

export default function Page() {
  return (
    <Suspense fallback={<HomeScreen />}>
      <LandingPageEntry />
    </Suspense>
  );
}

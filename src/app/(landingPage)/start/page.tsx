import { Suspense } from "react";
import StartScreen from "@/screens/StartScreen";

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartScreen />
    </Suspense>
  );
}

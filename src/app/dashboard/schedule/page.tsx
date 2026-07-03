import type { Metadata } from "next";
import { Suspense } from "react";
import ScheduleScreen from "@/screens/ScheduleScreen";

export const metadata: Metadata = {
  title: "Schedule Event & Message",
  description: "Set up reminders, events, and messages",
};

export default function SchedulePage() {
  return (
    <Suspense fallback={null}>
      <ScheduleScreen />
    </Suspense>
  );
}

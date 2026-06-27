import type { Metadata } from "next";
import ScheduleScreen from "@/screens/ScheduleScreen";

export const metadata: Metadata = {
  title: "Schedule Event & Message",
  description: "Set up reminders, events, and messages",
};

export default function SchedulePage() {
  return <ScheduleScreen />;
}

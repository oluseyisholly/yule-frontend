import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "Schedule Event & Message",
  description: "Set up reminders, events, and messages",
};

export default function SchedulePage() {
  return <DashboardWorkspace tab="schedule" />;
}

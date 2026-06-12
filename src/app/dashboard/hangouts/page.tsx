import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "Hangouts",
  description: "Plan moments worth sharing",
};

export default function HangoutsPage() {
  return <DashboardWorkspace tab="hangouts" />;
}

import type { Metadata } from "next";
import DashboardHangoutsScreen from "@/screens/DashboardHangoutsScreen";

export const metadata: Metadata = {
  title: "Hangouts",
  description: "Plan moments worth sharing",
};

export default function HangoutsPage() {
  return <DashboardHangoutsScreen />;
}

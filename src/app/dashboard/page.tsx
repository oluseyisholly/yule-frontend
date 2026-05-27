import type { Metadata } from "next";
import DashboardScreen from "@/screens/DashboardScreen";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Yule dashboard workspace",
};

export default function DashboardPage() {
  return <DashboardScreen />;
}

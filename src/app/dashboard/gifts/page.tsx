import type { Metadata } from "next";
import DashboardGiftsScreen from "@/screens/DashboardGiftsScreen";

export const metadata: Metadata = {
  title: "Gifts",
  description: "Track gifts sent and received",
};

export default function GiftsPage() {
  return <DashboardGiftsScreen />;
}

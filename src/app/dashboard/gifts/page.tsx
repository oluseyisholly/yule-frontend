import type { Metadata } from "next";
import GiftsScreen from "@/screens/GiftsScreen";

export const metadata: Metadata = {
  title: "Gifts",
  description: "Track gifts sent and received",
};

export default function GiftsPage() {
  return <GiftsScreen />;
}

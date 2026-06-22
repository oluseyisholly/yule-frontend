import type { Metadata } from "next";
import HistoryScreen from "@/screens/HistoryScreen";

export const metadata: Metadata = {
  title: "My History",
  description: "Look back on past celebration activity",
};

export default function HistoryPage() {
  return <HistoryScreen />;
}

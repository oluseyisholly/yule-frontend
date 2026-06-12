import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "My History",
  description: "Look back on past celebration activity",
};

export default function HistoryPage() {
  return <DashboardWorkspace tab="history" />;
}

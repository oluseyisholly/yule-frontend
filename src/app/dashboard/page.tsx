import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Yule dashboard workspace",
};

export default function DashboardPage() {
  return <DashboardWorkspace tab="dashboard" />;
}

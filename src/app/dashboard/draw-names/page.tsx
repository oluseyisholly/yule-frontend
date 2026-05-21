import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "Draw Names",
  description: "Organize secret gift exchanges",
};

export default function DrawNamesPage() {
  return <DashboardWorkspace tab="draw-names" />;
}

import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "Gifts",
  description: "Track gift ideas and thoughtful picks",
};

export default function GiftsPage() {
  return <DashboardWorkspace tab="gifts" />;
}

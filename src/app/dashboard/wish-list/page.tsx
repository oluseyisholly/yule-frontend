import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "Create Wish List",
  description: "Collect and manage your wish list ideas",
};

export default function WishListPage() {
  return <DashboardWorkspace tab="wish-list" />;
}

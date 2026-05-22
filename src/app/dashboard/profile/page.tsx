import type { Metadata } from "next";
import DashboardWorkspace from "@/components/dashboard/Workspace";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your profile and preferences",
};

export default function ProfilePage() {
  return <DashboardWorkspace tab="profile" />;
}

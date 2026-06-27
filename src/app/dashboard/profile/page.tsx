import type { Metadata } from "next";
import ProfileScreen from "@/screens/ProfileScreen";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your profile and preferences",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}

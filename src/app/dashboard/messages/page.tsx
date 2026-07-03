import type { Metadata } from "next";
import MessagesScreen from "@/screens/MessagesScreen";

export const metadata: Metadata = {
  title: "Messages",
  description: "View and manage your conversations",
};

export default function MessagesPage() {
  return <MessagesScreen />;
}

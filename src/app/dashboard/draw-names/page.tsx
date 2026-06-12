import type { Metadata } from "next";
import DrawNamesScreen from "@/screens/DrawNamesScreen";

export const metadata: Metadata = {
  title: "Draw Names",
  description: "Organize secret gift exchanges",
};

export default function DrawNamesPage() {
  return <DrawNamesScreen />;
}

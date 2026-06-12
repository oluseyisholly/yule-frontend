import type { Metadata } from "next";
import WishListScreen from "@/screens/WishListScreen";

export const metadata: Metadata = {
  title: "Create Wish List",
  description: "Collect and manage your wish list ideas",
};

export default function WishListPage() {
  return <WishListScreen />;
}

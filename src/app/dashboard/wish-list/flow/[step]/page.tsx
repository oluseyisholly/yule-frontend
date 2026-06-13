import type { Metadata } from "next";
import { redirect } from "next/navigation";
import WishListScreen from "@/screens/WishListScreen";
import { isWishListModalStep } from "@/screens/wish-list/modal-steps";

type WishListFlowPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export const metadata: Metadata = {
  title: "Create Wish List",
  description: "Collect and manage your wish list ideas",
};

export default async function WishListFlowPage({
  params,
}: WishListFlowPageProps) {
  const { step } = await params;

  if (!isWishListModalStep(step)) {
    redirect("/dashboard/wish-list");
  }

  return <WishListScreen />;
}

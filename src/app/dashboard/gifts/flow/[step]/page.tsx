import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardGiftsScreen from "@/screens/DashboardGiftsScreen";
import { isGiftModalStep } from "@/screens/gifts/modal-steps";

type GiftsFlowPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export const metadata: Metadata = {
  title: "Get a Gift",
  description: "Start a gift flow from your dashboard",
};

export default async function GiftsFlowPage({ params }: GiftsFlowPageProps) {
  const { step } = await params;

  if (!isGiftModalStep(step)) {
    redirect("/dashboard/gifts");
  }

  return (
    <Suspense fallback={null}>
      <DashboardGiftsScreen />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardHangoutsScreen from "@/screens/DashboardHangoutsScreen";
import { isHangoutModalStep } from "@/screens/hangouts/modal-steps";

type HangoutsFlowPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export const metadata: Metadata = {
  title: "Plan Hangout",
  description: "Start a hangout flow from your dashboard",
};

export default async function HangoutsFlowPage({
  params,
}: HangoutsFlowPageProps) {
  const { step } = await params;

  if (!isHangoutModalStep(step)) {
    redirect("/dashboard/hangouts");
  }

  return (
    <Suspense fallback={null}>
      <DashboardHangoutsScreen />
    </Suspense>
  );
}

import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ScheduleScreen from "@/screens/ScheduleScreen";
import { isScheduleMessageFlowStep } from "@/screens/schedule/modal-steps";

type ScheduleFlowPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export const metadata: Metadata = {
  title: "Schedule Event & Message",
  description: "Create or edit scheduled event messages",
};

export default async function ScheduleFlowPage({
  params,
}: ScheduleFlowPageProps) {
  const { step } = await params;

  if (!isScheduleMessageFlowStep(step)) {
    redirect("/dashboard/schedule");
  }

  return (
    <Suspense fallback={null}>
      <ScheduleScreen />
    </Suspense>
  );
}

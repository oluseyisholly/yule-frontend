import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DrawNamesScreen from "@/screens/DrawNamesScreen";
import { isDrawNameModalStep } from "@/screens/draw-names/modal-steps";

type DrawNameFlowPageProps = {
  params: Promise<{
    step: string;
  }>;
};

export const metadata: Metadata = {
  title: "Draw Names",
  description: "Organize secret gift exchanges",
};

export default async function DrawNameFlowPage({
  params,
}: DrawNameFlowPageProps) {
  const { step } = await params;

  if (!isDrawNameModalStep(step)) {
    redirect("/dashboard/draw-names");
  }

  return <DrawNamesScreen />;
}

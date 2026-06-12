import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DrawNameDetailsScreen from "@/screens/draw-names/DrawNameDetailsScreen";

type DrawNameDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    drawNameEventId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Draw Details",
    description: "View details for this draw name event",
  };
}

export default async function DrawNameDetailsPage({
  params,
  searchParams,
}: DrawNameDetailsPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const drawNameEventId = resolvedSearchParams.drawNameEventId?.trim();

  if (drawNameEventId && drawNameEventId !== id) {
    redirect(`/dashboard/draw-names/${drawNameEventId}`);
  }

  return <DrawNameDetailsScreen drawNameEventId={id} />;
}

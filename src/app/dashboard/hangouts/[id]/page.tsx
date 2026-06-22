import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getHangoutById } from "@/features/hangouts/mock-data";
import HangoutDetailsScreen from "@/screens/hangouts/HangoutDetailsScreen";

type HangoutDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: HangoutDetailsPageProps): Promise<Metadata> {
  const { id } = await params;
  const hangout = getHangoutById(id);

  return {
    title: hangout?.venueName ?? "Hangout Details",
    description: "View details for this hangout",
  };
}

export default async function HangoutDetailsPage({
  params,
}: HangoutDetailsPageProps) {
  const { id } = await params;
  const hangout = getHangoutById(id);

  if (!hangout) {
    notFound();
  }

  return <HangoutDetailsScreen hangoutId={id} />;
}

import type { Metadata } from "next";
import HangoutDetailsScreen from "@/screens/hangouts/HangoutDetailsScreen";

type HangoutDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Hangout Details",
  description: "View details for this hangout",
};

export default async function HangoutDetailsPage({
  params,
}: HangoutDetailsPageProps) {
  const { id } = await params;

  return <HangoutDetailsScreen hangoutId={id} />;
}

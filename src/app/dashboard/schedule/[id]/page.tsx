import type { Metadata } from "next";
import ScheduledEventMessageDetailsScreen from "@/screens/schedule/ScheduledEventMessageDetailsScreen";

type ScheduledEventMessageDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Scheduled Message Details",
    description: "View details for this scheduled event message",
  };
}

export default async function ScheduledEventMessageDetailsPage({
  params,
}: ScheduledEventMessageDetailsPageProps) {
  const { id } = await params;

  return <ScheduledEventMessageDetailsScreen scheduledEventMessageId={id} />;
}

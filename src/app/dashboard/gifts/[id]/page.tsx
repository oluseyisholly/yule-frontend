import type { Metadata } from "next";
import GiftingEventDetailsScreen from "@/screens/gifts/GiftingEventDetailsScreen";

type GiftingEventDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Gift Event Details",
    description: "View details for this gifting event",
  };
}

export default async function GiftingEventDetailsPage({
  params,
}: GiftingEventDetailsPageProps) {
  const { id } = await params;

  return <GiftingEventDetailsScreen giftingEventId={id} />;
}

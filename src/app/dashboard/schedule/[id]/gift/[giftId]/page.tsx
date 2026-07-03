import type { Metadata } from "next";
import ScheduledEventMessageGiftViewScreen from "@/screens/schedule/ScheduledEventMessageGiftViewScreen";

type ScheduledEventMessageGiftPageProps = {
  params: Promise<{
    id: string;
    giftId: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "View Gift",
    description: "View one gift attached to this scheduled message",
  };
}

export default async function ScheduledEventMessageGiftPage({
  params,
}: ScheduledEventMessageGiftPageProps) {
  const { id, giftId } = await params;

  return (
    <ScheduledEventMessageGiftViewScreen
      scheduledEventMessageId={id}
      giftId={giftId}
    />
  );
}

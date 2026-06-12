import type { Metadata } from "next";
import DrawNameGiftViewScreen from "@/screens/draw-names/DrawNameGiftViewScreen";

type DrawNameGiftViewPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    participantId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "View Gifts",
    description:
      "View the selected gifts for the participant you are paired with",
  };
}

export default async function DrawNameGiftViewPage({
  params,
  searchParams,
}: DrawNameGiftViewPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const participantId = resolvedSearchParams.participantId?.trim() || null;

  return (
    <DrawNameGiftViewScreen
      drawNameEventId={id}
      participantId={participantId}
      giftId={null}
    />
  );
}

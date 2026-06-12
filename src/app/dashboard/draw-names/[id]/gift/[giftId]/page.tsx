import type { Metadata } from "next";
import DrawNameGiftViewScreen from "@/screens/draw-names/DrawNameGiftViewScreen";

type DrawNameGiftDetailPageProps = {
  params: Promise<{
    id: string;
    giftId: string;
  }>;
  searchParams: Promise<{
    participantId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "View Gift",
    description: "View one selected gift for the participant you are paired with",
  };
}

export default async function DrawNameGiftDetailPage({
  params,
  searchParams,
}: DrawNameGiftDetailPageProps) {
  const { id, giftId } = await params;
  const resolvedSearchParams = await searchParams;
  const participantId = resolvedSearchParams.participantId?.trim() || null;

  return (
    <DrawNameGiftViewScreen
      drawNameEventId={id}
      participantId={participantId}
      giftId={giftId}
    />
  );
}

import { Suspense } from "react";
import GiftItemDetailsScreen from "@/screens/gifts/GiftItemDetailsScreen";

type GiftItemPageProps = {
  params: Promise<{
    giftItemId: string;
  }>;
  searchParams?: Promise<{
    tab?: string | string[];
  }>;
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function GiftItemPage({
  params,
  searchParams,
}: GiftItemPageProps) {
  const { giftItemId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const tab = firstValue(resolvedSearchParams?.tab);

  return (
    <Suspense fallback={null}>
      <GiftItemDetailsScreen
        giftItemId={giftItemId}
        tab={(tab === "sent" ? "sent" : "received")}
      />
    </Suspense>
  );
}

import type { Metadata } from "next";
import WishListGiftViewScreen from "@/screens/wish-list/WishListGiftViewScreen";

type WishListGiftDetailPageProps = {
  params: Promise<{
    id: string;
    giftId: string;
  }>;
  searchParams: Promise<{
    productId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "View Gift",
    description: "View one selected gift for this wish list event",
  };
}

export default async function WishListGiftDetailPage({
  params,
  searchParams,
}: WishListGiftDetailPageProps) {
  const { id, giftId } = await params;
  const resolvedSearchParams = await searchParams;
  const productId = resolvedSearchParams.productId?.trim() || null;

  return (
    <WishListGiftViewScreen
      wishlistEventId={id}
      giftId={giftId}
      productId={productId}
    />
  );
}
